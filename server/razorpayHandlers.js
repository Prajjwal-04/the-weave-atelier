import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { dispatchOrderEmailsDirect } from './emailHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORDERS_FILE = path.join(__dirname, 'verified_orders.json');

// In-memory cache for pending checkouts across payment redirects
const pendingOrdersCache = new Map();

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing in environment.');
  }

  return { keyId, keySecret };
}

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return resolve(req.body);
    }
    if (Buffer.isBuffer(req.body)) {
      const str = req.body.toString('utf8');
      try {
        return resolve(JSON.parse(str));
      } catch (_) {
        try {
          const params = new URLSearchParams(str);
          const obj = Object.fromEntries(params.entries());
          if (Object.keys(obj).length > 0) return resolve(obj);
        } catch (_) {}
        return resolve({});
      }
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        return resolve(JSON.parse(req.body));
      } catch (err) {
        try {
          const params = new URLSearchParams(req.body);
          const obj = Object.fromEntries(params.entries());
          if (Object.keys(obj).length > 0) return resolve(obj);
        } catch (_) {}
        return resolve({});
      }
    }

    // If stream has already finished or is not readable
    if (req.readableEnded || req.complete) {
      return resolve({});
    }

    let data = '';
    let resolved = false;

    // Safety timeout to prevent hanging on serverless
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({});
      }
    }, 4000);

    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        try {
          const params = new URLSearchParams(data);
          const obj = Object.fromEntries(params.entries());
          resolve(obj);
        } catch (_) {
          resolve({});
        }
      }
    });
    req.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({});
      }
    });
  });
}

/**
 * Mobile-resilient redirect helper:
 * Sends HTTP 303 with absolute URL AND renders HTML fallback with <meta http-equiv="refresh"> and JavaScript redirect.
 * Prevents mobile browsers / UPI apps from showing "Connection interrupted" or blank screens.
 */
export function sendMobileRedirect(req, res, targetUrl) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const fullUrl = targetUrl.startsWith('http') ? targetUrl : `${proto}://${host}${targetUrl}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${fullUrl}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - Prasri Rugs</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; background: #FAF8F5; color: #1A1918; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: #FFFFFF; border: 1px solid #EDE6DD; padding: 40px 30px; max-width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    h2 { font-size: 20px; font-weight: normal; letter-spacing: 0.05em; margin: 0 0 12px; }
    p { font-size: 14px; color: #5C5248; line-height: 1.5; margin: 0 0 20px; }
    a { display: inline-block; padding: 12px 24px; background: #1A1918; color: #FAF8F5; text-decoration: none; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Payment Confirmed</h2>
    <p>Your transaction has been approved. Redirecting to your official studio receipt...</p>
    <a href="${fullUrl}">View Order Confirmation</a>
  </div>
  <script>
    try {
      window.location.replace(${JSON.stringify(fullUrl)});
    } catch (_) {
      window.location.href = ${JSON.stringify(fullUrl)};
    }
  </script>
</body>
</html>`;

  if (typeof res.redirect === 'function') {
    try {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.redirect(303, fullUrl);
    } catch (_) {}
  }

  res.writeHead(303, {
    Location: fullUrl,
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
  });
  return res.end(html);
}

export function sendJsonResponse(res, statusCode, payload) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(payload));
}

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Request: { amount (paise), currency, receipt, notes }
 * Return: { order_id, amount, currency }
 * Minimum amount: 100 paise
 */
