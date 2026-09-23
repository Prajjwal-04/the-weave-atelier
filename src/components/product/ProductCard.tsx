import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { StockBadge } from './StockBadge';
import { useInventory } from '../../context/InventoryContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  aspectRatio?: 'portrait' | 'square';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  aspectRatio = 'portrait',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getInventory } = useInventory();

  const isFavorited = isInWishlist(product.id);
  const startingPrice = product.variants[0]?.priceUSD || 0;
  const primaryImage = product.images[0]?.url || '';
  const secondaryImage = product.images[1]?.url || product.images[0]?.url || '';

  // Check live reactive inventory
  const hasLastOne = product.variants.some((v) => getInventory(v.sku) === 1);
  const hasAnyInStock = product.variants.some((v) => getInventory(v.sku) > 0);
  const isReady = product.isReadyToShip && hasAnyInStock;

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div
        className={`relative w-full overflow-hidden bg-atelier-cream border border-atelier-parchment/60 transition-all duration-500 ${
          aspectRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square'
        }`}
      >
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={product.name}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
          />

          {/* Secondary Image on Hover */}
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
          <StockBadge
            isReadyToShip={isReady}
            inventory={hasLastOne ? 1 : hasAnyInStock ? undefined : 0}
          />
        </div>

        {/* Top Right: Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-atelier-ivory/80 backdrop-blur-md rounded-full text-atelier-charcoal hover:text-red-700 hover:bg-atelier-ivory transition-all shadow-sm"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isFavorited ? 'fill-red-700 text-red-700' : ''
            }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div
            className={`absolute bottom-3 inset-x-3 z-10 transition-all duration-300 transform ${
              isHovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full py-2.5 bg-atelier-ivory/95 hover:bg-atelier-softblack hover:text-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase transition-all duration-200 border border-atelier-parchment shadow-md flex items-center justify-center font-medium"
            >
              <Eye size={13} className="mr-1.5" />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="pt-4 pb-2 space-y-2">
        {/* Eyebrow: Technique & Material */}
        <div className="flex items-center space-x-2 text-[11px] tracking-wider uppercase font-medium">
          <span className="text-atelier-agedgold">{product.technique}</span>
          <span className="text-atelier-taupe/40">·</span>
          <span className="text-atelier-taupe truncate max-w-[170px] font-normal">
            {product.material.split('&')[0]}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-lg sm:text-xl text-atelier-softblack font-light tracking-wide group-hover:text-atelier-darkbrown transition-colors leading-snug">
          <Link to={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Price & Dimension Footnote */}
        <div className="flex items-baseline justify-between pt-1.5 border-t border-atelier-parchment/60">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-[11px] uppercase tracking-wider text-atelier-taupe font-normal">From</span>
            <span className="font-sans text-sm sm:text-base text-atelier-softblack font-medium tracking-normal">
              {formatPrice(startingPrice)}
            </span>
          </div>
          <span className="text-[11px] font-sans text-atelier-taupe font-normal">
            {product.variants[0]?.dimensionsFt || product.variants[0]?.size || "8' × 10'"}
          </span>
        </div>

        {/* Subtle bottom info with size count & view link */}
        <div className="pt-1 flex items-center justify-between text-[11px] tracking-widest text-atelier-taupe uppercase">
          <span className="text-[10px] text-atelier-taupe/90 font-mono">
            {product.variants.length} Sizes · Bespoke
          </span>
          <Link
            to={`/product/${product.slug}`}
            className="text-atelier-charcoal/80 hover:text-atelier-softblack transition-colors inline-flex items-center group/cta font-medium"
          >
            <span>Explore</span>
            <span className="inline-block transition-transform duration-200 group-hover/cta:translate-x-1 ml-1 font-sans">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
