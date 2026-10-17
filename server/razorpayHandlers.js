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
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
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
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
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
    req.on('error', () => resolve({}));
  });
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
      .select('id')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (existing) {
      console.log('[Supabase Persist] Order already exists in Supabase:', orderNumber);
      return true;
    }

    const { data: dbOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: order.customer?.email || 'collector@example.com',
        customer_first_name: order.customer?.firstName || 'Atelier',
        customer_last_name: order.customer?.lastName || 'Client',
        customer_phone: order.customer?.phone || null,
        shipping_address: order.shippingAddress || { address: 'Registered Address', city: 'City', country: 'India' },
        shipping_method: order.shippingMethod || { name: 'Domestic Express Air Courier', estimatedDays: '3–5 days', costUSD: 0 },
        currency: order.currency || 'INR',
        subtotal_usd: order.subtotalUSD || order.totalUSD || 0,
        shipping_usd: order.shippingUSD || 0,
        tax_usd: order.taxUSD || 0,
        total_usd: order.totalUSD || 0,
        status: order.status || 'PROCESSING',
        carrier: order.carrier || 'Domestic Express Air Courier',
        tracking_number: order.trackingNumber || `TWA-EXP-${orderNumber.replace(/[^0-9]/g, '')}`,
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
          sku: item.sku || 'TWA-RUG',
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
 * Endpoint: POST & GET /api/razorpay-callback
 * 
 * Crucial for mobile UPI Intent, NetBanking, and Card 3D-Secure redirects!
 * In Single Page Applications, direct POST to frontend causes 405 Method Not Allowed ("load fails").
 * This endpoint:
 * 1. Receives the form POST or GET from Razorpay
 * 2. Validates HMAC-SHA256 signature
 * 3. Persists order into Supabase database
 * 4. Dispatches confirmation emails to customer and admin directly
 * 5. Issues an HTTP 303 GET redirect to /order-confirmation?orderNumber=...
 */
export async function handleRazorpayCallback(req, res) {
  try {
    const body = await parseRequestBody(req);
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    const razorpay_payment_id = body.razorpay_payment_id || url.searchParams.get('razorpay_payment_id') || '';
    const razorpay_order_id = body.razorpay_order_id || url.searchParams.get('razorpay_order_id') || '';
    const razorpay_signature = body.razorpay_signature || url.searchParams.get('razorpay_signature') || '';
    const queryOrderNumber = url.searchParams.get('orderNumber') || body.order_number || body['notes[order_number]'] || '';

    // Check for explicit error returned by Razorpay
    if (body.error) {
      console.warn('[Razorpay Callback Error from Gateway]:', body.error);
      const desc = body.error.description || 'Payment was cancelled or declined.';
      res.writeHead(303, { Location: `/checkout?error=${encodeURIComponent(desc)}` });
      return res.end();
    }

    if (!razorpay_payment_id || !razorpay_order_id) {
      console.warn('[Razorpay Callback Missing Essential IDs]:', { body, query: Object.fromEntries(url.searchParams) });
      res.writeHead(303, { Location: `/checkout?error=${encodeURIComponent('Payment session timed out or cancelled.')}` });
      return res.end();
    }

    let credentials;
    try {
      credentials = getCredentials();
    } catch (e) {
      console.error('[Razorpay Callback Missing Credentials]:', e.message);
    }

    // Verify HMAC-SHA256 signature if credentials and signature exist
    if (credentials && razorpay_signature) {
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', credentials.keySecret)
        .update(text)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf8');
      const actualBuf = Buffer.from(String(razorpay_signature), 'utf8');

      if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        console.error('[Razorpay Callback Signature Mismatch]');
        res.writeHead(303, { Location: `/checkout?error=${encodeURIComponent('Payment signature verification mismatch.')}` });
        return res.end();
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
          instance.payments.fetch(razorpay_payment_id).catch(() => null),
          instance.orders.fetch(razorpay_order_id).catch(() => null),
        ]);
      } catch (liveErr) {
        console.warn('[Razorpay Fetch Live Details Warning]:', liveErr.message);
      }
    }

    const finalOrderNumber =
      queryOrderNumber ||
      rzpOrder?.notes?.order_number ||
      rzpOrder?.receipt ||
      `PR-${new Date().getFullYear()}-${razorpay_payment_id.slice(-4)}`;

    // Look for full pre-saved pending order
    let orderToPersist = pendingOrdersCache.get(razorpay_order_id) || pendingOrdersCache.get(finalOrderNumber);

    if (!orderToPersist) {
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
          costUSD: 0,
        },
        items: [
          {
            productName: notes.product_name || 'Handcrafted Artisan Rug',
            productSlug: 'artisan-rug',
            productImage: '/images/products/verdant-oasis.jpg',
            size: notes.rug_size || 'Custom Size',
            sku: notes.sku || 'TWA-RUG-01',
            technique: 'Hand-Tufted / Hand-Knotted',
            priceUSD: Number(notes.amount_usd?.replace(/[^0-9.]/g, '')) || (rzpOrder ? rzpOrder.amount / 100 / 84 : 1),
            quantity: 1,
            isReadyToShip: true,
            estimatedDispatch: 'Dispatches in 2–4 business days',
          },
        ],
        currency: rzpPayment?.currency || 'INR',
        subtotalUSD: Number(notes.amount_usd?.replace(/[^0-9.]/g, '')) || 1,
        shippingUSD: 0,
        taxUSD: 0,
        totalUSD: Number(notes.amount_usd?.replace(/[^0-9.]/g, '')) || 1,
        status: 'PROCESSING',
        carrier: 'Domestic Express Air Courier',
        trackingNumber: `TWA-EXP-${finalOrderNumber.replace(/[^0-9]/g, '')}`,
        estimatedDeliveryDate: '3–5 business days',
        isMadeToOrder: false,
        paymentProvider: 'Razorpay Live',
        paymentId: razorpay_payment_id,
        timeline: [
          {
            title: 'Order Placed & Payment Confirmed',
            date: 'Today · Confirmed',
            description: `Payment authorized via Razorpay UPI (Ref: ${razorpay_payment_id}). Order registered at Bhadohi studio.`,
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
    } else {
      orderToPersist.paymentId = razorpay_payment_id;
      orderToPersist.paymentProvider = 'Razorpay Live';
    }

    // 1. Persist to Supabase
    await persistOrderToSupabase(orderToPersist, razorpay_payment_id);

    // 2. Persist to server backup file
    saveVerifiedOrder({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      verified_at: new Date().toISOString(),
      order_number: finalOrderNumber,
      customer: orderToPersist.customer,
      amountUSD: orderToPersist.totalUSD,
      status: 'PAID_VERIFIED',
    });

    // 3. Dispatch emails to customer and admin
    try {
      await dispatchOrderEmailsDirect(orderToPersist);
    } catch (mailErr) {
      console.warn('[Razorpay Callback Email Dispatch Warning]:', mailErr.message);
    }

    // 4. HTTP 303 Redirect to Order Confirmation page (converts POST to clean GET)
    const redirectUrl = `/order-confirmation?orderNumber=${encodeURIComponent(finalOrderNumber)}&paymentId=${encodeURIComponent(razorpay_payment_id)}&status=confirmed`;
    res.writeHead(303, { Location: redirectUrl });
    return res.end();
  } catch (err) {
    console.error('[Razorpay Callback Fatal Handler Error]:', err);
    res.writeHead(303, { Location: `/order-confirmation?status=pending&error=${encodeURIComponent(err.message)}` });
    return res.end();
  }
}

/**
 * Check payment status directly with Razorpay API (prevents duplicate charges and unsafe dismissal)
 * Endpoint: GET /api/check-payment?order_id=...
 */
export async function handleCheckPaymentStatus(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const orderId = url.searchParams.get('order_id') || req.query?.order_id;

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

    return sendJsonResponse(res, 200, {
      success: true,
      order_id: orderId,
      order_status: order?.status || 'unknown',
      amount_paid: order?.amount_paid || 0,
      payment_count: paymentItems.length,
      has_successful_payment: Boolean(capturedPayment || authorizedPayment),
      successful_payment_id: (capturedPayment || authorizedPayment)?.id || null,
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
 * Endpoint: POST /api/save-order-backup
 */
export async function handleSaveOrderBackup(req, res) {
  try {
    const body = await parseRequestBody(req);
    if (!body || !body.orderNumber) {
      return sendJsonResponse(res, 400, { error: 'Invalid order payload' });
    }

    const orderRecord = {
      ...body,
      backup_saved_at: new Date().toISOString(),
      reconciliation_needed: true,
    };

    saveVerifiedOrder(orderRecord);

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

