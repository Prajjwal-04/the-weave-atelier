import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Droplets, RotateCw, Sun, Sparkles, Archive, Scissors, AlertCircle } from 'lucide-react';

export const RugCarePage: React.FC = () => {
  const careSections = [
    {
      icon: Wind,
      title: 'Vacuuming Guidelines',
      desc: 'Vacuum your rug weekly using suction only. Avoid rotating brush attachments or beater bars, which can pull or agitate the hand-sheared surface fibers. For fringe borders, vacuum along the pile length without letting the suction intake drag over tassels.',
    },
    {
      icon: Droplets,
      title: 'Immediate Spill Response',
      desc: 'Blot—never rub or scrub—liquid spills immediately with an absorbent, dry white cotton towel or paper towel. For water-soluble spots, dab gently with a damp cloth moistened with lukewarm water and a drop of neutral wool-safe detergent. Never soak the backing canvas.',
    },
    {
      icon: RotateCw,
      title: 'Seasonal Rotation',
      desc: 'Rotate your rug 180 degrees every six months. This distributes foot traffic evenly across pathways and balances natural sunlight exposure across all quadrants of the room.',
    },
    {
      icon: Sun,
      title: 'Sunlight & UV Exposure',
      desc: 'While our mineral dyes are colorfast, prolonged continuous direct sunlight through un-tinted windows can slowly mellow natural fibers over years. Use sheer drapery during peak afternoon glare where appropriate.',
    },
    {
      icon: Scissors,
      title: 'Natural Fiber Shedding',
      desc: 'All genuine wool rugs shed minor fuzz during their first 4 to 8 weeks. This is simply loose unspun staple fibers releasing from the newly sheared pile. It does not affect density and naturally subsides with gentle weekly vacuuming.',
    },
    {
      icon: AlertCircle,
      title: 'Sprouts & Loose Threads',
      desc: 'If a stray tuft or yarn sprout rises above the pile line, never pull it. Simply clip it level with the surrounding pile using sharp household scissors. This is standard for handmade rugs and will not unravel the structure.',
    },
    {
      icon: Sparkles,
      title: 'Professional Cleaning',
      desc: 'We recommend professional cleaning by a specialist certified in handmade oriental or wool rugs every 3 to 5 years. Avoid commercial steam extraction or aggressive dry-cleaning chemicals that strip natural lanolin oils.',
    },
    {
      icon: Archive,
      title: 'Storage & Folding',
      desc: 'If storing your rug, roll it pile-inward around a cardboard tube. Never fold a hand-tufted rug with canvas backing, as this can crack latex vulcanization. Store in a cool, dry, ventilated space wrapped in breathable cotton or paper.',
    },
  ];

  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium mb-2">
            Preservation & Stewardship
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight">
            Rug Care & Maintenance
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light mt-3 leading-relaxed">
            A handmade wool rug is a living textile. With simple, considerate stewardship, your piece will soften, develop a subtle patina, and endure for decades.
          </p>
        </div>

        {/* Natural Variation Callout */}
        <div className="p-8 bg-atelier-cream border border-atelier-parchment space-y-3">
          <h3 className="font-serif text-2xl text-atelier-softblack font-normal">
            The Character of the Human Hand
          </h3>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
            Unlike machine-loomed factory carpets, handmade rugs carry subtle, beautiful nuances. Minor shifts in yarn dye absorption (abrash), subtle line variations, and slight dimensional tolerance (±1–2 inches) are the hallmark of authentic Indian craftsmanship. They verify that your piece was shaped knot by knot and tuft by tuft by master weavers in Bhadohi.
          </p>
        </div>

        {/* 8 Care Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {careSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.title}
                className="bg-atelier-ivory border border-atelier-parchment p-8 space-y-4 hover:border-atelier-taupe transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-atelier-cream border border-atelier-parchment text-atelier-agedgold">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-xl text-atelier-softblack font-medium">
                    {sec.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Contact Concierge Assistance */}
        <div className="text-center pt-8 border-t border-atelier-parchment space-y-4">
          <h3 className="font-serif text-2xl text-atelier-softblack">
            Have a Specific Care Question?
          </h3>
          <p className="text-xs text-atelier-charcoal max-w-md mx-auto font-light">
            Our Bhadohi studio team is available to advise on spot cleaning, pad recommendations, and certified professional washes.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
            >
              Contact Atelier Concierge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
