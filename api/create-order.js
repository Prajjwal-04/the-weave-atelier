import { handleCreateOrder } from '../server/razorpayHandlers.js';

export default async function handler(req, res) {
  return handleCreateOrder(req, res);
}
