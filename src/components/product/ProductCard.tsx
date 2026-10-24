import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { StockBadge } from './StockBadge';
import { useInventory } from '../../context/InventoryContext';
import { getCardImageUrl, getCardSrcSet } from '../../utils/imageOptimizer';
import { ModernThrobber } from '../common/ModernThrobber';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  aspectRatio?: 'portrait' | 'square';
  showQuickView?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  aspectRatio = 'portrait',
  showQuickView = true,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [hasHoveredOnce, setHasHoveredOnce] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getInventory } = useInventory();

  const isFavorited = isInWishlist(product.id);
  const startingPrice = product.variants[0]?.priceUSD || 0;
  const primaryImage = getCardImageUrl(product.images[0]?.url || '');
  const primarySrcSet = getCardSrcSet(product.images[0]?.url);
  const secondaryImage = getCardImageUrl(product.images[1]?.url || product.images[0]?.url || '');

  // Check live reactive inventory
  const totalStock = product.variants.reduce((sum, v) => sum + (getInventory(v.sku) || 0), 0);
  const hasLastOne = totalStock === 1;
  const hasAnyInStock = totalStock > 0;
  const isReady = product.isReadyToShip && hasAnyInStock;

  // Clean short imperial dimension for compact product cards (e.g. "5' × 8'")
  const rawDimension = product.variants[0]?.dimensionsFt || product.variants[0]?.size || "5' × 8'";
  const shortDimension = rawDimension.split('(')[0].trim();

  const isActive = isHovered || isToggled;

  return (
    <div
      className="group relative flex flex-col cursor-pointer select-none"
      onMouseEnter={() => {
        setIsHovered(true);
        if (!hasHoveredOnce) setHasHoveredOnce(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={(e) => {
        e.preventDefault();
        navigate(`/product/${product.slug}`);
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a')) return;
        // On touch screens: first tap toggles preview / Quick View, second tap navigates
        if (isToggled) {
          navigate(`/product/${product.slug}`);
        } else {
          setIsToggled(true);
          if (!hasHoveredOnce) setHasHoveredOnce(true);
        }
      }}
    >
      {/* Image Container */}
      <div
        className={`relative w-full overflow-hidden bg-atelier-cream border border-atelier-parchment/60 transition-all duration-500 ${
          aspectRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square'
        }`}
      >
        {/* Modern Throbber with Shimmer */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-atelier-cream z-10 pointer-events-none">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-atelier-parchment/40 to-transparent animate-shimmer" />
            <ModernThrobber size="sm" />
          </div>
        )}

        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          {/* Primary Image */}
          <img
            src={primaryImage}
            srcSet={primarySrcSet || undefined}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={product.name}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              !isLoaded ? 'opacity-0' : isActive ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
            decoding="async"
          />

          {/* Secondary Image on Hover / Toggle - Loaded On Demand */}
          {hasHoveredOnce && (
            <img
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
              loading="lazy"
              decoding="async"
            />
          )}
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
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-atelier-ivory/80 backdrop-blur-md rounded-full text-atelier-charcoal hover:text-red-700 hover:bg-atelier-ivory transition-all shadow-sm active:scale-90"
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

        {/* Quick View Button on Hover / Toggle */}
        {showQuickView && (
          <div
            className={`absolute bottom-3 inset-x-3 z-10 transition-all duration-300 transform ${
              isActive
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/product/${product.slug}`);
                if (onQuickView) {
                  onQuickView(product);
                }
              }}
              className="w-full py-2.5 bg-atelier-ivory/95 hover:bg-atelier-softblack hover:text-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase transition-all duration-200 border border-atelier-parchment shadow-md flex items-center justify-center font-medium active:scale-95 cursor-pointer"
            >
              <Eye size={13} className="mr-1.5" />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="pt-3 sm:pt-4 pb-2 space-y-1.5 sm:space-y-2">
        {/* Eyebrow: Technique & Material */}
        <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] tracking-wider uppercase font-medium overflow-hidden">
          <span className="text-atelier-agedgold whitespace-nowrap shrink-0">{product.technique}</span>
          <span className="text-atelier-taupe/40 shrink-0">·</span>
          <span className="text-atelier-taupe truncate font-normal">
            {product.material.split('&')[0].trim()}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-base sm:text-xl text-atelier-softblack font-light tracking-wide group-hover:text-atelier-darkbrown transition-colors leading-snug line-clamp-1 sm:line-clamp-none">
          <Link to={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Price & Dimension Footnote */}
        <div className="flex items-baseline justify-between gap-1 pt-1.5 border-t border-atelier-parchment/60">
          <div className="flex items-baseline space-x-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-atelier-taupe font-normal shrink-0">
              From
            </span>
            <span className="font-sans text-xs xs:text-sm sm:text-base text-atelier-softblack font-medium tracking-tight truncate">
              {formatPrice(startingPrice)}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-sans text-atelier-taupe font-normal shrink-0 whitespace-nowrap pl-1">
            {shortDimension}
          </span>
        </div>

        {/* Subtle bottom info with size count & view link */}
        <div className="pt-1 flex items-center justify-between gap-1 text-[10px] sm:text-[11px] tracking-widest text-atelier-taupe uppercase">
          <span className="text-[9px] sm:text-[10px] text-atelier-taupe/90 font-mono truncate">
            {product.variants.length} {product.variants.length === 1 ? 'Size' : 'Sizes'}
            <span className="hidden xs:inline sm:inline"> · Bespoke</span>
          </span>
          <Link
            to={`/product/${product.slug}`}
            className="text-atelier-charcoal/80 hover:text-atelier-softblack transition-colors inline-flex items-center group/cta font-medium shrink-0 whitespace-nowrap"
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
