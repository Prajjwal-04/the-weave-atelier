import React, { useState, useRef } from 'react';
import { Sparkles, Shield, Feather, Wind } from 'lucide-react';

export const MaterialsSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const materials = [
    {
      title: 'Blended & Pure Virgin Wool',
      role: 'The Foundation of Resilience',
      desc: 'We combine long-staple New Zealand wool—chosen for its soft hand and clear fiber color—with indigenous Indian highland fleece, known for its crimp and natural lanolin content. This blend produces rugs that resist crushing, self-clean minor spills, and age gracefully.',
      badge: 'Natural & Renewable',
      composition: 'Primary pile in 90% of our catalog',
    },
    {
      title: 'Mulberry & Botanical Silk',
      role: 'Luster & Tactile Refinement',
      desc: 'Used sparingly for highlights and fine hand-knotted borders, our silk fibers reflect ambient light with a subtle, non-synthetic glow. It brings delicate shifts in tonal depth as you walk around the rug from daylight to evening lighting.',
      badge: 'Subtle Luster',
      composition: 'Accent fibers in select collector pieces',
    },
    {
      title: 'Botanical Viscose & Bamboo Fiber',
      role: 'Silken Softness & Contrast',
      desc: 'Derived from natural plant cellulose, botanical viscose provides a cool, velvety touch and a shimmering surface sheen that contrasts beautifully when tufted alongside dense, matte wool.',
      badge: 'Plant-Derived Cellulose',
      composition: 'Blended in Modern Forms & Botanical Studies',
    },
    {
      title: 'Unbleached Organic Cotton',
      role: 'Structural Warp & Scrim',
      desc: 'The internal skeleton of every rug. We use tightly spun unbleached cotton threads for vertical warp tension on looms and backing scrims, ensuring dimensional stability that prevents warping or curling on your floors.',
      badge: 'Dimensional Stability',
      composition: 'Foundation warp, weft & backing',
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const itemWidth = clientWidth * 0.82;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIdx(Math.min(materials.length - 1, Math.max(0, index)));
  };

  return (
    <section className="py-20 sm:py-28 bg-atelier-cream/30 border-b border-atelier-parchment/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-14 space-y-3">
          <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
            <span className="text-atelier-agedgold">AUTHENTIC FIBERS</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">FIBER & COMPOSITION</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal tracking-tight">
            Materials Chosen for <span className="italic font-normal text-atelier-agedgold">Longevity</span>
          </h2>
          <p className="text-xs sm:text-base text-atelier-charcoal/80 font-light leading-relaxed">
            We avoid synthetic polyester and nylon backings. Every fiber in our atelier is chosen for tactile warmth, durability underfoot, and honest aging.
          </p>
        </div>

        {/* Responsive Hybrid: Mobile Swipe Rail | Desktop 4-Column Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 overflow-x-auto md:overflow-visible scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-4 md:pb-0"
        >
          {materials.map((m) => (
            <div
              key={m.title}
              className="flex-shrink-0 w-[82vw] sm:w-[50vw] md:w-auto snap-start bg-atelier-ivory border border-atelier-parchment p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-atelier-taupe transition-colors"
            >
              <div className="space-y-2">
                <span className="inline-block text-[9px] tracking-wider uppercase text-atelier-darkbrown bg-atelier-parchment/80 px-2 py-0.5 font-medium">
                  {m.badge}
                </span>
                <h3 className="font-serif text-xl text-atelier-softblack font-medium pt-1">
                  {m.title}
                </h3>
                <div className="text-[11px] text-atelier-taupe font-medium">
                  {m.role}
                </div>
                <p className="text-xs text-atelier-charcoal font-light leading-relaxed pt-2">
                  {m.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-atelier-parchment text-[10px] text-atelier-taupe font-mono">
                {m.composition}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Pagination Dots Indicator */}
        <div className="flex md:hidden items-center justify-center space-x-1.5 mt-6">
          {materials.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === idx ? 'w-6 bg-atelier-softblack' : 'w-1.5 bg-atelier-parchment'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
