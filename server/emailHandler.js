import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { parseRequestBody, sendJsonResponse, verifyAdminAuthorization } from './razorpayHandlers.js';

dotenv.config();

let cachedTransporter = null;

// In-memory rate limiting map: ip -> [timestamps]
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_EXTERNAL_UNAUTH_PER_WINDOW = 5;

function cleanOldRateLimits() {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, valid);
    }
  }
}

function checkRateLimit(ip, maxLimit) {
  cleanOldRateLimits();
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= maxLimit) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

function getTransporter() {
  // Dynamically re-read .env in case user updated GMAIL_APP_PASSWORD while server is running
  dotenv.config({ override: true });

  const gmailUser = process.env.GMAIL_USER || process.env.VITE_ADMIN_EMAIL || 'prasrirugs@gmail.com';
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD || '').trim();

  if (!gmailPass) {
    return null;
  }

  // If password changed or not initialized, create new transporter
  if (!cachedTransporter || cachedTransporter._lastPass !== gmailPass) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s+/g, ''), // Clean any accidental whitespace in the 16-char app password
      },
    });
    cachedTransporter._lastPass = gmailPass;
  }

  return cachedTransporter;
}

/**
 * Direct Gmail SMTP Email Dispatch Handler
 * Endpoint: POST /api/send-email
 * Hardened with:
 * 1. Header injection prevention (stripping \r, \n)
 * 2. Rate limiting per IP
 * 3. Anti-relay protection: External recipients require admin authorization or recognized transactional pattern
 */
export async function handleSendEmail(req, res) {
  // Extract client IP
  const clientIp = (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  ).trim();

  // General rate limit check
  if (!checkRateLimit(clientIp, MAX_REQUESTS_PER_WINDOW)) {
    return sendJsonResponse(res, 429, {
      success: false,
      error: 'Rate limit exceeded: Too many email requests. Please try again in a few minutes.',
    });
  }

  try {
    const body = await parseRequestBody(req);
    const { to, subject, html, text, replyTo, fromName } = body;

    if (!to || !subject) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Missing required email fields: "to" and "subject" are required.',
      });
    }

    // Strip carriage returns and newlines to prevent SMTP header injection
    const cleanTo = String(to).replace(/[\r\n]/g, '').trim();
    const cleanSubject = String(subject).replace(/[\r\n]/g, '').trim();
    const cleanReplyTo = replyTo ? String(replyTo).replace(/[\r\n]/g, '').trim() : '';
    const cleanFromName = fromName ? String(fromName).replace(/[\r\n]/g, '').trim() : 'Prasri Rugs';

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanTo)) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Invalid recipient email address format.',
      });
    }

    const gmailUser = (process.env.GMAIL_USER || process.env.VITE_ADMIN_EMAIL || 'prasrirugs@gmail.com').toLowerCase().trim();
    const isTargetingAdmin = cleanTo.toLowerCase() === gmailUser || cleanTo.toLowerCase().includes('prasrirugs@gmail.com');
    const isAdminAuthenticated = verifyAdminAuthorization(req);

    // ANTI-RELAY CHECK:
    // If the recipient is NOT the store's admin email, verify that:
    // (a) Request is authenticated by store administrator, OR
    // (b) Request is an automated customer notification with a recognized atelier subject and strict rate limit
    if (!isTargetingAdmin && !isAdminAuthenticated) {
      const isRecognizedPattern =
        cleanSubject.toLowerCase().includes('prasri rugs') ||
        cleanSubject.toLowerCase().includes('order confirmation') ||
        cleanSubject.toLowerCase().includes('custom rug quote') ||
        cleanSubject.toLowerCase().includes('inquiry received');

      if (!isRecognizedPattern) {
        return sendJsonResponse(res, 403, {
          success: false,
          error: 'Access denied: External email dispatch requires administrator authorization.',
        });
      }

      // Enforce strict rate limit on unauthenticated external customer dispatches
      if (!checkRateLimit(`ext_${clientIp}`, MAX_EXTERNAL_UNAUTH_PER_WINDOW)) {
        return sendJsonResponse(res, 429, {
          success: false,
          error: 'External email dispatch limit exceeded. Please try again later.',
        });
      }
    }

    const transporter = getTransporter();

    // If Google App Password is not yet provided, return error with instructions
    if (!transporter) {
      console.warn(`[Gmail SMTP Warning] GMAIL_APP_PASSWORD is not set. Cannot dispatch email to: ${cleanTo}`);

      return sendJsonResponse(res, 503, {
        success: false,
        deliveredVia: 'unconfigured',
        error: 'Gmail dispatcher not configured on server. Add GMAIL_APP_PASSWORD to environment variables to activate live delivery.',
      });
    }

    // Send real email through Google's official mail servers
    const mailOptions = {
      from: `"${cleanFromName}" <${gmailUser}>`,
      to: cleanTo,
      subject: cleanSubject,
      text: text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''),
      html: html || undefined,
      replyTo: cleanReplyTo || gmailUser,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Gmail SMTP Sent] Successfully dispatched to ${cleanTo} (MessageId: ${info.messageId})`);

    return sendJsonResponse(res, 200, {
      success: true,
      deliveredVia: 'gmail_smtp',
      messageId: info.messageId,
      message: `Directly delivered to ${cleanTo} via official Gmail servers from ${gmailUser}.`,
    });
  } catch (error) {
    console.error('[Gmail SMTP Error]', error);
    return sendJsonResponse(res, 500, {
      success: false,
      error: error.message || 'Failed to dispatch email via Gmail SMTP.',
    });
  }
}

export function generateOrderEmailHtml(order) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #EDE6DD;">
          <strong>${item.productName || 'Artisan Rug'}</strong><br/>
          <span style="font-size: 11px; color: #8A7B6E;">Size: ${item.size || 'Custom'} · Qty: ${item.quantity || 1} · SKU: ${item.sku || 'N/A'}</span>
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #EDE6DD; font-family: monospace;">
          $${Number(item.priceUSD || 0).toLocaleString()} USD
        </td>
      </tr>`
    )
    .join('');

  return `
    <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; background: #FFFFFF; border: 1px solid #EDE6DD; padding: 35px; color: #1A1918;">
      <div style="text-align: center; border-bottom: 1px solid #EDE6DD; padding-bottom: 25px;">
        <h1 style="letter-spacing: 0.25em; font-size: 22px; font-weight: normal; margin: 0;">PRASRI RUGS</h1>
        <div style="font-size: 9px; letter-spacing: 0.35em; color: #8A7B6E; margin-top: 4px;">BHADOHI · INDIA</div>
      </div>
      <div style="padding: 25px 0;">
        <h2 style="font-size: 18px; font-weight: normal; color: #1A1918; margin-bottom: 8px;">Order Confirmed: ${order.orderNumber}</h2>
        <p style="font-size: 13px; color: #5C5248; line-height: 1.6;">
          Dear ${order.customer?.firstName || 'Valued Collector'},<br/><br/>
          Your order has been registered at our Bhadohi studio in Uttar Pradesh, India. Your payment of <strong>$${order.totalUSD} USD</strong> has been confirmed (Ref: ${order.paymentId || 'Captured'}).
        </p>

        <div style="background: #FAF8F5; border: 1px solid #EDE6DD; padding: 18px; margin: 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px;">
            ${itemsHtml}
            <tr>
              <td style="padding: 8px 0; color: #8A7B6E;">Shipping (Domestic India Express)</td>
              <td align="right" style="padding: 8px 0; font-family: monospace;">${order.shippingUSD === 0 ? 'Complimentary (Free)' : `$${order.shippingUSD} USD`}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0 0; font-weight: bold; font-size: 14px;">Total Paid</td>
              <td align="right" style="padding: 10px 0 0; font-weight: bold; font-size: 14px; font-family: monospace;">$${order.totalUSD} USD</td>
            </tr>
          </table>
        </div>

        <div style="font-size: 12px; color: #5C5248; line-height: 1.6; border-top: 1px solid #EDE6DD; padding-top: 15px;">
          <strong>Shipping Destination:</strong><br/>
          ${order.shippingAddress?.address || ''} ${order.shippingAddress?.apartment || ''}<br/>
          ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}<br/>
          ${order.shippingAddress?.country || 'India'}
        </div>
      </div>
      <div style="border-top: 1px solid #EDE6DD; padding-top: 20px; text-align: center; font-size: 11px; color: #8A7B6E;">
        Prasri Rugs Atelier · Bhadohi 221401, UP, India · <a href="mailto:prasrirugs@gmail.com" style="color: #8A7B6E;">prasrirugs@gmail.com</a>
      </div>
    </div>`;
}

