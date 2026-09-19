import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';

export const InstagramFeed: React.FC = () => {
  const instagramMoments = [
    {
      id: 'ig-1',
      image: '/images/moments/moment-1.jpg',
      caption: 'Studio mornings · Hand-spun wool skeins catching golden daylight',
    },
    {
      id: 'ig-2',
      image: '/images/moments/moment-2.jpg',
      caption: 'Knot tension on vertical timber loom · Master weaver in Bhadohi',
    },
    {
      id: 'ig-3',
      image: '/images/moments/moment-3.jpg',
      caption: 'Botanical relief in a serene sunlit living sanctuary',
    },
    {
      id: 'ig-4',
      image: '/images/moments/moment-4.jpg',
      caption: 'Hand-shearing high-low pile contours with artisan duckbill shears',
    },
  ];

  return (
    <section className="py-20 bg-atelier-cream/40 border-b border-atelier-parchment/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 space-y-3 sm:space-y-0">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium block">
              Direct from the Studio
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal tracking-tight">
              Atelier Moments
            </h2>
          </div>

          <a
            href="https://instagram.com/theweaveatelier"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs tracking-widest text-atelier-charcoal hover:text-atelier-softblack uppercase font-medium border-b border-atelier-taupe/40 pb-0.5 group transition-colors"
          >
            <Instagram size={14} className="mr-1.5 text-atelier-taupe" />
            <span>Follow The Atelier @theweaveatelier</span>
            <ArrowUpRight size={13} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* 4 Image Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {instagramMoments.map((item) => (
            <a
              key={item.id}
              href="https://instagram.com/theweaveatelier"
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative aspect-square overflow-hidden bg-atelier-parchment border border-atelier-parchment/80"
            >
              <img
                src={item.image}
                alt={item.caption}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-atelier-softblack/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 text-white">
                <p className="text-[11px] leading-snug font-light line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
