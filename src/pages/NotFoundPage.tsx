import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-36 pb-28 text-center bg-atelier-ivory min-h-screen px-4 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto space-y-6 bg-atelier-cream border border-atelier-parchment p-10 sm:p-12 shadow-subtle">
        <div className="w-14 h-14 mx-auto rounded-full bg-atelier-ivory border border-atelier-parchment flex items-center justify-center text-atelier-darkbrown">
          <Compass size={24} strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] tracking-[0.3em] uppercase text-atelier-taupe font-mono">
            404 · Page Not Found
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-light tracking-tight">
            Lost in the Atelier
          </h1>
        </div>

        <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
          The page you requested does not exist or has been relocated to another loom gallery.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={13} />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-atelier-ivory border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:border-black transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};
