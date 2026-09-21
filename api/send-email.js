import { handleSendEmail } from '../server/emailHandler.js';

export default async function handler(req, res) {
  return handleSendEmail(req, res);
}
