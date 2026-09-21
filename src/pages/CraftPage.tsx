import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export const CraftPage: React.FC = () => {
  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium">
            Loom & Technique
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight leading-tight">
            The Craft of the Loom
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light leading-relaxed">
            In an era of industrial speed, we honor the deliberate pace of handmade carpet weaving. Discover how our artisans in Bhadohi transform raw fleece into enduring architectural foundations.
          </p>
        </div>

        {/* Deep Dive 1: Hand-Knotting */}
        <div className="space-y-8 border-t border-atelier-parchment pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs text-atelier-agedgold uppercase tracking-widest">
                Technique 01 · Generational Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal">
                Hand-Knotting
              </h2>
              <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
                Hand-knotting is the most ancient and durable form of carpet construction. Master weavers work on an upright timber loom, tying individual knots of yarn around vertical cotton warp strands. Each row of knots is secured by inserting a horizontal weft thread and beating it down firmly with a heavy iron comb.
              </p>
              <div className="space-y-2 text-xs text-atelier-charcoal/90 pt-2 font-light">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-atelier-agedgold flex-shrink-0" />
                  <span>Between 60 and 120 knots per square inch</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-atelier-agedgold flex-shrink-0" />
                  <span>No adhesives or chemical backings used</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-atelier-agedgold flex-shrink-0" />
                  <span>Heirloom longevity spanning decades and generations</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 aspect-[16/11] overflow-hidden bg-atelier-cream border border-atelier-parchment">
              <img
                src="/images/craft/hand-knotting.jpg"
                alt="Hand-knotted loom in Bhadohi"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Deep Dive 2: Hand-Tufting */}
        <div className="space-y-8 border-t border-atelier-parchment pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 aspect-[16/11] overflow-hidden bg-atelier-cream border border-atelier-parchment">
              <img
                src="/images/craft/hand-tufting.jpg"
                alt="Hand-tufting and pile carving with shears"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <span className="font-mono text-xs text-atelier-agedgold uppercase tracking-widest">
                Technique 02 · Modern Textural Relief
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal">
                Hand-Tufting & Carving
              </h2>
              <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
                Hand-tufting brings modern sculptural possibilities to life. The rug pattern is stenciled onto a primary cotton canvas stretched tightly on a vertical frame. Using a hand-operated tufting gun, artisans shoot blended wool strands through the canvas. The reverse is sealed with natural latex and a protective secondary cotton backing.
              </p>
              <div className="space-y-2 text-xs text-atelier-charcoal/90 pt-2 font-light">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-atelier-agedgold flex-shrink-0" />
                  <span>High-low pile depths and carved relief contours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-atelier-agedgold flex-shrink-0" />
                  <span>Hand-sculpted bevels using traditional duckbill shears</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={13} className="text-atelier-agedgold flex-shrink-0" />
                  <span>Plush, dense comfort underfoot for contemporary living</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Finishing Process: River Washing & Sun Drying */}
        <div className="bg-atelier-cream border border-atelier-parchment p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] tracking-widest text-atelier-taupe uppercase font-mono">
              The Finishing Touch
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
              Fresh Water Washing & Rooftop Sun Curing
            </h3>
            <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
              Once taken off the loom, rugs are thoroughly washed using fresh local groundwater and wide wooden paddles to cleanse loose fibers and bring out the natural luster of the wool. The rugs are then laid across rooftop terraces under the Indian sun to dry naturally, allowing the fibers to lock into place before final hand-binding.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-8 border-t border-atelier-parchment space-y-4">
          <h3 className="font-serif text-2xl text-atelier-softblack">
            Explore Handcrafted Rugs
          </h3>
          <p className="text-xs text-atelier-charcoal max-w-sm mx-auto font-light">
            Discover our active catalog of ready-to-ship pieces and custom bespoke designs.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-3.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
            >
              <span>View Catalog</span>
              <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