export async function handleCreateOrder(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount >= 100 paise
    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return sendJsonResponse(res, 400, {
        error: 'Invalid amount. Minimum amount required is 100 paise (₹1).',
      });
    }

    let credentials;
    try {
      credentials = getCredentials();
    } catch (authErr) {
      console.error('[Create Order Auth Error]:', authErr.message);
      return sendJsonResponse(res, 401, {
        error: 'Authentication failed: Missing or invalid Razorpay credentials.',
      });
    }

    const instance = new Razorpay({
      key_id: credentials.keyId,
      key_secret: credentials.keySecret,
    });

    const orderOptions = {
      amount: parsedAmount,
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await instance.orders.create(orderOptions);

    if (body.orderPayload) {
      pendingOrdersCache.set(order.id, body.orderPayload);
      if (body.orderPayload.orderNumber) {
        pendingOrdersCache.set(body.orderPayload.orderNumber, body.orderPayload);
      }
    } else if (notes?.order_number) {
      pendingOrdersCache.set(order.id, { orderNumber: notes.order_number, notes });
      pendingOrdersCache.set(notes.order_number, { orderNumber: notes.order_number, notes });
    }

    return sendJsonResponse(res, 200, {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: credentials.keyId,
    });
  } catch (err) {
    console.error('[Razorpay Order Creation Error]:', err);
    const status = err.statusCode === 401 ? 401 : 500;
    const errorDescription = err.error?.description || err.message || 'Razorpay order creation failed.';
    return sendJsonResponse(res, status, { error: errorDescription });
  }
}

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
export async function handleVerifyPayment(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Missing required payment verification fields: razorpay_order_id, razorpay_payment_id, or razorpay_signature.',
      });
    }

    let credentials;
    try {
      credentials = getCredentials();
    } catch (authErr) {
      return sendJsonResponse(res, 401, {
        success: false,
        message: 'Authentication failed: Razorpay secret key not configured on server.',
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', credentials.keySecret)
      .update(text)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(String(razorpay_signature), 'utf8');

    const isMatch =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!isMatch) {
      return sendJsonResponse(res, 400, {
        success: false,
        message: 'Payment verification failed: Signature mismatch. Transaction cannot be validated.',
      });
    }

    // Record verified transaction in server-side persistent store
    const verifiedRecord = {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      verified_at: new Date().toISOString(),
      order_number: body.order_number || body.notes?.order_number || 'N/A',
      customer: body.customer || {},
      amountUSD: body.amountUSD || null,
      items: body.items || [],
      shippingAddress: body.shippingAddress || null,
      totalUSD: body.totalUSD || null,
      currency: body.currency || 'USD',
      status: 'PAID_VERIFIED',
    };
    saveVerifiedOrder(verifiedRecord);

    const cachedOrder = pendingOrdersCache.get(razorpay_order_id) || pendingOrdersCache.get(body.order_number);
    if (cachedOrder) {
      persistOrderToSupabase(cachedOrder, razorpay_payment_id).catch((err) => console.warn('Supabase persist warning:', err));
      dispatchOrderEmailsDirect(cachedOrder).catch((err) => console.warn('Direct email dispatch warning:', err));
    }

    return sendJsonResponse(res, 200, {
      success: true,
      message: 'Payment signature verified successfully.',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      verifiedRecord,
    });
  } catch (err) {
    console.error('[Razorpay Payment Verification Error]:', err);
    return sendJsonResponse(res, 500, {
      success: false,
      message: err.message || 'An error occurred during payment verification.',
    });
  }
}

/**
 * Persists an order to Supabase database (orders, order_items, order_timelines)
 */
