import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full h-[92vh] min-h-[640px] max-h-[960px] bg-atelier-deepblack overflow-hidden flex items-end">
      {/* 4K Hero Editorial Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/images/hero/hero-main.jpg"
          alt="Contemporary architectural living room with Prasri Rugs handmade rug"
          className="w-full h-full object-cover object-center filter brightness-[0.93] contrast-[1.04]"
          loading="eager"
          decoding="async"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        />
        {/* Balanced Luxury Vignette for Crisp Contrast & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-atelier-deepblack/90 via-atelier-deepblack/35 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-atelier-deepblack/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 w-full">
        <div className="max-w-2xl space-y-6 animate-fadeIn">
          <div className="text-[11px] sm:text-xs tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
            <span className="w-8 h-[1px] bg-atelier-gold/60 inline-block" />
            <span className="text-atelier-gold font-medium">Independent Rug Atelier</span>
            <span className="text-atelier-parchment/40">·</span>
            <span className="text-atelier-parchment/90 font-light">Bhadohi, India</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.08]">
            Rugs for spaces that <span className="italic font-normal text-atelier-gold">endure</span>.
          </h1>

          <p className="text-sm sm:text-base text-atelier-parchment/90 font-light leading-relaxed max-w-xl">
            Handcrafted knot by knot in Bhadohi, India. Pure natural fibers, intentional textures, and bespoke sizing for modern architectural spaces.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/shop"
              className="relative group px-8 py-4 bg-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:bg-white transition-all duration-300 text-center font-medium shadow-lg hover:shadow-2xl flex items-center justify-center overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Shop The Collection
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>

            <Link
              to="/the-atelier"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-white/60 text-white text-xs tracking-widest uppercase transition-all duration-300 text-center font-medium shadow-sm"
            >
              Discover The Atelier
            </Link>
          </div>
        </div>
      </div>

      {/* Ambient Scroll to Explore Indicator */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-10 hidden sm:flex items-center space-x-3 text-atelier-parchment/70 select-none pointer-events-none">
        <span className="text-[9px] tracking-[0.3em] uppercase font-sans font-light">Scroll to Explore</span>
        <div className="w-[1px] h-8 bg-atelier-parchment/30 relative overflow-hidden">
          <div className="w-full h-1/2 bg-atelier-parchment animate-scrollPulse" />
        </div>
      </div>

      {/* Provenance Stamp */}
      <div className="absolute bottom-6 left-6 sm:left-8 z-10 hidden lg:flex items-center space-x-2 text-[9px] tracking-[0.25em] uppercase text-atelier-parchment/60 font-mono select-none pointer-events-none">
        <span>01 / 06</span>
        <span>·</span>
        <span>Pure Bikaner Wool & Raw Silk</span>
        <span>·</span>
        <span>Loom 14, Bhadohi</span>
      </div>
    </section>
  );
};
