import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ruler, CheckCircle2 } from 'lucide-react';

export const CustomRugsPreview: React.FC = () => {
  const steps = [
    { num: '01', title: 'Share your requirements', desc: 'Provide room dimensions, desired shape, and aesthetic intent.' },
    { num: '02', title: 'Discuss size, material & design', desc: 'Refine fiber blend (wool/silk) and tactile pile height.' },
    { num: '03', title: 'Receive quotation', desc: 'Clear timeline, digital layout rendering, and all-inclusive pricing.' },
    { num: '04', title: 'Approve the details', desc: 'Confirm specs before master weavers warp the loom in Bhadohi.' },
    { num: '05', title: 'Rug enters production', desc: 'Crafted knot by knot or tufted with hand-sculpted contours.' },
    { num: '06', title: 'Final inspection', desc: 'Washed, sun-cured, hand-sheared, and conditioned to perfection.' },
    { num: '07', title: 'International delivery', desc: 'Dispatched via insured express air courier directly to your door.' },
  ];

  return (
    <section className="py-20 sm:py-28 bg-atelier-softblack text-atelier-parchment border-b border-atelier-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Text & CTA */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
              <span className="text-atelier-gold">ARCHITECTURAL BESPOKE</span>
              <span className="text-atelier-parchment/40">·</span>
              <span className="text-atelier-parchment/70">CUSTOM RUG SERVICE</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-atelier-cream tracking-tight leading-tight">
              Made for <span className="italic font-normal text-atelier-gold">your space</span>.
            </h2>
            <p className="text-xs sm:text-sm text-atelier-parchment/80 font-light leading-relaxed">
              Standard sizes don’t always suit unique floor plans, curved walls, or expansive open layouts. We build one-of-a-kind rugs to your exact architectural dimensions, shapes, and color palettes directly from our Bhadohi studio.
            </p>
            <div className="space-y-2 pt-2 text-xs text-atelier-parchment/70 font-light">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-atelier-gold flex-shrink-0" />
                <span>Any length, width, circular, runner or organic freeform silhouette</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={14} className="text-atelier-gold flex-shrink-0" />
                <span>Delivered worldwide with door-to-door courier tracking</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/custom-rugs"
                className="inline-flex items-center px-8 py-4 bg-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:bg-atelier-cream transition-colors font-medium group shadow-sm"
              >
                <span>Start a Custom Request</span>
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: 7-Step Sequence */}
          <div className="lg:col-span-7 bg-atelier-deepblack/60 border border-atelier-charcoal p-6 sm:p-8 space-y-4">
            <div className="text-[10px] tracking-widest text-atelier-taupe uppercase font-mono pb-2 border-b border-atelier-charcoal flex items-center justify-between">
              <span>The 7-Step Bespoke Journey</span>
              <span>Bhadohi Studio</span>
            </div>

            <div className="space-y-3.5 divide-y divide-atelier-charcoal/40">
              {steps.map((s) => (
                <div key={s.num} className="pt-3.5 first:pt-0 flex items-start space-x-4">
                  <span className="font-mono text-xs text-atelier-gold font-medium flex-shrink-0">
                    {s.num}
                  </span>
                  <div>
                    <div className="text-sm font-serif text-atelier-cream font-medium">
                      {s.title}
                    </div>
                    <div className="text-[11px] text-atelier-parchment/70 font-light mt-0.5">
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
