import fs from 'fs';
import path from 'path';
import { parseRequestBody, sendJsonResponse } from './razorpayHandlers.js';

/**
 * Handles image file upload to public/images/products/<slug>/
 * Endpoint: POST /api/upload-image
 * Payload: {
 *   slug: string,
 *   dataUrl: string (data:image/...;base64,...),
 *   filename?: string,
 *   viewType?: string
 * }
 */
export async function handleUploadImage(req, res) {
  try {
    const body = await parseRequestBody(req);
    const { slug, dataUrl, filename, viewType } = body;

    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Invalid image data. Expected a base64 data URL.',
      });
    }

    const cleanSlug = (slug || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const targetDir = path.join(process.cwd(), 'public', 'images', 'products', cleanSlug);
    fs.mkdirSync(targetDir, { recursive: true });

    // Parse base64
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Could not parse base64 image data.',
      });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');

    const cleanName = filename
      ? filename.replace(/[^a-zA-Z0-9._-]/g, '')
      : `img-${viewType || 'view'}-${Date.now().toString().slice(-6)}.${ext}`;

    const filePath = path.join(targetDir, cleanName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/products/${cleanSlug}/${cleanName}`;
    console.log(`[UploadHandler] Successfully saved image to: ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);

    return sendJsonResponse(res, 200, {
      success: true,
      url: publicUrl,
      sizeBytes: buffer.length,
      filename: cleanName,
    });
  } catch (error) {
    console.error('[UploadHandler Error]', error);
    return sendJsonResponse(res, 500, {
      success: false,
      error: error.message || 'Failed to save uploaded image file.',
    });
  }
}
