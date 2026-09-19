import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sofa, Bed, Utensils, DoorOpen, ArrowRight, Check } from 'lucide-react';

export const SizeGuidePage: React.FC = () => {
  const [activeRoom, setActiveRoom] = useState<'living' | 'dining' | 'bedroom' | 'hallway'>('living');
  const [activeSize, setActiveSize] = useState<string>("8' × 10'");

  const rooms = [
    { id: 'living', name: 'Living Room', icon: Sofa },
    { id: 'dining', name: 'Dining Room', icon: Utensils },
    { id: 'bedroom', name: 'Primary Bedroom', icon: Bed },
    { id: 'hallway', name: 'Entry & Hallway', icon: DoorOpen },
  ];

  const sizeConfigs: Record<string, { desc: string; layoutRule: string; diagramType: string }> = {
    "5' × 8'": {
      desc: 'Ideal for intimate seating arrangements, compact urban apartments, or standalone coffee tables where only front legs touch or float.',
      layoutRule: 'Coffee table centered on rug. Sofa front legs rest off the rug or just barely touch the edge.',
      diagramType: 'compact',
    },
    "6' × 9'": {
      desc: 'A versatile transitional size for mid-sized spaces, secondary seating groups, or smaller living rooms.',
      layoutRule: 'Front legs of primary 3-seater sofa resting comfortably on rug with coffee table grounded in center.',
      diagramType: 'medium',
    },
    "8' × 10'": {
      desc: 'The gold standard living room anchor. Creates unity across sofas, accent chairs, and coffee tables.',
      layoutRule: 'Front legs of all seating comfortably anchored on rug, framing a unified conversational zone.',
      diagramType: 'anchor',
    },
    "9' × 12'": {
      desc: 'For expansive open-concept living rooms where all furniture sits completely on top of the rug.',
      layoutRule: 'All four legs of main sofa, side chairs, and occasional tables rest entirely within the rug perimeter.',
      diagramType: 'expansive',
    },
    "10' × 14'": {
      desc: 'Architectural scale for grand living rooms and great halls with generous floor space.',
      layoutRule: 'Full conversational island with 18 to 24 inches of bare perimeter flooring around the rug edge.',
      diagramType: 'grand',
    },
    "2.5' × 10' Runner": {
      desc: 'Designed for architectural transition corridors, gallery hallways, and beside kitchen islands.',
      layoutRule: 'Centered along hallway with 4 to 6 inches of floor revealed on both sides.',
      diagramType: 'runner',
    },
  };

  const availableSizesForRoom: Record<string, string[]> = {
    living: ["5' × 8'", "6' × 9'", "8' × 10'", "9' × 12'", "10' × 14'"],
    dining: ["6' × 9'", "8' × 10'", "9' × 12'", "10' × 14'"],
    bedroom: ["6' × 9'", "8' × 10'", "9' × 12'", "10' × 14'"],
    hallway: ["2.5' × 10' Runner", "5' × 8'"],
  };

  const currentAvailableSizes = availableSizesForRoom[activeRoom];

  // Auto-switch to an available size if not in list
  React.useEffect(() => {
    if (!currentAvailableSizes.includes(activeSize)) {
      setActiveSize(currentAvailableSizes[0]);
    }
  }, [activeRoom]);

  const currentConfig = sizeConfigs[activeSize] || sizeConfigs["8' × 10'"];

  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium">
            Spatial Architecture
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
            Rug Size & Placement Guide
          </h1>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
            The right rug frames your room and creates equilibrium. Explore our interactive architectural placement diagrams below.
          </p>
        </div>

        {/* Interactive Room Tabs */}
        <div className="flex justify-center flex-wrap gap-3">
          {rooms.map((r) => {
            const Icon = r.icon;
            const isActive = activeRoom === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRoom(r.id as any)}
                className={`flex items-center space-x-2 px-5 py-3 border text-xs tracking-wider uppercase transition-all ${
                  isActive
                    ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack shadow-sm'
                    : 'bg-atelier-cream border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe'
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>

        {/* Size Pills for Active Room */}
        <div className="flex justify-center flex-wrap gap-2 pt-2">
          {currentAvailableSizes.map((sz) => (
            <button
              key={sz}
              onClick={() => setActiveSize(sz)}
              className={`px-4 py-2 text-xs border rounded transition-colors ${
                activeSize === sz
                  ? 'bg-atelier-parchment border-atelier-darkbrown text-atelier-darkbrown font-medium'
                  : 'bg-atelier-ivory border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Visual Architectural Diagram Canvas */}
        <div className="bg-atelier-cream border border-atelier-parchment p-8 sm:p-12 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Visual Floorplan Representation */}
          <div className="lg:col-span-7 bg-atelier-ivory border border-atelier-parchment/80 p-8 sm:p-10 relative aspect-[16/11] flex items-center justify-center overflow-hidden">
            {/* Room Boundary Walls */}
            <div className="absolute inset-4 border border-dashed border-atelier-sand/80 pointer-events-none" />

            {/* Rug Simulation Plane */}
            <div
              className={`transition-all duration-500 bg-atelier-sand/40 border border-atelier-darkbrown/60 relative flex flex-col items-center justify-center ${
                activeSize === "5' × 8'"
                  ? 'w-[48%] h-[42%]'
                  : activeSize === "6' × 9'"
                  ? 'w-[58%] h-[52%]'
                  : activeSize === "8' × 10'"
                  ? 'w-[72%] h-[68%]'
                  : activeSize === "9' × 12'"
                  ? 'w-[84%] h-[80%]'
                  : activeSize === "10' × 14'"
                  ? 'w-[94%] h-[90%]'
                  : 'w-[28%] h-[85%]' // Runner
              }`}
            >
              <span className="font-mono text-xs text-atelier-darkbrown font-medium tracking-wider">
                {activeSize}
              </span>
              <span className="text-[9px] text-atelier-taupe">The Weave Atelier</span>

              {/* Simulated Furniture overlay depending on room */}
              {activeRoom === 'living' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2">
                  <div className="w-[60%] h-4 bg-atelier-taupe/30 mx-auto rounded-sm border border-atelier-taupe/40" />
                  <div className="w-12 h-6 bg-atelier-parchment border border-atelier-taupe/60 mx-auto rounded" />
                  <div className="flex justify-between px-2">
                    <div className="w-6 h-6 bg-atelier-taupe/20 border border-atelier-taupe/40 rounded-sm" />
                    <div className="w-6 h-6 bg-atelier-taupe/20 border border-atelier-taupe/40 rounded-sm" />
                  </div>
                </div>
              )}

              {activeRoom === 'dining' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[50%] h-[50%] bg-atelier-taupe/30 border border-atelier-taupe/50 rounded flex items-center justify-center text-[9px] text-atelier-taupe">
                    Table & Chairs
                  </div>
                </div>
              )}

              {activeRoom === 'bedroom' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-end items-center pb-2">
                  <div className="w-[55%] h-[65%] bg-atelier-taupe/30 border border-atelier-taupe/50 rounded flex items-center justify-center text-[9px] text-atelier-taupe">
                    Queen / King Bed
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Placement Notes */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
                Architectural Recommendation
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
                {activeSize} in the {rooms.find((r) => r.id === activeRoom)?.name}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
              {currentConfig.desc}
            </p>

            <div className="p-4 bg-atelier-ivory border border-atelier-parchment space-y-2">
              <div className="text-xs font-medium text-atelier-softblack uppercase tracking-wider">
                Spatial Guideline:
              </div>
              <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                {currentConfig.layoutRule}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/shop?size=${encodeURIComponent(activeSize)}`}
                className="px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors text-center font-medium flex items-center justify-center"
              >
                <span>Shop {activeSize} Rugs</span>
                <ArrowRight size={13} className="ml-2" />
              </Link>
              <Link
                to="/custom-rugs"
                className="px-6 py-3 bg-atelier-cream border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:border-atelier-taupe transition-colors text-center"
              >
                Need Custom Dimensions?
              </Link>
            </div>
          </div>
        </div>

        {/* Spatial Rules Reference Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-atelier-parchment">
          <div className="space-y-2">
            <h4 className="font-serif text-lg text-atelier-softblack">Rule of 18 Inches</h4>
            <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
              In traditional room layouts, leaving approximately 18 inches (45 cm) of bare hardwood or stone floor between the rug edges and room walls creates balanced proportions.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg text-atelier-softblack">Chair Pull-Out Clearance</h4>
            <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
              Always allow at least 24 to 30 inches (60–75 cm) extending past dining table edges so guests can slide dining chairs out without legs dropping off the pile.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg text-atelier-softblack">Bed Placement Horizon</h4>
            <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
              Under a king or queen bed, stop the rug 8 inches in front of nightstands and let it extend 2 to 3 feet past the bed footboard for an expansive look.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
