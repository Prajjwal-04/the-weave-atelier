import { handleCheckPaymentStatus } from '../server/razorpayHandlers.js';

export default async function handler(req, res) {
  return handleCheckPaymentStatus(req, res);
}
