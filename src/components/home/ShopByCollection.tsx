import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { COLLECTIONS } from '../../data/collections';

export const ShopByCollection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const itemWidth = clientWidth * 0.82;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIdx(Math.min(COLLECTIONS.length - 1, Math.max(0, index)));
  };

  return (
    <section className="py-20 sm:py-28 bg-atelier-ivory border-b border-atelier-parchment/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-18 space-y-3">
          <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center justify-center space-x-2">
            <span className="text-atelier-agedgold">CURATED ANTHOLOGY</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">DESIGN DISCIPLINES</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal tracking-tight">
            Shop by <span className="italic font-normal text-atelier-agedgold">Collection</span>
          </h2>
          <p className="text-xs sm:text-sm text-atelier-charcoal/80 font-light leading-relaxed">
            Six focused aesthetic directions, each interpreting natural fibers and artisan techniques for considered spaces.
          </p>
        </div>

        {/* Responsive Hybrid: Mobile Horizontal Swipe Rail | Desktop 3-Column Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 overflow-x-auto md:overflow-visible scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-4 md:pb-0"
        >
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to={`/collections/${c.slug}`}
              className="flex-shrink-0 w-[82vw] sm:w-[50vw] md:w-auto snap-start group block relative overflow-hidden bg-atelier-cream border border-atelier-parchment/70 transition-all duration-300 hover:border-atelier-taupe"
            >
              {/* Image Aspect */}
              <div className="relative aspect-[16/11] overflow-hidden">
                <img
                  src={c.heroImage}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.92]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-atelier-deepblack/70 via-atelier-deepblack/20 to-transparent" />

                {/* Bottom Overlay Label */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1">
                  <div className="text-[10px] tracking-widest text-atelier-parchment/80 uppercase font-mono">
                    {c.curatedTechniques.join(' · ')}
                  </div>
                  <h3 className="font-serif text-2xl font-light tracking-wide text-white group-hover:text-atelier-cream transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-atelier-parchment/80 line-clamp-1 font-light">
                    {c.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="p-4 bg-atelier-ivory border-t border-atelier-parchment flex items-center justify-between text-xs text-atelier-softblack">
                <span className="text-[11px] tracking-wider uppercase text-atelier-taupe font-medium">
                  Explore Designs
                </span>
                <ArrowRight size={14} className="text-atelier-softblack group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Swipe Pagination Dots Indicator */}
        <div className="flex md:hidden items-center justify-center space-x-1.5 mt-6">
          {COLLECTIONS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === idx ? 'w-6 bg-atelier-softblack' : 'w-1.5 bg-atelier-parchment'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
