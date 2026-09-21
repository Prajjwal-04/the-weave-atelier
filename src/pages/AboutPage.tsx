import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, Feather, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium">
            About The Weave Atelier
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight leading-tight">
            An independent rug atelier rooted in Bhadohi.
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light leading-relaxed">
            We started with a simple belief: that handmade rugs should be designed thoughtfully for contemporary spaces, without losing their human soul.
          </p>
        </div>

        {/* Editorial Photo */}
        <div className="aspect-[16/9] overflow-hidden bg-atelier-parchment border border-atelier-parchment shadow-subtle">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85"
            alt="The Weave Atelier contemporary rug in architectural interior"
            className="w-full h-full object-cover filter brightness-[0.92]"
          />
        </div>

        {/* Brand Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-atelier-taupe">
              Our Foundations
            </span>
            <div className="font-serif text-2xl text-atelier-softblack">
              Craft + Material + Design + Longevity
            </div>
          </div>

          <div className="md:col-span-8 space-y-6 text-sm text-atelier-charcoal font-light leading-relaxed">
            <p>
              The Weave Atelier was created around a love for traditional Indian craftsmanship and modern interior design. Based in Bhadohi—one of India’s most celebrated carpet-weaving districts—we work directly with master artisans who have inherited centuries of loom knowledge.
            </p>
            <p>
              Growing from our early beginnings on artisan platforms into an independent atelier, our focus has always stayed the same: we do not mass produce. We make rugs slowly, piece by piece, using genuine New Zealand and Indian virgin wools, unbleached cotton foundations, and non-toxic dyes.
            </p>
            <p>
              Instead of competing with industrial carpet mills, we embrace the intimacy of the small studio. That smaller scale is our strength. It means every rug receives personal attention, every custom size is hand-drafted, and every customer deals directly with people who care deeply about what they make.
            </p>
          </div>
        </div>

        {/* Founder's Reflection */}
        <div className="p-8 sm:p-12 bg-atelier-cream border border-atelier-parchment space-y-4">
          <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
            Founder & Master Weavers' Note
          </div>
          <p className="font-serif text-lg sm:text-2xl text-atelier-softblack font-light leading-relaxed italic">
            “When someone discovers us from thousands of miles away and trusts us to make a rug for their home, we take that responsibility seriously. We are not trying to be the biggest company—we are trying to make beautiful rugs, thoughtfully.”
          </p>
          <div className="text-xs text-atelier-taupe pt-2">
            The Weave Atelier Team · Bhadohi, India
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-8 border-t border-atelier-parchment space-y-4">
          <h3 className="font-serif text-2xl text-atelier-softblack">
            Discover Our Work
          </h3>
          <div className="flex justify-center space-x-4 pt-2">
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium"
            >
              Shop All Rugs
            </Link>
            <Link
              to="/custom-rugs"
              className="px-8 py-3.5 bg-atelier-cream border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:border-atelier-taupe transition-colors font-medium"
            >
              Custom Sizing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
