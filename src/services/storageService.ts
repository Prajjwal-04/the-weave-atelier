import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadImageResult {
  success: boolean;
  url: string;
  source: 'supabase_storage' | 'local_fs' | 'data_url';
  error?: string;
}

export const storageService = {
  /**
   * Upload an image file or base64 string to Cloud Storage (Supabase) or server filesystem.
   * Ensures the database never stores bulky Base64 text.
   */
  async uploadProductImage(
    fileOrDataUrl: File | string,
    productSlug: string,
    viewType: string = 'view'
  ): Promise<UploadImageResult> {
    const cleanSlug = (productSlug || 'rug').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    // 1. Convert to File and DataUrl if needed
    let file: File | null = null;
    let dataUrl: string = '';

    if (typeof fileOrDataUrl === 'string') {
      dataUrl = fileOrDataUrl;
    } else {
      file = fileOrDataUrl;
    }

    // 2. Try Supabase Storage first (Cloud CDN)
    if (isSupabaseConfigured() && supabase) {
      try {
        let uploadPayload: Blob | File | null = file;
        let ext = 'jpg';

        if (!uploadPayload && dataUrl.startsWith('data:')) {
          const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
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
      let resolvedDataUrl = dataUrl;
      if (!resolvedDataUrl && file) {
        resolvedDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (resolvedDataUrl && resolvedDataUrl.startsWith('data:image/')) {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
      url: dataUrl || '',
      source: 'data_url',
      error: 'Could not upload to cloud storage or server. Please check storage bucket configuration.',
    };
  },
};
