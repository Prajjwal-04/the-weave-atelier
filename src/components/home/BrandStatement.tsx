import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const BrandStatement: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-atelier-ivory border-b border-atelier-parchment/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium">
          The Atelier Philosophy
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-atelier-softblack font-light tracking-tight leading-snug">
          Made slowly. Chosen thoughtfully.
        </h2>

        <p className="text-base sm:text-lg text-atelier-charcoal font-light leading-relaxed max-w-2xl mx-auto">
          From Bhadohi, one of India’s great carpet-making regions, The Weave Atelier creates handmade rugs where traditional craft meets contemporary design. Each piece is made with patience, character and an appreciation for the spaces it will inhabit.
        </p>

        <div className="pt-2">
          <Link
            to="/the-atelier"
            className="inline-flex items-center text-xs tracking-[0.25em] text-atelier-softblack hover:text-atelier-darkbrown uppercase font-medium border-b border-atelier-softblack pb-1 transition-all group"
          >
            <span>Discover Our Story</span>
            <ArrowRight size={13} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
