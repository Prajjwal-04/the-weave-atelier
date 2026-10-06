import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadImageResult {
  success: boolean;
  url: string;
  source: 'supabase_storage' | 'local_fs' | 'data_url';
  error?: string;
}

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Visually Lossless Client-Side Image Optimizer
 * Resizes ultra-high resolution photos (4000px+ 8MB photos) to high-fidelity 2048px (Retina 2x),
 * applies bicubic interpolation, strips heavy camera EXIF headers, and encodes to modern WebP (or JPEG) at 84% quality.
 * Rug weave textures, knotting, and colors remain razor-sharp, but file size drops by ~90-95% (e.g. 6MB -> ~200KB).
 */
async function compressImageForUpload(
  fileOrDataUrl: File | string,
  options: CompressOptions = {}
): Promise<{ blob: Blob; ext: string; dataUrl: string }> {
  const { maxWidth = 2048, maxHeight = 2048, quality = 0.84 } = options;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Non-browser fallback
    return {
      blob: fileOrDataUrl instanceof File ? fileOrDataUrl : new Blob(),
      ext: 'jpg',
      dataUrl: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = '';
    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      objectUrl = URL.createObjectURL(fileOrDataUrl);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Maintain aspect ratio while clamping to max 2048px
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original
        resolve({
          blob: fileOrDataUrl instanceof File ? fileOrDataUrl : new Blob(),
          ext: 'jpg',
          dataUrl: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
        });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Check browser WebP support
      const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const targetMime = isWebPSupported ? 'image/webp' : 'image/jpeg';
      const ext = isWebPSupported ? 'webp' : 'jpg';

      canvas.toBlob(
        (blob) => {
          const optimizedDataUrl = canvas.toDataURL(targetMime, quality);
          if (blob) {
            resolve({ blob, ext, dataUrl: optimizedDataUrl });
          } else {
            const binary = atob(optimizedDataUrl.split(',')[1]);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
            const fallbackBlob = new Blob([array], { type: targetMime });
            resolve({ blob: fallbackBlob, ext, dataUrl: optimizedDataUrl });
          }
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      // Fallback on error
      resolve({
        blob: fileOrDataUrl instanceof File ? fileOrDataUrl : new Blob(),
        ext: 'jpg',
        dataUrl: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
      });
    };
  });
}

export const storageService = {
  /**
   * Upload an image file or base64 string to Cloud Storage (Supabase) or server filesystem.
   * Compresses image on the client side preserving Retina visual fidelity before upload,
   * keeping Supabase Storage Egress well within free limits.
   */
  async uploadProductImage(
    fileOrDataUrl: File | string,
    productSlug: string,
    viewType: string = 'view'
  ): Promise<UploadImageResult> {
    const cleanSlug = (productSlug || 'rug').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    // 1. Optimize image in-browser before upload (2048px Retina-max, WebP @ 84% quality)
    let uploadPayload: Blob | File | null = null;
    let ext = 'webp';
    let resolvedDataUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';

    try {
      const originalSizeKb = fileOrDataUrl instanceof File ? Math.round(fileOrDataUrl.size / 1024) : 0;
      const optimized = await compressImageForUpload(fileOrDataUrl, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.84,
      });

      uploadPayload = optimized.blob;
      ext = optimized.ext;
      resolvedDataUrl = optimized.dataUrl;

      const newSizeKb = Math.round(uploadPayload.size / 1024);
      console.log(
        `[StorageService] Visual-fidelity optimization: ${originalSizeKb > 0 ? originalSizeKb + 'KB -> ' : ''}${newSizeKb}KB (${ext.toUpperCase()})`
      );
    } catch (optErr) {
      console.warn('[StorageService] Image compression warning, continuing with original:', optErr);
      if (fileOrDataUrl instanceof File) {
        uploadPayload = fileOrDataUrl;
        ext = fileOrDataUrl.name.split('.').pop() || 'jpg';
      }
    }

    // 2. Try Supabase Storage first (Cloud CDN)
    if (isSupabaseConfigured() && supabase) {
      try {
        if (!uploadPayload && resolvedDataUrl.startsWith('data:')) {
          const match = resolvedDataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (match) {
            ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
            const binary = atob(match[2]);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              array[i] = binary.charCodeAt(i);
            }
            uploadPayload = new Blob([array], { type: `image/${ext}` });
          }
        }

        if (uploadPayload) {
          const filename = `${cleanSlug}/${viewType}-${timestamp}-${randomSuffix}.${ext}`;
          const { data, error } = await supabase.storage
            .from('rug-images')
            .upload(filename, uploadPayload, {
              cacheControl: '31536000', // 1 year CDN cache
              contentType: ext === 'webp' ? 'image/webp' : 'image/jpeg',
              upsert: true,
            });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage
              .from('rug-images')
              .getPublicUrl(filename);

            if (publicUrlData?.publicUrl) {
              console.log('[StorageService] Image uploaded to Supabase Storage:', publicUrlData.publicUrl);
              return {
                success: true,
                url: publicUrlData.publicUrl,
                source: 'supabase_storage',
              };
            }
          } else if (error) {
            console.warn('[StorageService] Supabase storage upload notice:', error.message);
          }
        }
      } catch (err) {
        console.warn('[StorageService] Supabase upload error, attempting fallback:', err);
      }
    }

    // 3. Fallback: Upload to local server filesystem via /api/upload-image
    try {
      if (!resolvedDataUrl && fileOrDataUrl instanceof File) {
        resolvedDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        });
      }

      if (resolvedDataUrl && resolvedDataUrl.startsWith('data:image/')) {
        let token = '';
        if (isSupabaseConfigured() && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token || '';
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            slug: cleanSlug,
            dataUrl: resolvedDataUrl,
            viewType,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.url) {
            console.log('[StorageService] Image saved to local filesystem:', result.url);
            return {
              success: true,
              url: result.url,
              source: 'local_fs',
            };
          }
        }
      }
    } catch (err) {
      console.warn('[StorageService] Server filesystem upload failed:', err);
    }

    // 4. Emergency fallback (only if both storage methods are unreachable)
    return {
      success: false,
      url: resolvedDataUrl || '',
      source: 'data_url',
      error: 'Could not upload to cloud storage or server. Please check storage bucket configuration.',
    };
  },
};
