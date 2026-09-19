import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { COLLECTIONS } from '../../data/collections';

export const ShopByCollection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-atelier-ivory border-b border-atelier-parchment/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-3">
          <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium block">
            Design Disciplines
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal tracking-tight">
            Shop by Collection
          </h2>
          <p className="text-xs sm:text-sm text-atelier-charcoal/80 font-light leading-relaxed">
            Six focused aesthetic directions, each interpreting natural fibers and artisan techniques for considered spaces.
          </p>
        </div>

        {/* 6 Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to={`/collections/${c.slug}`}
              className="group block relative overflow-hidden bg-atelier-cream border border-atelier-parchment/70 transition-all duration-300 hover:border-atelier-taupe"
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
      </div>
    </section>
  );
};
