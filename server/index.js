import http from 'http';
import { handleCreateOrder, handleVerifyPayment, handleGetOrders, sendJsonResponse } from './razorpayHandlers.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = req.url?.split('?')[0];

  if (req.method === 'POST' && url === '/api/create-order') {
    return handleCreateOrder(req, res);
  }

  if (req.method === 'POST' && url === '/api/verify-payment') {
    return handleVerifyPayment(req, res);
  }

  if (req.method === 'GET' && url === '/api/orders') {
    return handleGetOrders(req, res);
  }

  if (req.method === 'GET' && url === '/api/health') {
    return sendJsonResponse(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
  }

  sendJsonResponse(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`[Razorpay Backend Server] Listening on http://localhost:${PORT}`);
});
