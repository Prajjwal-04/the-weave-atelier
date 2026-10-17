import { handleRazorpayCallback } from '../server/razorpayHandlers.js';

export default async function handler(req, res) {
  return handleRazorpayCallback(req, res);
}
