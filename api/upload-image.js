import { handleUploadImage } from '../server/uploadHandler.js';

export default async function handler(req, res) {
  return handleUploadImage(req, res);
}