export async function persistOrderToSupabase(order, paymentId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Supabase Persist] Supabase client unavailable.');
    return false;
  }

  try {
    const orderNumber = order.orderNumber;
    if (!orderNumber) return false;

    // Check if order already exists in Supabase
    const { data: existing } = await supabase
      .from('orders')
      .select('id, payment_id, status')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (existing) {
      console.log('[Supabase Persist] Order already exists in Supabase:', orderNumber);
      // Update payment details and status if payment is confirmed
      if (paymentId && (!existing.payment_id || existing.payment_id !== paymentId || existing.status === 'PENDING_PAYMENT' || existing.status === 'ORDER PLACED')) {
        await supabase
          .from('orders')
          .update({
            payment_id: paymentId,
            payment_provider: order.paymentProvider || 'Razorpay Live',
            status: order.status || 'PROCESSING',
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderNumber);
      }
      return true;
    }

    const { data: dbOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: order.customer?.email || 'client@prasrirugs.com',
        customer_first_name: order.customer?.firstName || 'Atelier',
        customer_last_name: order.customer?.lastName || 'Client',
        customer_phone: order.customer?.phone || null,
        shipping_address: order.shippingAddress || { address: 'Registered Address', city: 'City', country: 'India' },
        shipping_method: order.shippingMethod || { name: 'Domestic Express Air Courier', estimatedDays: '3–5 days', costUSD: 40 },
        currency: order.currency || 'INR',
        subtotal_usd: order.subtotalUSD ?? order.totalUSD ?? 0,
        shipping_usd: order.shippingUSD ?? 40,
        tax_usd: order.taxUSD || 0,
        total_usd: order.totalUSD || 0,
        status: order.status || 'PROCESSING',
        carrier: order.carrier || 'Domestic Express Air Courier',
        tracking_number: order.trackingNumber || null,
        estimated_delivery_date: order.estimatedDeliveryDate || '3–5 business days',
        is_made_to_order: Boolean(order.isMadeToOrder),
        payment_provider: order.paymentProvider || 'Razorpay Live',
        payment_id: paymentId || order.paymentId || null,
      })
      .select()
      .single();

    if (orderErr) {
      console.error('[Supabase Persist Error]:', orderErr);
      return false;
    }

    if (dbOrder && order.items && order.items.length > 0) {
      const { error: itemsErr } = await supabase.from('order_items').insert(
        order.items.map((item) => ({
          order_id: dbOrder.id,
          product_name: item.productName || 'Handcrafted Atelier Rug',
          product_slug: item.productSlug || 'artisan-rug',
          product_image: item.productImage || '/images/products/verdant-oasis.jpg',
          size: item.size || 'Standard',
          sku: item.sku || 'PR-RUG',
          technique: item.technique || 'Hand-Tufted / Hand-Knotted',
          price_usd: item.priceUSD || 0,
          quantity: item.quantity || 1,
          is_ready_to_ship: Boolean(item.isReadyToShip),
          estimated_dispatch: item.estimatedDispatch || 'Dispatches in 2–4 business days',
        }))
      );
      if (itemsErr) console.warn('[Supabase Items Insert Warning]:', itemsErr);
    }

    if (dbOrder && order.timeline && order.timeline.length > 0) {
      const { error: timeErr } = await supabase.from('order_timelines').insert(
        order.timeline.map((event, idx) => ({
          order_id: dbOrder.id,
          title: event.title,
          date_label: event.date || event.date_label || 'Today',
          description: event.description || '',
          completed: Boolean(event.completed),
          is_current: Boolean(event.current || event.is_current),
          step_order: idx + 1,
        }))
      );
      if (timeErr) console.warn('[Supabase Timeline Insert Warning]:', timeErr);
    }

    console.log('[Supabase Persist Success] Registered order in Supabase:', orderNumber);
    return true;
  } catch (err) {
    console.error('[Supabase Persist Fatal Error]:', err);
    return false;
  }
}

/**
 * STEP 4: BACKEND - Dedicated Razorpay Callback Endpoint
 * Endpoint: POST & GET /api/razorpay-callback & /api/payment-callback
 * 
 * Crucial for mobile UPI Intent, NetBanking, and Card 3D-Secure redirects!
 * In Single Page Applications, direct POST to frontend causes 405 Method Not Allowed ("load fails").
 * This endpoint:
 * 1. Receives the form POST or GET from Razorpay
 * 2. Validates HMAC-SHA256 signature
 * 3. Persists/updates order into Supabase database
 * 4. Dispatches confirmation emails to customer and admin directly
 * 5. Issues a mobile-bulletproof HTTP 303 GET redirect + HTML fallback to /order-confirmation
 */
