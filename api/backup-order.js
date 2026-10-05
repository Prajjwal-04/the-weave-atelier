import { handleSaveOrderBackup } from '../server/razorpayHandlers.js';

export default async function handler(req, res) {
  return handleSaveOrderBackup(req, res);
}
