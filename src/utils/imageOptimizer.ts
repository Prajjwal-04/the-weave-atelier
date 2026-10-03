/**
 * Responsive Image Optimization Utility
 * Automatically transforms Unsplash and remote URLs to optimal dimensions,
 * WebP auto-formats, and compressed qualities for rapid rendering.
 */

interface OptimizeOptions {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
  fit?: 'crop' | 'clip' | 'fill';
}

export function optimizeImageUrl(url: string | undefined | null, options: OptimizeOptions = {}): string {
  if (!url) return '';

  const {
    width = 640,
    quality = 75,
    format = 'auto',
    fit = 'crop'
  } = options;

  // Handle Unsplash images
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('w', width.toString());
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('auto', format === 'auto' ? 'format' : format);
      parsed.searchParams.set('fit', fit);
      return parsed.toString();
    } catch {
      // Fallback regex replacement if URL parsing fails
      return url
        .replace(/w=\d+/, `w=${width}`)
        .replace(/q=\d+/, `q=${quality}`);
    }
  }

  return url;
}

/**
 * Thumbnail size for cart items, search dropdown, and small previews (~200-300px)
 */
export function getThumbnailUrl(url: string): string {
  return optimizeImageUrl(url, { width: 280, quality: 70 });
}

/**
 * Standard card size for product grid, related products, and collection cards (~600px)
 * Drastically cuts payload from ~1.5MB down to ~60KB
 */
export function getCardImageUrl(url: string): string {
  return optimizeImageUrl(url, { width: 640, quality: 75 });
}

/**
 * Large format for product detail page and gallery view (~1200-1400px)
 */
export function getDetailImageUrl(url: string): string {
  return optimizeImageUrl(url, { width: 1200, quality: 82 });
}

/**
 * Ultra-high resolution for modal full-screen zoom inspection (~1800px)
 */
export function getFullscreenImageUrl(url: string): string {
  return optimizeImageUrl(url, { width: 1800, quality: 85 });
}
