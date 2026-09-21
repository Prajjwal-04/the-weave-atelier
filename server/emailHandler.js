import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { parseRequestBody, sendJsonResponse } from './razorpayHandlers.js';

dotenv.config();

let cachedTransporter = null;

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
 * Payload: {
 *   to: string,
 *   subject: string,
 *   html?: string,
 *   text?: string,
 *   replyTo?: string,
 *   fromName?: string
 * }
 */
export async function handleSendEmail(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { to, subject, html, text, replyTo, fromName } = body;

    if (!to || !subject) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Missing required email fields: "to" and "subject" are required.',
      });
    }

    const gmailUser = process.env.GMAIL_USER || process.env.VITE_ADMIN_EMAIL || 'prasrirugs@gmail.com';
    const senderName = fromName || 'The Weave Atelier';
    const transporter = getTransporter();

    // If Google App Password is not yet provided, log simulation & return graceful instructions
    if (!transporter) {
      console.log(`\n[Gmail SMTP Simulation] To: ${to} | Subject: "${subject}"`);
      console.log(`[Gmail SMTP Notice] GMAIL_APP_PASSWORD is not set in .env. Once set, this email will send directly from ${gmailUser} via Google's official mail servers.\n`);

      return sendJsonResponse(res, 200, {
        success: true,
        deliveredVia: 'simulated',
        message: `Direct Gmail dispatcher ready for ${gmailUser}. Add GMAIL_APP_PASSWORD to .env to activate live Google SMTP delivery.`,
        details: { to, subject, timestamp: new Date().toISOString() },
      });
    }

    // Send real email through Google's official mail servers
    const mailOptions = {
      from: `"${senderName}" <${gmailUser}>`,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''),
      html: html || undefined,
      replyTo: replyTo || gmailUser,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Gmail SMTP Sent] Successfully dispatched to ${to} (MessageId: ${info.messageId})`);

    return sendJsonResponse(res, 200, {
      success: true,
      deliveredVia: 'gmail_smtp',
      messageId: info.messageId,
      message: `Directly delivered to ${to} via official Gmail servers from ${gmailUser}.`,
    });
  } catch (error) {
    console.error('[Gmail SMTP Error]', error);
    return sendJsonResponse(res, 500, {
      success: false,
      error: error.message || 'Failed to dispatch email via Gmail SMTP.',
    });
  }
}
