import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORDERS_FILE = path.join(__dirname, 'verified_orders.json');

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing in environment.');
  }

  return { keyId, keySecret };
}

export function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    req.on('error', reject);
  });
}

export function sendJsonResponse(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
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

    return sendJsonResponse(res, 200, {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
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
    };
    saveVerifiedOrder(verifiedRecord);

    return sendJsonResponse(res, 200, {
      success: true,
      message: 'Payment signature verified successfully.',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (err) {
    console.error('[Razorpay Payment Verification Error]:', err);
    return sendJsonResponse(res, 500, {
      success: false,
      message: err.message || 'An error occurred during payment verification.',
    });
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
function verifyAdminAuthorization(req) {
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

