import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react';
import { Product } from '../../types';
import { QuickViewModal } from '../product/QuickViewModal';
import { CustomSizeModal } from '../product/CustomSizeModal';
import { useInventory } from '../../context/InventoryContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { StockBadge } from '../product/StockBadge';

interface FeaturedCollectionProps {
  products: Product[];
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [customSizeProduct, setCustomSizeProduct] = useState<Product | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const { isLoading, getInventory } = useInventory();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag support
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const hasMoved = useRef(false);

  // Feature 8 rugs for an extensive showcase
  const featuredRugs = React.useMemo(() => {
    const featuredOnly = (products || []).filter((p) => p.featured);
    if (featuredOnly.length >= 8) {
      return featuredOnly.slice(0, 8);
    }
    const otherProducts = (products || []).filter((p) => !p.featured);
    return [...featuredOnly, ...otherProducts].slice(0, 8);
  }, [products]);

  // Total cards in track: strictly the featured rugs
  const totalCards = featuredRugs.length;

  const checkScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

    // Approximate active card
    const cardWidth = clientWidth < 640 ? clientWidth * 0.8 : clientWidth * 0.32;
    const index = Math.round(scrollLeft / (cardWidth + 24));
    setActiveCardIndex(Math.min(totalCards - 1, Math.max(0, index)));
  }, [totalCards]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, featuredRugs]);

  const scrollToCard = (index: number) => {
    if (!sliderRef.current) return;
    const clientWidth = sliderRef.current.clientWidth;
    const cardWidth = clientWidth < 640 ? clientWidth * 0.8 : clientWidth * 0.32;
    const targetLeft = index * (cardWidth + 24);
    sliderRef.current.scrollTo({
      left: targetLeft,
      behavior: 'smooth',
    });
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftPos.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 6) {
      hasMoved.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-[#FBF9F6] via-atelier-ivory to-[#FBF9F6] border-b border-atelier-parchment/60 relative overflow-hidden">
      {/* Subtle background ambient texture line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-atelier-agedgold/25 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 space-y-4 md:space-y-0">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
              <span className="text-atelier-agedgold">LIMITED WEAVES</span>
              <span className="text-atelier-taupe/40">·</span>
              <span className="text-atelier-taupe">CURATED RELEASES</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
              Featured <span className="italic font-normal text-atelier-agedgold">Pieces</span>
            </h2>
            <p className="text-xs sm:text-sm text-atelier-charcoal/80 font-light leading-relaxed pt-1">
              Select handmade works defining our autumn atelier season. Woven knot-by-knot in Bhadohi using virgin long-staple fleece.
            </p>
          </div>

          {/* Editorial Controls */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Circular Minimalist Header Arrows */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous rugs"
                className="w-10 h-10 rounded-full border border-atelier-parchment bg-atelier-cream/80 flex items-center justify-center text-atelier-softblack hover:border-atelier-agedgold hover:text-atelier-agedgold disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Next rugs"
                className="w-10 h-10 rounded-full border border-atelier-parchment bg-atelier-cream/80 flex items-center justify-center text-atelier-softblack hover:border-atelier-agedgold hover:text-atelier-agedgold disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center text-xs tracking-widest text-atelier-charcoal hover:text-atelier-softblack uppercase font-medium border-b border-atelier-taupe/40 pb-0.5 group transition-colors ml-2"
            >
              <span>Explore All Works</span>
              <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Gallery Carousel Container with Floating Edge Arrow Buttons */}
        <div className="relative group/carousel">
          {/* Floating Left Arrow (Desktop only, visible on hover) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-atelier-ivory/95 backdrop-blur-md border border-atelier-parchment text-atelier-softblack items-center justify-center shadow-luxury opacity-0 group-hover/carousel:opacity-100 hover:scale-105 hover:border-atelier-agedgold hover:text-atelier-agedgold transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Floating Right Arrow (Desktop only, visible on hover) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-atelier-ivory/95 backdrop-blur-md border border-atelier-parchment text-atelier-softblack items-center justify-center shadow-luxury opacity-0 group-hover/carousel:opacity-100 hover:scale-105 hover:border-atelier-agedgold hover:text-atelier-agedgold transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* The Scrollable Track */}
          <div
            ref={sliderRef}
            onScroll={checkScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className="flex space-x-6 sm:space-x-7 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-6 pt-2 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Product Cards 1 to N */}
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[80vw] sm:w-[48vw] md:w-[35vw] lg:w-[310px] snap-start animate-pulse"
                  >
                    <div className="aspect-[3/4] bg-atelier-parchment/60 rounded-none mb-4" />
                    <div className="h-4 bg-atelier-parchment/70 w-3/4 mb-2" />
                    <div className="h-3 bg-atelier-parchment/50 w-1/2" />
                  </div>
                ))
              : featuredRugs.map((product, idx) => {
                  const isHovered = hoveredCardId === product.id;
                  const isFavorited = isInWishlist(product.id);
                  const startingPrice = product.variants[0]?.priceUSD || 0;
                  const primaryImage = product.images[0]?.url || '';
                  const secondaryImage = product.images[1]?.url || primaryImage;

                  const hasLastOne = product.variants.some((v) => getInventory(v.sku) === 1);
                  const hasAnyInStock = product.variants.some((v) => getInventory(v.sku) > 0);
                  const isReady = product.isReadyToShip && hasAnyInStock;

                  return (
                    <div
                      key={product.id}
                      onMouseEnter={() => setHoveredCardId(product.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      className="flex-shrink-0 w-[80vw] sm:w-[48vw] md:w-[35vw] lg:w-[310px] snap-start group flex flex-col justify-between"
                    >
                      {/* Image Stage Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-atelier-cream border border-atelier-parchment/70 group-hover:border-atelier-agedgold/50 transition-all duration-500 shadow-xs group-hover:shadow-luxury">
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

                        {/* Top Left: Stock Badge */}
                        <div className="absolute top-3.5 left-3.5 z-10 flex items-center space-x-2">
                          <StockBadge
                            isReadyToShip={isReady}
                            inventory={hasLastOne ? 1 : hasAnyInStock ? undefined : 0}
                          />
                        </div>

                        {/* Top Right: Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-atelier-ivory/85 backdrop-blur-md flex items-center justify-center text-atelier-charcoal hover:text-red-700 hover:bg-atelier-ivory transition-all shadow-xs"
                          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            size={14}
                            className={`transition-colors ${
                              isFavorited ? 'fill-red-700 text-red-700' : ''
                            }`}
                            strokeWidth={1.5}
                          />
                        </button>

                        {/* Hover Quick View Pill Button */}
                        <div
                          className={`absolute bottom-3.5 inset-x-3.5 z-10 transition-all duration-300 transform ${
                            isHovered
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-2 pointer-events-none'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setQuickViewProduct(product);
                            }}
                            className="w-full py-2.5 px-3 bg-atelier-ivory/95 backdrop-blur-md border border-atelier-parchment text-atelier-softblack text-[11px] tracking-widest uppercase hover:bg-atelier-softblack hover:text-atelier-parchment hover:border-atelier-softblack transition-all flex items-center justify-center font-medium shadow-sm"
                          >
                            <Eye size={13} className="mr-1.5 text-atelier-agedgold" />
                            <span>Quick View</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Content & Narrative Meta */}
                      <div className="pt-4 pb-1 space-y-1.5">
                        {/* Technique & Material Dual-Tone Line */}
                        <div className="text-[10px] tracking-[0.25em] uppercase font-medium flex items-center space-x-1.5">
                          <span className="text-atelier-agedgold">{product.technique}</span>
                          <span className="text-atelier-taupe/40">·</span>
                          <span className="text-atelier-taupe truncate max-w-[170px] font-normal">
                            {product.material.split('&')[0]}
                          </span>
                        </div>

                        {/* Product Title */}
                        <Link to={`/product/${product.slug}`} className="block group-hover:underline">
                          <h4 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-light leading-snug group-hover:text-atelier-darkbrown transition-colors">
                            {product.name}
                          </h4>
                        </Link>

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
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Segmented Architectural Pagination Rail */}
        <div className="mt-8 pt-6 border-t border-atelier-parchment/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Segmented Dash Buttons */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalCards }).map((_, idx) => {
              const isActive = activeCardIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  aria-label={`Go to piece ${idx + 1}`}
                  className={`h-1.5 transition-all duration-300 rounded-full focus:outline-none ${
                    isActive
                      ? 'w-8 bg-atelier-softblack'
                      : 'w-2 bg-atelier-parchment hover:bg-atelier-agedgold/60'
                  }`}
                />
              );
            })}
          </div>

          {/* Aesthetic Drag/Swipe Prompt */}
          <div className="text-[10px] sm:text-[11px] tracking-widest uppercase text-atelier-taupe font-mono flex items-center space-x-2">
            <span className="hidden sm:inline">Drag trackpad or click arrows to explore release</span>
            <span className="sm:hidden">Swipe to explore release</span>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onRequestCustomSize={(p) => {
          setQuickViewProduct(null);
          setCustomSizeProduct(p);
        }}
      />

      {/* Custom Size Modal */}
      <CustomSizeModal
        product={customSizeProduct || undefined}
        isOpen={!!customSizeProduct}
        onClose={() => setCustomSizeProduct(null)}
      />
    </section>
  );
};
