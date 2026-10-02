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
