import { handleVerifyPayment } from '../server/razorpayHandlers.js';

export default async function handler(req, res) {
  return handleVerifyPayment(req, res);
}