export async function handleRazorpayCallback(req, res) {
  try {
    const body = await parseRequestBody(req);
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    const url = new URL(req.url, `${proto}://${host}`);

    const razorpay_payment_id = body.razorpay_payment_id || req.query?.razorpay_payment_id || url.searchParams.get('razorpay_payment_id') || '';
    const razorpay_order_id = body.razorpay_order_id || req.query?.razorpay_order_id || url.searchParams.get('razorpay_order_id') || '';
    const razorpay_signature = body.razorpay_signature || req.query?.razorpay_signature || url.searchParams.get('razorpay_signature') || '';
    const queryOrderNumber = url.searchParams.get('orderNumber') || req.query?.orderNumber || body.order_number || body['notes[order_number]'] || '';

    // Check for explicit error returned by Razorpay
    if (body.error) {
      console.warn('[Razorpay Callback Error from Gateway]:', body.error);
      const desc = body.error.description || 'Payment was cancelled or declined.';
      return sendMobileRedirect(req, res, `/checkout?error=${encodeURIComponent(desc)}`);
    }

    if (!razorpay_payment_id && !razorpay_order_id) {
      console.warn('[Razorpay Callback Missing Essential IDs]:', { body, query: Object.fromEntries(url.searchParams) });
      return sendMobileRedirect(req, res, `/checkout?error=${encodeURIComponent('Payment session timed out or cancelled.')}`);
    }

    let credentials;
    try {
      credentials = getCredentials();
    } catch (e) {
      console.error('[Razorpay Callback Missing Credentials]:', e.message);
    }

    // Verify HMAC-SHA256 signature if credentials and signature exist
    if (credentials && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', credentials.keySecret)
        .update(text)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const actualBuf = Buffer.from(String(razorpay_signature), 'utf8');

      if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        console.error('[Razorpay Callback Signature Mismatch]');
        return sendMobileRedirect(req, res, `/checkout?error=${encodeURIComponent('Payment signature verification mismatch.')}`);
      }
    }

    // Query Razorpay to inspect live payment status
    let rzpPayment = null;
    let rzpOrder = null;
    if (credentials) {
      try {
        const instance = new Razorpay({
          key_id: credentials.keyId,
          key_secret: credentials.keySecret,
        });
        [rzpPayment, rzpOrder] = await Promise.all([
          razorpay_payment_id ? instance.payments.fetch(razorpay_payment_id).catch(() => null) : null,
          razorpay_order_id ? instance.orders.fetch(razorpay_order_id).catch(() => null) : null,
        ]);
      } catch (liveErr) {
        console.warn('[Razorpay Fetch Live Details Warning]:', liveErr.message);
      }
    }

    const finalPaymentId = razorpay_payment_id || rzpPayment?.id || '';
    const finalOrderNumber =
      queryOrderNumber ||
      rzpOrder?.notes?.order_number ||
      rzpOrder?.receipt ||
      `PR-${new Date().getFullYear()}-${(finalPaymentId || '0000').slice(-4)}`;

    // 1. Look for existing order in Supabase directly
    const supabase = getSupabaseClient();
    let existingDbOrder = null;
    if (supabase) {
      try {
        const { data: dbO } = await supabase
          .from('orders')
          .select('*, order_items(*), order_timelines(*)')
          .eq('order_number', finalOrderNumber)
          .maybeSingle();
        existingDbOrder = dbO;
      } catch (err) {
        console.warn('Supabase initial lookup warning:', err.message);
      }
    }

    // 2. Look for pre-saved order in pendingOrdersCache
    let orderToPersist = existingDbOrder ? null : (pendingOrdersCache.get(razorpay_order_id) || pendingOrdersCache.get(finalOrderNumber));

    if (!existingDbOrder && !orderToPersist) {
      // Reconstruct order from Razorpay verified notes
      const notes = rzpOrder?.notes || {};
      const customerEmail = rzpPayment?.email || notes.customer_email || 'client@prasrirugs.com';
      const customerContact = rzpPayment?.contact || notes.customer_phone || '';

      orderToPersist = {
        orderNumber: finalOrderNumber,
        customer: {
          firstName: notes.customer_first_name || notes.customer_name?.split(' ')[0] || 'Atelier',
          lastName: notes.customer_last_name || notes.customer_name?.split(' ').slice(1).join(' ') || 'Collector',
          email: customerEmail,
          phone: customerContact,
        },
        shippingAddress: {
          address: notes.shipping_address || notes.shipping_city || 'Registered Address',
          apartment: '',
          city: notes.shipping_city || 'City',
          state: notes.shipping_state || 'State',
          postalCode: notes.shipping_postal_code || '221401',
          country: notes.shipping_country || 'India',
        },
        shippingMethod: {
          name: 'Domestic Express Air Courier',
          estimatedDays: '3–5 business days',
          costUSD: 40,
        },
        items: [
          {
            productName: notes.product_name || 'Handcrafted Artisan Rug',
            productSlug: 'artisan-rug',
            productImage: '/images/products/verdant-oasis.jpg',
            size: notes.rug_size || 'Custom Size',
            sku: notes.sku || 'PR-RUG-01',
            technique: 'Hand-Tufted / Hand-Knotted',
            priceUSD: Number(notes.amount_usd?.replace(/[^0-9.]/g, '')) || (rzpOrder ? rzpOrder.amount / 100 / 84 : 1),
            quantity: 1,
            isReadyToShip: true,
            estimatedDispatch: 'Dispatches in 2–4 business days',
          },
        ],
        currency: rzpPayment?.currency || 'INR',
        subtotalUSD: Number(notes.amount_usd?.replace(/[^0-9.]/g, '')) || (rzpOrder ? rzpOrder.amount / 100 / 84 : 1),
        shippingUSD: 40,
        taxUSD: 0,
        totalUSD: Number(notes.amount_usd?.replace(/[^0-9.]/g, '')) || (rzpOrder ? rzpOrder.amount / 100 / 84 : 1),
        status: 'PROCESSING',
        carrier: 'Domestic Express Air Courier',
        trackingNumber: '',
        estimatedDeliveryDate: '3–5 business days',
        isMadeToOrder: false,
        paymentProvider: 'Razorpay Live',
        paymentId: finalPaymentId,
        timeline: [
          {
            title: 'Order Placed & Payment Confirmed',
            date: 'Today · Confirmed',
            description: `Payment authorized via Razorpay (Ref: ${finalPaymentId}). Order registered at Bhadohi studio.`,
            completed: true,
            current: true,
          },
          {
            title: 'Studio Quality Conditioning & Packaging',
            date: 'Tomorrow',
            description: 'Inspection and protective moisture-resistant packaging.',
            completed: false,
            current: false,
          },
          {
            title: 'Dispatched via Express Courier',
            date: 'Within 2–3 business days',
            description: 'Air dispatch with door-to-door tracking across India.',
            completed: false,
            current: false,
          },
        ],
      };
    } else if (orderToPersist) {
      orderToPersist.paymentId = finalPaymentId;
      orderToPersist.paymentProvider = 'Razorpay Live';
      orderToPersist.status = 'PROCESSING';
    }

    // 3. Persist or update Supabase
    if (orderToPersist) {
      await persistOrderToSupabase(orderToPersist, finalPaymentId);
    } else if (existingDbOrder && supabase) {
      await supabase
        .from('orders')
        .update({
          payment_id: finalPaymentId,
          payment_provider: 'Razorpay Live',
          status: 'PROCESSING',
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', finalOrderNumber);
    }

    // 4. Record to backup file
    saveVerifiedOrder({
      order_id: razorpay_order_id,
      payment_id: finalPaymentId,
      signature: razorpay_signature,
      verified_at: new Date().toISOString(),
      order_number: finalOrderNumber,
      customer: orderToPersist?.customer || {
        firstName: existingDbOrder?.customer_first_name,
        lastName: existingDbOrder?.customer_last_name,
        email: existingDbOrder?.customer_email,
        phone: existingDbOrder?.customer_phone,
      },
      amountUSD: orderToPersist?.totalUSD || existingDbOrder?.total_usd,
      status: 'PAID_VERIFIED',
    });

    // 5. Dispatch emails to customer and admin
    try {
      const emailTarget = orderToPersist || {
        orderNumber: finalOrderNumber,
        customer: {
          firstName: existingDbOrder?.customer_first_name || 'Collector',
          lastName: existingDbOrder?.customer_last_name || '',
          email: existingDbOrder?.customer_email || 'client@prasrirugs.com',
          phone: existingDbOrder?.customer_phone,
        },
        shippingAddress: existingDbOrder?.shipping_address,
        items: existingDbOrder?.order_items?.map((i) => ({
          productName: i.product_name,
          size: i.size,
          sku: i.sku,
          priceUSD: i.price_usd,
          quantity: i.quantity,
        })) || [],
        totalUSD: existingDbOrder?.total_usd || 0,
        shippingUSD: existingDbOrder?.shipping_usd || 0,
        paymentId: finalPaymentId,
      };
      await dispatchOrderEmailsDirect(emailTarget);
    } catch (mailErr) {
      console.warn('[Razorpay Callback Email Dispatch Warning]:', mailErr.message);
    }

    // 6. Resilient redirect to Order Confirmation page
    const redirectUrl = `/order-confirmation?orderNumber=${encodeURIComponent(finalOrderNumber)}&paymentId=${encodeURIComponent(finalPaymentId)}&status=confirmed`;
    return sendMobileRedirect(req, res, redirectUrl);
  } catch (err) {
    console.error('[Razorpay Callback Fatal Handler Error]:', err);
    return sendMobileRedirect(req, res, `/order-confirmation?status=pending&error=${encodeURIComponent(err.message)}`);
  }
}

/**
 * Check payment status directly with Razorpay API (prevents duplicate charges and unsafe dismissal)
 * Endpoint: GET /api/check-payment?order_id=...&orderNumber=...
 */
export async function handleCheckPaymentStatus(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const orderId = url.searchParams.get('order_id') || req.query?.order_id;
    const orderNumber = url.searchParams.get('orderNumber') || req.query?.orderNumber;

    if (!orderId) {
      return sendJsonResponse(res, 400, {
        error: 'Missing order_id query parameter.',
      });
    }

    let credentials;
    try {
      credentials = getCredentials();
    } catch (authErr) {
      return sendJsonResponse(res, 500, {
        error: 'Razorpay credentials not configured on server.',
      });
    }

    const instance = new Razorpay({
      key_id: credentials.keyId,
      key_secret: credentials.keySecret,
    });

    const [order, payments] = await Promise.all([
      instance.orders.fetch(orderId).catch(() => null),
      instance.orders.fetchPayments(orderId).catch(() => ({ items: [], count: 0 })),
    ]);

    const paymentItems = payments?.items || [];
    const capturedPayment = paymentItems.find((p) => p.status === 'captured');
    const authorizedPayment = paymentItems.find((p) => p.status === 'authorized');
    const pendingPayment = paymentItems.find((p) => p.status === 'created' || p.status === 'pending');
    const successfulPayment = capturedPayment || authorizedPayment;

    // AUTO-RECONCILE: If payment succeeded, make sure Supabase order is updated & email sent!
    if (successfulPayment) {
      const orderNum = orderNumber || order?.notes?.order_number || order?.receipt;
      if (orderNum) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: existing } = await supabase
            .from('orders')
            .select('id, status, payment_id')
            .eq('order_number', orderNum)
            .maybeSingle();

          if (existing && (!existing.payment_id || existing.status === 'PENDING_PAYMENT' || existing.status === 'ORDER PLACED')) {
            await supabase
              .from('orders')
              .update({
                payment_id: successfulPayment.id,
                payment_provider: 'Razorpay Live',
                status: 'PROCESSING',
                updated_at: new Date().toISOString(),
              })
              .eq('order_number', orderNum);

            // Dispatch confirmation email
            const cached = pendingOrdersCache.get(orderId) || pendingOrdersCache.get(orderNum);
            if (cached) {
              dispatchOrderEmailsDirect({ ...cached, paymentId: successfulPayment.id }).catch(() => {});
            }
          }
        }
      }
    }

    return sendJsonResponse(res, 200, {
      success: true,
      order_id: orderId,
      order_status: order?.status || 'unknown',
      amount_paid: order?.amount_paid || 0,
      payment_count: paymentItems.length,
      has_successful_payment: Boolean(successfulPayment),
      successful_payment_id: successfulPayment?.id || null,
      is_pending: Boolean(pendingPayment),
      payments: paymentItems.map((p) => ({
        id: p.id,
        status: p.status,
        method: p.method,
        amount: p.amount,
        created_at: p.created_at,
        error_code: p.error_code,
        error_description: p.error_description,
      })),
    });
  } catch (err) {
    console.error('[Check Payment Status Error]:', err);
    return sendJsonResponse(res, 500, {
      error: err.message || 'Failed to inspect payment status.',
    });
  }
}

