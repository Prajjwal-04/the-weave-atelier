import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const BhadohiNarrative: React.FC = () => {
  const processMoments = [
    {
      step: '01',
      title: 'Yarn Selection & Blending',
      desc: 'Raw New Zealand long-staple fleece blended with resilient Indian highland wool for softness and natural pile memory.',
      image: '/images/narrative/stage-01-yarn-selection.jpg',
    },
    {
      step: '02',
      title: 'Small-Batch Mineral Dyeing',
      desc: 'Yarns are immersed in localized dye vats to achieve nuanced, earthy tonalities with exceptional colorfastness.',
      image: '/images/narrative/stage-02-mineral-dyeing.jpg',
    },
    {
      step: '03',
      title: 'The Loom at Work',
      desc: 'Rhythms of timber warp and weft guided by weavers whose families have practiced the trade across generations.',
      image: '/images/narrative/stage-03-loom-at-work.jpg',
    },
    {
      step: '04',
      title: 'Artisanal Washing & Sun Curing',
      desc: 'Finished carpets are thoroughly cleansed with purified soft water and gentle plant-based cleansers, then cured under open-air sunlight on atelier terraces.',
      image: '/images/narrative/stage-04-washing-sun-drying.jpg',
    },
    {
      step: '05',
      title: 'Shearing, Carving & Finishing',
      desc: 'Manual shearing using weighted iron blades and beveling scissors to level the pile and reveal tactile motifs.',
      image: '/images/narrative/stage-05-shearing-carving.jpg',
    },
    {
      step: '06',
      title: 'Inspection & Insured Packaging',
      desc: 'Double-wrapped in breathable moisture-resistant barriers and rolled for secure international courier dispatch.',
      image: '/images/narrative/stage-06-inspection-packaging.jpg',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-atelier-ivory border-b border-atelier-parchment/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
            <span className="text-atelier-agedgold">THE CARPET CITY</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">ORIGIN & LINEAGE</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
            From Bhadohi, <span className="italic font-normal text-atelier-agedgold">India</span>.
          </h2>
          <p className="text-xs sm:text-base text-atelier-charcoal/80 font-light leading-relaxed">
            Known worldwide as India’s carpet city, Bhadohi’s identity is inextricably tied to the loom. Here, carpet making is not an industrial spectacle—it is an art of patience, quiet dignity, and tactile precision practiced in tranquil village workshops.
          </p>
        </div>

        {/* 6 Step Photographic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {processMoments.map((m) => (
            <div
              key={m.step}
              className="bg-atelier-cream/50 border border-atelier-parchment overflow-hidden group hover:border-atelier-taupe transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden bg-atelier-parchment">
                <img
                  src={m.image}
                  alt={m.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.95]"
                  loading="lazy"
                />
              </div>
              <div className="p-6 space-y-2">
                <div className="text-[10px] font-mono tracking-widest text-atelier-taupe uppercase">
                  Stage {m.step}
                </div>
                <h3 className="font-serif text-lg text-atelier-softblack font-medium">
                  {m.title}
                </h3>
                <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Story Quote */}
        <div className="mt-16 p-8 sm:p-12 bg-atelier-cream border border-atelier-parchment text-center max-w-3xl mx-auto space-y-4">
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
