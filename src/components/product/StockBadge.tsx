import React from 'react';

interface StockBadgeProps {
  isReadyToShip: boolean;
  inventory?: number;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ isReadyToShip, inventory, className = '' }) => {
  if (inventory === 0) {
    return (
      <span className={`inline-flex items-center text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 bg-neutral-200 text-neutral-800 ${className}`}>
        Sold Out · Made to Order
      </span>
    );
  }

  if (inventory === 1) {
    return (
      <span className={`inline-flex items-center text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 ${className}`}>
        Last One Available
      </span>
    );
  }

  if (isReadyToShip) {
    return (
      <span className={`inline-flex items-center text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 bg-atelier-parchment text-atelier-darkbrown border border-atelier-sand/60 ${className}`}>
        Ready to Ship
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 bg-atelier-cream text-atelier-taupe border border-atelier-parchment ${className}`}>
      Made to Order
    </span>
  );
};