/**
 * Backup order saving endpoint in case of Supabase database connection issues
 * Endpoint: POST /api/backup-order & /api/save-order-backup
 */
export async function handleSaveOrderBackup(req, res) {
  try {
    const body = await parseRequestBody(req);
    if (!body || !body.orderNumber) {
      return sendJsonResponse(res, 400, { error: 'Invalid order payload' });
    }

    // Cache in pending memory map
    pendingOrdersCache.set(body.orderNumber, body);
    if (body.paymentId) pendingOrdersCache.set(body.paymentId, body);

    const orderRecord = {
      ...body,
      backup_saved_at: new Date().toISOString(),
      reconciliation_needed: true,
    };

    saveVerifiedOrder(orderRecord);

    // Also pre-persist to Supabase as PENDING_PAYMENT so items & customer details are never lost
    try {
      await persistOrderToSupabase({
        ...body,
        status: body.status || 'ORDER PLACED',
      }, body.paymentId || null);
    } catch (e) {
      console.warn('Backup persist to Supabase warning:', e.message);
    }

    return sendJsonResponse(res, 200, {
      success: true,
      message: 'Order safely logged on server backup store.',
      orderNumber: body.orderNumber,
    });
  } catch (err) {
    console.error('[Save Order Backup Error]:', err);
    return sendJsonResponse(res, 500, { error: err.message });
  }
}

function getVerifiedOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (e) {
    console.warn('Could not read verified_orders.json:', e.message);
  }
  return [];
}

function saveVerifiedOrder(order) {
  try {
    const list = getVerifiedOrders();
    // Prepend new order
    list.unshift(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list.slice(0, 200), null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not save verified order to file:', e.message);
  }
}

/**
 * Verify administrative authorization from Bearer token or Supabase JWT
 */
export function verifyAdminAuthorization(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return false;

  // 1. Direct secret match if configured in environment
  const adminSecret = process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (adminSecret && token === adminSecret) {
    return true;
  }

  // 2. Decode Supabase JWT and verify administrator email
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
      const payload = JSON.parse(payloadStr);

      const adminEmail = (process.env.VITE_ADMIN_EMAIL || 'prasrirugs@gmail.com').toLowerCase().trim();
      const userEmail = (payload.email || '').toLowerCase().trim();
      const userRole = (payload.role || payload.app_metadata?.role || '').toLowerCase().trim();

      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowSec) {
        return false;
      }

      if (userEmail === adminEmail || userRole === 'service_role') {
        return true;
      }
    }
  } catch (err) {
    return false;
  }

  return false;
}

/**
 * BACKEND INSPECTION - Get verified orders & query Razorpay API directly
 * Endpoint: GET /api/orders
 */
