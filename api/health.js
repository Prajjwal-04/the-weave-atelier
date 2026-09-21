import { sendJsonResponse } from '../server/razorpayHandlers.js';

export default async function handler(req, res) {
  return sendJsonResponse(res, 200, {
    status: 'healthy',
    environment: 'vercel-serverless',
    timestamp: new Date().toISOString(),
  });
}
