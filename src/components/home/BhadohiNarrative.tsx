import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BhadohiNarrative: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const processMoments = [
    {
      step: '01',
      short: 'Yarn Selection',
      title: 'Yarn Selection & Blending',
      desc: 'Raw New Zealand long-staple fleece blended with resilient Indian highland wool for softness and natural pile memory.',
      image: '/images/narrative/stage-01-yarn-selection.jpg',
    },
    {
      step: '02',
      short: 'Mineral Dyeing',
      title: 'Small-Batch Mineral Dyeing',
      desc: 'Yarns are immersed in localized dye vats to achieve nuanced, earthy tonalities with exceptional colorfastness.',
      image: '/images/narrative/stage-02-mineral-dyeing.jpg',
    },
    {
      step: '03',
      short: 'Loom Weaving',
      title: 'The Loom at Work',
      desc: 'Rhythms of timber warp and weft guided by weavers whose families have practiced the trade across generations.',
      image: '/images/narrative/stage-03-loom-at-work.jpg',
    },
    {
      step: '04',
      short: 'Sun Curing',
      title: 'Artisanal Washing & Sun Curing',
      desc: 'Finished carpets are thoroughly cleansed with purified soft water and gentle plant-based cleansers, then cured under open-air sunlight on atelier terraces.',
      image: '/images/narrative/stage-04-washing-sun-drying.jpg',
    },
    {
      step: '05',
      short: 'Carving & Shearing',
      title: 'Shearing, Carving & Finishing',
      desc: 'Manual shearing using weighted iron blades and beveling scissors to level the pile and reveal tactile motifs.',
      image: '/images/narrative/stage-05-shearing-carving.jpg',
    },
    {
      step: '06',
      short: 'Inspection & Dispatch',
      title: 'Inspection & Insured Packaging',
      desc: 'Double-wrapped in breathable moisture-resistant barriers and rolled for secure international courier dispatch.',
      image: '/images/narrative/stage-06-inspection-packaging.jpg',
    },
  ];

  // Scroll to a specific stage index
  const scrollToStage = (index: number) => {
    setActiveStage(index);
    const target = stageRefs.current[index];
    if (target && sliderRef.current) {
      const slider = sliderRef.current;
      const leftPos = target.offsetLeft - slider.offsetLeft - 16;
      slider.scrollTo({
        left: leftPos,
        behavior: 'smooth',
      });
    }
  };

  const handlePrev = () => {
    const nextIndex = Math.max(0, activeStage - 1);
    scrollToStage(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = Math.min(processMoments.length - 1, activeStage + 1);
    scrollToStage(nextIndex);
  };

  // Sync active step when user swipes or scrolls manually
  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollLeft = slider.scrollLeft;
    
    // Find closest slide
    let closestIndex = 0;
    let minDistance = Infinity;

    stageRefs.current.forEach((el, idx) => {
      if (!el) return;
      const cardLeft = el.offsetLeft - slider.offsetLeft - 16;
      const distance = Math.abs(cardLeft - scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveStage(closestIndex);
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-atelier-ivory border-b border-atelier-parchment/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Dual Tone and Stage Slider Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14 space-y-4 md:space-y-0">
          <div className="max-w-2xl space-y-3">
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
              <span className="text-atelier-agedgold">THE CARPET CITY</span>
              <span className="text-atelier-taupe/40">·</span>
              <span className="text-atelier-taupe">ORIGIN & LINEAGE</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
              From Bhadohi, <span className="italic font-normal text-atelier-agedgold">India</span>.
            </h2>
            <p className="text-xs sm:text-sm text-atelier-charcoal/80 font-light leading-relaxed">
              Known worldwide as India’s carpet city, Bhadohi’s identity is inextricably tied to the loom. Explore the six deliberate stages of our slow artisanal craft.
            </p>
          </div>

          {/* Minimalist Carousel Controls with Active Step Counter */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="text-xs font-mono text-atelier-taupe tracking-widest uppercase">
              <span className="text-atelier-softblack font-semibold">STAGE 0{activeStage + 1}</span>
              <span className="mx-1 text-atelier-taupe/50">/</span>
              <span>0{processMoments.length}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeStage === 0}
                aria-label="Previous craft stage"
                className="w-9 h-9 rounded-full border border-atelier-parchment bg-atelier-cream/70 flex items-center justify-center text-atelier-softblack hover:border-atelier-agedgold hover:text-atelier-agedgold disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={activeStage === processMoments.length - 1}
                aria-label="Next craft stage"
                className="w-9 h-9 rounded-full border border-atelier-parchment bg-atelier-cream/70 flex items-center justify-center text-atelier-softblack hover:border-atelier-agedgold hover:text-atelier-agedgold disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Connected Horizontal Timeline Stepper Bar */}
        <div className="mb-10 overflow-x-auto scrollbar-none pb-2">
          <div className="min-w-[620px] flex items-center justify-between relative px-2">
            {/* Background connecting track line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-atelier-parchment z-0" />
            
            {/* Active connecting track progress */}
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-atelier-agedgold transition-all duration-300 z-0"
              style={{
                width: `${(activeStage / (processMoments.length - 1)) * 92}%`,
              }}
            />

            {processMoments.map((m, idx) => {
              const isActive = activeStage === idx;
              const isPassed = activeStage > idx;

              return (
                <button
                  key={m.step}
                  type="button"
                  onClick={() => scrollToStage(idx)}
                  className="group relative z-10 flex flex-col items-center focus:outline-none transition-all"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-all duration-300 border ${
                      isActive
                        ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack ring-4 ring-atelier-agedgold/20 scale-110 shadow-sm'
                        : isPassed
                        ? 'bg-atelier-parchment text-atelier-softblack border-atelier-taupe/40'
                        : 'bg-atelier-cream text-atelier-taupe border-atelier-parchment group-hover:border-atelier-agedgold group-hover:text-atelier-softblack'
                    }`}
                  >
                    {m.step}
                  </div>
                  <span
                    className={`mt-2 text-[10px] tracking-wider uppercase font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-atelier-softblack font-semibold'
                        : 'text-atelier-taupe group-hover:text-atelier-softblack'
                    }`}
                  >
                    {m.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliding Stages Carousel Rail */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex space-x-6 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-4 pt-1 cursor-grab active:cursor-grabbing"
        >
          {processMoments.map((m, idx) => {
            const isActive = activeStage === idx;

            return (
              <div
                key={m.step}
                ref={(el) => (stageRefs.current[idx] = el)}
                onClick={() => scrollToStage(idx)}
                className={`flex-shrink-0 w-[85vw] sm:w-[55vw] lg:w-[calc(33.333%-16px)] snap-start bg-atelier-cream/50 border overflow-hidden transition-all duration-300 group cursor-pointer ${
                  isActive
                    ? 'border-atelier-agedgold shadow-md bg-atelier-cream/80'
                    : 'border-atelier-parchment hover:border-atelier-taupe'
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-atelier-parchment relative">
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.95]"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-atelier-softblack/85 backdrop-blur-xs text-atelier-parchment px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase">
                    Stage {m.step} of 06
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-3">
                  <div className="text-[10px] font-mono tracking-widest text-atelier-agedgold uppercase">
                    Loom Discipline {m.step}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-light leading-snug">
                    {m.title}
                  </h3>
                  <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Story Quote */}
        <div className="mt-14 sm:mt-18 p-8 sm:p-12 bg-atelier-cream border border-atelier-parchment text-center max-w-3xl mx-auto space-y-4 shadow-xs">
          <p className="font-serif italic text-lg sm:text-xl text-atelier-darkbrown font-light leading-relaxed">
            “We don’t measure our craft in units per hour. We measure it by how a finished rug settles into a home, softens over a decade, and endures as a quiet foundation for everyday life.”
          </p>
          <div className="text-[10px] tracking-[0.25em] uppercase text-atelier-taupe font-medium">
            — Prasri Rugs, Bhadohi
          </div>
        </div>
      </div>
    </section>
  );
};