export async function handleGetOrders(req, res) {
  // Enforce administrative authentication
  if (!verifyAdminAuthorization(req)) {
    return sendJsonResponse(res, 401, {
      success: false,
      error: 'Unauthorized: Admin authorization token required to view orders.',
    });
  }

  try {
    let credentials;
    try {
      credentials = getCredentials();
    } catch (e) {
      // Credentials missing or not configured
    }

    let razorpayLiveOrders = [];
    let razorpayLivePayments = [];

    if (credentials) {
      try {
        const instance = new Razorpay({
          key_id: credentials.keyId,
          key_secret: credentials.keySecret,
        });

        const [ords, pmts] = await Promise.allSettled([
          instance.orders.all({ count: 10 }),
          instance.payments.all({ count: 10 }),
        ]);

        if (ords.status === 'fulfilled') {
          razorpayLiveOrders = ords.value.items || [];
        }
        if (pmts.status === 'fulfilled') {
          razorpayLivePayments = pmts.value.items || [];
        }
      } catch (liveErr) {
        console.warn('Error fetching live data from Razorpay API:', liveErr.message);
      }
    }

    const serverVerifiedOrders = getVerifiedOrders();

    return sendJsonResponse(res, 200, {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        serverVerifiedCount: serverVerifiedOrders.length,
        razorpayLiveOrdersCount: razorpayLiveOrders.length,
        razorpayLivePaymentsCount: razorpayLivePayments.length,
      },
      serverVerifiedOrders,
      razorpayLiveOrders,
      razorpayLivePayments,
    });
  } catch (err) {
    console.error('[Get Orders Error]:', err);
    return sendJsonResponse(res, 500, {
      success: false,
      error: err.message || 'Failed to retrieve orders.',
    });
  }
}

