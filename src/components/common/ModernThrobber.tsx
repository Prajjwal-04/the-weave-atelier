import React from 'react';

interface ModernThrobberProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  variant?: 'minimal' | 'luxury';
}

/**
 * Modern Quiet-Luxury Throbber / Activity Indicator
 * Designed for Prasri Rugs (The Weave Atelier).
 * Features concentric artisan rings with an aged gold accent and smooth rotational physics.
 */
export const ModernThrobber: React.FC<ModernThrobberProps> = ({
  size = 'md',
  label,
  className = '',
  variant = 'luxury',
}) => {
  const sizeMap = {
    xs: { outer: 'w-4 h-4', inner: 'w-1 h-1', stroke: 'border-[1.5px]', text: 'text-[8px]' },
    sm: { outer: 'w-6 h-6', inner: 'w-1.5 h-1.5', stroke: 'border-[1.5px]', text: 'text-[9px]' },
    md: { outer: 'w-9 h-9', inner: 'w-2 h-2', stroke: 'border-2', text: 'text-[10px]' },
    lg: { outer: 'w-12 h-12', inner: 'w-2.5 h-2.5', stroke: 'border-2', text: 'text-[11px]' },
  };

  const { outer, inner, stroke, text } = sizeMap[size];

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
        <div
          className={`${outer} rounded-full ${stroke} border-atelier-parchment border-t-atelier-darkbrown animate-spin`}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center justify-center space-y-2 pointer-events-none select-none ${className}`}
      role="status"
      aria-label="Loading image..."
    >
      <div className={`relative ${outer} flex items-center justify-center`}>
        {/* Outer subtle guide track */}
        <div className={`absolute inset-0 rounded-full border border-atelier-parchment/80`} />

        {/* Spinning luxury arc */}
        <div
          className={`absolute inset-0 rounded-full ${stroke} border-transparent border-t-atelier-agedgold border-r-atelier-softblack/70 animate-spin`}
          style={{ animationDuration: '0.85s' }}
        />

        {/* Counter-rotating subtle dashed hairline */}
        <div
          className="absolute inset-[2px] rounded-full border border-dashed border-atelier-taupe/40 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '2.5s' }}
        />

        {/* Center glowing gem / diamond node */}
        <div className={`${inner} rounded-full bg-atelier-agedgold shadow-xs animate-pulse`} />
      </div>

      {label && (
        <span
          className={`font-mono tracking-[0.25em] uppercase text-atelier-taupe/90 ${text} animate-pulse`}
        >
          {label}
        </span>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
};
