import { handleGetOrders } from '../server/razorpayHandlers.js';

export default async function handler(req, res) {
  return handleGetOrders(req, res);
}
