import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CraftsmanshipSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-atelier-cream/50 border-b border-atelier-parchment/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
            <span className="text-atelier-agedgold">CRAFT DISCIPLINE</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">CONSTRUCTION & TECHNIQUE</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
            The beauty of the <span className="italic font-normal text-atelier-agedgold">human hand</span>.
          </h2>
          <p className="text-xs sm:text-base text-atelier-charcoal/80 font-light leading-relaxed">
            Every rug from Prasri Rugs is shaped without automated weaving machinery. We practice time-honored Indian traditions calibrated by human patience, muscle memory, and generational touch.
          </p>
        </div>

        {/* Technique Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Card 1: Hand-Knotting */}
          <div className="bg-atelier-ivory border border-atelier-parchment p-8 sm:p-10 space-y-6 flex flex-col justify-between group hover:border-atelier-taupe transition-colors">
            <div className="space-y-4">
              <div className="aspect-[16/10] overflow-hidden bg-atelier-cream border border-atelier-parchment">
                <img
                  src="/images/craft/hand-knotting.jpg"
                  alt="Master artisan tying individual knots on vertical timber loom in Bhadohi"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="text-[10px] tracking-widest text-atelier-taupe uppercase font-mono">
                Technique 01 · Generational Heirloom
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
                Hand-Knotting
              </h3>

              <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
                Individual knots are tied one by one by master artisans directly onto vertical warp threads on a traditional timber loom. A single rug encompasses upwards of hundreds of thousands of knots, requiring exceptional skill, unwavering concentration, and weeks or months of patient handiwork. The resulting textile is an heirloom of structural integrity that softens and enriches across decades.
              </p>
            </div>

            <div className="pt-4 border-t border-atelier-parchment flex items-center justify-between text-xs text-atelier-taupe">
              <span>60 to 120 Knots per sq. in.</span>
              <span className="font-mono uppercase text-atelier-softblack">Persian & Tibetan Looms</span>
            </div>
          </div>

          {/* Card 2: Hand-Tufting */}
          <div className="bg-atelier-ivory border border-atelier-parchment p-8 sm:p-10 space-y-6 flex flex-col justify-between group hover:border-atelier-taupe transition-colors">
            <div className="space-y-4">
              <div className="aspect-[16/10] overflow-hidden bg-atelier-cream border border-atelier-parchment">
                <img
                  src="/images/craft/hand-tufting.jpg"
                  alt="Artisan sculpting high-low wool pile contours with hand shears"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="text-[10px] tracking-widest text-atelier-taupe uppercase font-mono">
                Technique 02 · Modern Textural Relief
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
                Hand-Tufting
              </h3>

              <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
                Hand-tufting utilizes a tightly stretched primary foundation canvas, onto which virgin wool is shot by hand using an artisan tufting tool. This method allows for complex contemporary contours, fluid lines, and multi-dimensional high-low pile depths. After tufting, each relief ridge is sculpted and beveled by hand using duckbill shears to create architectural tactility.
              </p>
            </div>

            <div className="pt-4 border-t border-atelier-parchment flex items-center justify-between text-xs text-atelier-taupe">
              <span>Carved & High-Low Pile</span>
              <span className="font-mono uppercase text-atelier-softblack">Plush Architectural Feel</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Link
            to="/craft"
            className="inline-flex items-center text-xs tracking-[0.25em] text-atelier-softblack hover:text-atelier-darkbrown uppercase font-medium border-b border-atelier-softblack pb-1 transition-all group"
          >
            <span>Explore Our Craft</span>
            <ArrowRight size={13} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
