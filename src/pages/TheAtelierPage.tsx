import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Heart, Sparkles, Feather } from 'lucide-react';

export const TheAtelierPage: React.FC = () => {
  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium">
            Origin & Philosophy
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight leading-tight">
            Rooted in Bhadohi. Crafted for contemporary spaces.
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light leading-relaxed">
            The Weave Atelier was created around a simple conviction: that traditional Indian craftsmanship and modern interior design do not belong in separate worlds.
          </p>
        </div>

        {/* Large Editorial Image */}
        <div className="aspect-[16/9] overflow-hidden bg-atelier-parchment border border-atelier-parchment shadow-subtle">
          <img
            src="/images/atelier/the-atelier-studio.jpg"
            alt="Master artisan knotting carpet on loom in Bhadohi at The Weave Atelier"
            className="w-full h-full object-cover filter brightness-[0.98]"
          />
        </div>

        {/* Core Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-atelier-taupe">
              The Four Principles
            </span>
            <div className="font-serif text-2xl text-atelier-softblack font-normal">
              Craft · Material · Design · Longevity
            </div>
          </div>

          <div className="md:col-span-8 space-y-6 text-sm text-atelier-charcoal font-light leading-relaxed">
            <p>
              Based in Bhadohi—one of India’s most historic carpet-making regions—The Weave Atelier began not as a mass-production factory, but as a small studio dedicated to making rugs thoughtfully. For generations, Bhadohi’s artisan families have possessed an unrivaled mastery of warp, weft, and knotting. Yet much of this heritage was channeled into loud ornamental patterns that felt out of place in modern architectural spaces.
            </p>
            <p>
              We wanted to do something quieter. We stripped away excess ornamentation, focused on natural undyed and earthy mineral-dyed fleeces, and introduced restrained contemporary geometry. The result is a collection of rugs that ground a room with warmth, texture, and quiet character.
            </p>
            <p>
              We believe our smaller scale is an advantage. We know every loom, we inspect every dye lot, and we coordinate directly with homeowners, architects, and designers across the world. When you choose a rug from The Weave Atelier, you are supporting a direct, human-made process.
            </p>
          </div>
        </div>

        {/* Founder / Atelier Note (Personal & Grounded) */}
        <div className="p-8 sm:p-12 bg-atelier-cream border border-atelier-parchment space-y-6">
          <div className="flex items-center space-x-2 text-[10px] tracking-widest uppercase text-atelier-taupe font-medium">
            <MapPin size={12} className="text-atelier-agedgold" />
            <span>A Note from the Atelier Studio</span>
          </div>

          <blockquote className="font-serif italic text-lg sm:text-2xl text-atelier-softblack font-light leading-relaxed">
            “We are not interested in becoming the largest rug exporter. Our focus is far more personal: to craft rugs that feel honest, tactile, and comfortable to live with for years to come. Every knot tied on our Bhadohi looms carries the patience of real hands.”
          </blockquote>

          <div className="pt-2 text-xs text-atelier-taupe font-sans">
            — The Weave Atelier Founder & Master Weavers, Bhadohi
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center space-y-4 pt-8 border-t border-atelier-parchment">
          <h3 className="font-serif text-2xl text-atelier-softblack">
            Experience Our Collections
          </h3>
          <p className="text-xs text-atelier-charcoal max-w-md mx-auto font-light">
            Explore ready-to-ship designs or speak with our Bhadohi studio about crafting a custom rug for your home.
          </p>
          <div className="flex justify-center space-x-4 pt-2">
            <Link
              to="/shop"
              className="px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
            >
              Shop Collection
            </Link>
            <Link
              to="/custom-rugs"
              className="px-6 py-3 bg-atelier-cream border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:border-atelier-taupe transition-colors"
            >
              Custom Request
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