export async function dispatchOrderEmailsDirect(order) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Direct Email] Gmail transporter not configured in environment.');
    return false;
  }

  const gmailUser = (process.env.GMAIL_USER || process.env.VITE_ADMIN_EMAIL || 'prasrirugs@gmail.com').toLowerCase().trim();
  const customerEmail = order.customer?.email;

  const html = generateOrderEmailHtml(order);

  // 1. Send confirmation to customer
  if (customerEmail) {
    try {
      await transporter.sendMail({
        from: `"Prasri Rugs Atelier" <${gmailUser}>`,
        to: customerEmail,
        subject: `Order Confirmed: ${order.orderNumber} · Prasri Rugs`,
        html,
      });
      console.log(`[Direct Email] Customer confirmation delivered to ${customerEmail}`);
    } catch (err) {
      console.warn(`[Direct Email] Failed customer dispatch to ${customerEmail}:`, err.message);
    }
  }

  // 2. Send notification to admin
  try {
    await transporter.sendMail({
      from: `"Prasri Rugs Atelier" <${gmailUser}>`,
      to: gmailUser,
      subject: `[NEW ORDER] ${order.orderNumber} — ${order.customer?.firstName || ''} ${order.customer?.lastName || ''} ($${order.totalUSD} USD)`,
      html,
    });
    console.log(`[Direct Email] Admin alert delivered to ${gmailUser}`);
  } catch (adminErr) {
    console.warn('[Direct Email] Failed admin dispatch:', adminErr.message);
  }

  return true;
}

