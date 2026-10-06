import React, { useState, useEffect } from 'react';
import { optimizeImageUrl, generateSrcSet } from '../../utils/imageOptimizer';
import { ModernThrobber } from './ModernThrobber';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  quality?: number;
  sizes?: string;
  throbberSize?: 'xs' | 'sm' | 'md' | 'lg';
  showThrobberText?: boolean;
  throbberLabel?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
}

/**
 * Performant, Responsive Image Component with a Modern Throbber
 * - Automatically downsizes unoptimized remote/Unsplash images to WebP/compact resolution.
 * - Displays a luxury concentric throbber with a warm shimmer placeholder while loading.
 * - Smoothly crossfades when the image is fully ready.
 * - Native lazy loading and asynchronous decoding.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  width = 640,
  quality = 75,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  throbberSize = 'md',
  showThrobberText = false,
  throbberLabel = 'Atelier',
  priority = false,
  aspectRatio,
  objectFit = 'cover',
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute optimized primary src and responsive srcset
  const optimizedSrc = optimizeImageUrl(src, { width, quality });
  const srcSet = generateSrcSet(src, [320, 480, 640, 800, 1080], quality);

  // Reset state if image source changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-atelier-cream/80 ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Modern Shimmer Backdrop & Luxury Throbber */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-atelier-cream z-10">
          {/* Subtle animated shimmer gradient */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-atelier-parchment/40 to-transparent animate-shimmer" />

          {/* Central Luxury Throbber */}
          <ModernThrobber
            size={throbberSize}
            label={showThrobberText ? throbberLabel : undefined}
          />
        </div>
      )}

      {/* Fallback Error View */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-atelier-ivory border border-atelier-parchment text-atelier-taupe space-y-1.5 z-10">
          <ImageOff size={22} strokeWidth={1.5} className="text-atelier-agedgold/70" />
          <span className="text-[10px] tracking-wider uppercase font-mono">Image Unavailable</span>
        </div>
      ) : (
        <img
          src={optimizedSrc}
          srcSet={srcSet || undefined}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-${objectFit} transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
};
