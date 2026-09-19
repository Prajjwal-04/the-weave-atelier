import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full h-[90vh] min-h-[600px] max-h-[920px] bg-atelier-deepblack overflow-hidden flex items-end">
      {/* Hero Editorial Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero/hero-main.jpg"
          alt="Contemporary architectural living room with The Weave Atelier handmade rug"
          className="w-full h-full object-cover object-center filter brightness-[0.88] scale-100 transition-transform duration-1000 ease-out"
        />
        {/* Subtle gradient vignette for calm readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-atelier-deepblack/85 via-atelier-deepblack/30 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 w-full">
        <div className="max-w-2xl space-y-6 animate-fadeIn">
          <div className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-atelier-parchment/90 font-medium flex items-center space-x-2">
            <span className="w-8 h-[1px] bg-atelier-parchment/60 inline-block" />
            <span>Independent Rug Atelier · Bhadohi, India</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.1]">
            Rugs for spaces that endure.
          </h1>

          <p className="text-sm sm:text-base text-atelier-parchment/85 font-light leading-relaxed max-w-xl">
            Handcrafted in Bhadohi, India. Designed for contemporary living. Ready-to-ship collections and bespoke custom sizing.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/shop"
              className="px-8 py-4 bg-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:bg-atelier-cream transition-all duration-300 text-center font-medium shadow-sm hover:shadow-lg flex items-center justify-center group"
            >
              <span>Shop The Collection</span>
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/the-atelier"
              className="px-8 py-4 bg-atelier-deepblack/40 backdrop-blur-md border border-atelier-parchment/40 text-white text-xs tracking-widest uppercase hover:bg-atelier-deepblack/70 hover:border-atelier-parchment transition-all duration-300 text-center font-medium"
            >
              Discover The Atelier
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
