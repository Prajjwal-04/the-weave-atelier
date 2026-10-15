import React, { useState } from 'react';
import { Sofa, Bed, Utensils, Info, LucideIcon } from 'lucide-react';
import { ProductVariant } from '../../types';

interface RoomScaleVisualizerProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
  productName: string;
}

type RoomType = 'living' | 'bedroom' | 'dining';

interface RoomMeta {
  id: RoomType;
  title: string;
  icon: LucideIcon;
  description: string;
}

const ROOMS: RoomMeta[] = [
  {
    id: 'living',
    title: 'Living Room',
    icon: Sofa,
    description: 'Sofa & coffee table seating arrangement',
  },
  {
    id: 'bedroom',
    title: 'Primary Bedroom',
    icon: Bed,
    description: 'King or Queen bed with floating margins',
  },
  {
    id: 'dining',
    title: 'Dining Room',
    icon: Utensils,
    description: '6–8 person dining table with pulled chairs',
  },
];

export const RoomScaleVisualizer: React.FC<RoomScaleVisualizerProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
  productName,
}) => {
  const [activeRoom, setActiveRoom] = useState<RoomType>('living');

  // Extract clean dimension key like "4' × 6'" or "8' × 10'"
  const currentDim = selectedVariant.dimensionsFt || selectedVariant.size.split('(')[0].trim();

  // Placement guideline based on room & size
  const getPlacementGuidance = (dim: string, room: RoomType): string => {
    const clean = dim.toLowerCase();
    if (room === 'living') {
      if (clean.includes("4' × 6'") || clean.includes("4x6") || clean.includes("3' × 5'") || clean.includes("3x5")) {
        return "Ideal for compact reading nooks, entry vignettes, or as an accent layer placed directly under a central coffee table while seating remains on the hardwood floor.";
      }
      if (clean.includes("5' × 8'") || clean.includes("5x8")) {
        return "Ideal for compact apartments. Place coffee table centered; front legs of seating can either rest off or just graze the rug's border.";
      }
      if (clean.includes("6' × 9'") || clean.includes("8' × 10'") || clean.includes("6x9") || clean.includes("8x10")) {
        return "The modern classic layout. Front legs of sofa and armchairs sit on the rug, anchoring the conversation space seamlessly.";
      }
      if (clean.includes("9' × 12'") || clean.includes("10' × 14'") || clean.includes("12' × 15'")) {
        return "The grand architectural layout. All sofa and chair legs sit completely within the rug boundary, creating an expansive room-within-a-room.";
      }
      if (clean.includes('runner')) {
        return "Perfect for connecting hallways, galley seating passages, or behind floating sofa console arrangements.";
      }
      return "Ensure at least 14 to 18 inches of exposed flooring between the rug perimeter and the room perimeter walls.";
    }

    if (room === 'bedroom') {
      if (clean.includes("4' × 6'") || clean.includes("4x6") || clean.includes("3' × 5'")) {
        return "Place alongside the bed as a plush bedside landing step for a warm morning greeting.";
      }
      if (clean.includes("5' × 8'") || clean.includes("5x8")) {
        return "Place horizontally across the bottom third of the bed to provide a soft landing step in smaller bedroom suites.";
      }
      if (clean.includes("8' × 10'") || clean.includes("6' × 9'") || clean.includes("8x10")) {
        return "Slide under the lower two-thirds of the bed perpendicular to the frame, extending at least 24 inches on both sides.";
      }
      return "Extends beneath both the bed and bedside nightstands with generous perimeter margins for a luxurious boutique hotel ambiance.";
    }

    // Dining
    if (clean.includes("4' × 6'") || clean.includes("4x6") || clean.includes("3' × 5'")) {
      return "Best suited as an accent rug near sideboard credenzas or tea nooks rather than beneath a primary dining table.";
    }
    if (clean.includes("5' × 8'") || clean.includes("6' × 9'") || clean.includes("5x8")) {
      return "Best suited for compact 4-seater breakfast tables. Chairs should stay on the surface when pulled out.";
    }
    return "Accommodates a full 6 to 8-person dining table. Allows chairs to remain fully on the rug even when guests slide back from the table.";
  };

  // Mathematically accurate proportional scaling for 16' × 12' architectural room footprint
  const calculateRugScale = (dimStr: string) => {
    const clean = (dimStr || '').trim().toLowerCase();

    // 1. Check for Round rugs e.g. "6' Round" or "8' Round"
    const roundMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:'|ft)?\s*(?:round|dia|circle)/);
    if (roundMatch) {
      const dia = parseFloat(roundMatch[1]);
      const pct = Math.min(85, Math.max(26, (dia / 12) * 80));
      return {
        widthPercent: pct * 0.75, // adjust for 16:11 aspect ratio to maintain true visual circular 1:1 shape
        heightPercent: pct,
        isRound: true,
        isRunner: false,
      };
    }

    // 2. Check for Runner
    const isRunner = clean.includes('runner');

    // 3. Match general dimensions e.g. "4' × 6'", "4x6", "5' × 8'", "8' × 10'", "10' × 14'", "2.5' × 10'"
    const match = clean.match(/(\d+(?:\.\d+)?)\s*(?:'|ft)?\s*(?:[x×*]|by)\s*(\d+(?:\.\d+)?)\s*(?:'|ft)?/);
    let wFt = 8;
    let lFt = 10;

    if (match) {
      const d1 = parseFloat(match[1]);
      const d2 = parseFloat(match[2]);
      wFt = Math.min(d1, d2);
      lFt = Math.max(d1, d2);
    }

    // If runner or narrow corridor dimension
    if (isRunner || (wFt <= 3.5 && lFt >= 6)) {
      const runnerWidth = Math.min(26, Math.max(16, (wFt / 12) * 80));
      const runnerHeight = Math.min(88, Math.max(48, (lFt / 16) * 95));
      return {
        widthPercent: runnerWidth,
        heightPercent: runnerHeight,
        isRound: false,
        isRunner: true,
      };
    }

    // Standard rectangular rug in a 16' (width) × 12' (depth) room footprint:
    // lFt is horizontal, wFt is vertical
    // 4' × 6' => width: (6 / 16) * 100 = 37.5%, height: (4 / 12) * 100 = 33.3%
    // 5' × 8' => width: (8 / 16) * 100 = 50.0%, height: (5 / 12) * 100 = 41.7%
    // 6' × 9' => width: (9 / 16) * 100 = 56.25%, height: (6 / 12) * 100 = 50.0%
    // 8' × 10' => width: (10 / 16) * 100 = 62.5%, height: (8 / 12) * 100 = 66.7%
    // 9' × 12' => width: (12 / 16) * 100 = 75.0%, height: (9 / 12) * 100 = 75.0%
    // 10' × 14' => width: (14 / 16) * 100 = 87.5%, height: (10 / 12) * 100 = 83.3%
    const widthPercent = Math.min(94, Math.max(28, (lFt / 16) * 100));
    const heightPercent = Math.min(90, Math.max(25, (wFt / 12) * 100));

    return {
      widthPercent,
      heightPercent,
      isRound: false,
      isRunner: false,
    };
  };

  const scale = calculateRugScale(currentDim);

  return (
    <div className="bg-atelier-cream/50 border border-atelier-parchment p-6 sm:p-10 my-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-atelier-parchment pb-5 gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-atelier-taupe font-medium mb-1">
              Architectural Scale & Proportion
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-light tracking-tight">
              Interactive Room Placement
            </h3>
          </div>
          <div className="text-xs text-atelier-charcoal font-light">
            Simulated scale for <span className="font-medium text-atelier-softblack">{productName}</span>
          </div>
        </div>

        {/* Room Switcher Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {ROOMS.map((room) => {
            const Icon = room.icon;
            const isActive = activeRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs tracking-wider uppercase transition-all duration-200 border ${
                  isActive
                    ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack shadow-sm font-medium'
                    : 'bg-atelier-ivory border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe'
                }`}
              >
                <Icon size={14} strokeWidth={1.5} />
                <span>{room.title}</span>
              </button>
            );
          })}
        </div>

        {/* Size Variant Selector Chips */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-atelier-taupe font-medium">
            Select Size to Preview:
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariant.id;
              const dimLabel = v.dimensionsFt || v.size.split('(')[0].trim();
              return (
                <button
                  key={v.id}
                  onClick={() => onSelectVariant(v)}
                  className={`px-3.5 py-1.5 text-xs font-mono border transition-all duration-200 ${
                    isSelected
                      ? 'bg-atelier-parchment border-atelier-darkbrown text-atelier-darkbrown font-semibold shadow-xs'
                      : 'bg-atelier-ivory border-atelier-parchment/80 text-atelier-charcoal/80 hover:border-atelier-taupe'
                  }`}
                >
                  {dimLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Architectural Canvas (Pure CSS/SVG Vector Rendering — 0 KB overhead) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Floorplan Plane */}
          <div className="lg:col-span-7 bg-atelier-ivory border border-atelier-parchment p-6 sm:p-8 relative aspect-[16/11] flex items-center justify-center overflow-hidden shadow-subtle select-none">
            {/* Grid Floor Lines */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #5C4D43 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Perimeter Wall Guidelines */}
            <div className="absolute inset-4 border border-dashed border-atelier-parchment pointer-events-none flex items-start justify-end p-2 text-[9px] font-mono text-atelier-taupe/60 uppercase">
              12&apos; × 16&apos; Room Footprint
            </div>

            {/* Scaled Rug Plane */}
            <div
              className={`transition-all duration-500 ease-out bg-atelier-sand/35 border-2 border-atelier-darkbrown/60 relative flex flex-col items-center justify-center shadow-sm z-10 ${
                scale.isRound ? 'rounded-full aspect-square' : 'rounded-xs'
              }`}
              style={{
                width: `${scale.widthPercent}%`,
                height: `${scale.heightPercent}%`,
              }}
            >
              <div className="text-center pointer-events-none p-1 z-20">
                <div className="font-mono text-[11px] sm:text-xs text-atelier-softblack font-semibold tracking-wider bg-white/80 px-2 py-0.5 rounded shadow-2xs border border-atelier-parchment/80 inline-block">
                  {currentDim}
                </div>
                <div className="text-[8px] tracking-widest text-atelier-taupe uppercase font-mono mt-0.5">
                  Prasri Rugs
                </div>
              </div>
            </div>

            {/* Vector Architectural Furniture Overlays (Positioned relative to room footprint so rug expands/contracts beneath) */}
            {activeRoom === 'living' && (
              <div className="absolute inset-4 pointer-events-none z-20 flex flex-col justify-between items-center py-2 sm:py-3">
                {/* 3-Seater Sofa */}
                <div className="w-[58%] h-6 sm:h-7 bg-atelier-charcoal/20 rounded-xs border border-atelier-charcoal/40 flex items-center justify-center shadow-2xs backdrop-blur-[1px]">
                  <span className="text-[8px] sm:text-[9px] font-mono text-atelier-charcoal/80 uppercase tracking-wider">3-Seater Sofa</span>
                </div>
                {/* Coffee Table */}
                <div className="w-16 sm:w-20 h-8 sm:h-9 bg-atelier-parchment/95 border border-atelier-charcoal/50 rounded flex items-center justify-center shadow-xs">
                  <span className="text-[7px] sm:text-[8px] font-mono text-atelier-charcoal uppercase font-medium">Coffee Table</span>
                </div>
                {/* 2 Accent Armchairs */}
                <div className="flex justify-between w-[70%] px-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-atelier-charcoal/15 border border-atelier-charcoal/35 rounded-xs flex items-center justify-center">
                    <span className="text-[6px] font-mono text-atelier-charcoal/60 uppercase">Chair</span>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-atelier-charcoal/15 border border-atelier-charcoal/35 rounded-xs flex items-center justify-center">
                    <span className="text-[6px] font-mono text-atelier-charcoal/60 uppercase">Chair</span>
                  </div>
                </div>
              </div>
            )}

            {activeRoom === 'bedroom' && (
              <div className="absolute inset-4 pointer-events-none z-20 flex flex-col items-center justify-start pt-2 sm:pt-3">
                {/* Nightstands + Bed Headboard */}
                <div className="flex items-center space-x-2 w-full justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-atelier-charcoal/20 border border-atelier-charcoal/40 rounded-xs flex items-center justify-center">
                    <span className="text-[6px] font-mono text-atelier-charcoal/60">Table</span>
                  </div>
                  <div className="w-[50%] sm:w-[48%] h-24 sm:h-32 bg-atelier-charcoal/15 border border-atelier-charcoal/40 rounded-xs flex flex-col items-center justify-center shadow-2xs backdrop-blur-[1px]">
                    <span className="text-[8px] sm:text-[9px] font-mono text-atelier-charcoal/80 uppercase tracking-wider">King Bed (76&quot; × 80&quot;)</span>
                    <div className="w-3/4 h-[1px] bg-atelier-charcoal/20 my-1" />
                    <span className="text-[7px] font-mono text-atelier-taupe">Pillows & Frame</span>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-atelier-charcoal/20 border border-atelier-charcoal/40 rounded-xs flex items-center justify-center">
                    <span className="text-[6px] font-mono text-atelier-charcoal/60">Table</span>
                  </div>
                </div>
              </div>
            )}

            {activeRoom === 'dining' && (
              <div className="absolute inset-4 pointer-events-none z-20 flex items-center justify-center">
                {/* 6-8 Person Dining Table with chairs */}
                <div className="w-[54%] sm:w-[50%] h-14 sm:h-16 bg-atelier-parchment/95 border border-atelier-charcoal/50 rounded flex items-center justify-center relative shadow-xs">
                  <span className="text-[8px] sm:text-[9px] font-mono text-atelier-charcoal uppercase tracking-wider font-medium">6–8 Person Table</span>
                  {/* Top Chairs */}
                  <div className="absolute -top-3.5 inset-x-3 flex justify-between">
                    <div className="w-5 h-2.5 bg-atelier-charcoal/25 border border-atelier-charcoal/40 rounded-2xs" />
                    <div className="w-5 h-2.5 bg-atelier-charcoal/25 border border-atelier-charcoal/40 rounded-2xs" />
                    <div className="w-5 h-2.5 bg-atelier-charcoal/25 border border-atelier-charcoal/40 rounded-2xs" />
                  </div>
                  {/* Bottom Chairs */}
                  <div className="absolute -bottom-3.5 inset-x-3 flex justify-between">
                    <div className="w-5 h-2.5 bg-atelier-charcoal/25 border border-atelier-charcoal/40 rounded-2xs" />
                    <div className="w-5 h-2.5 bg-atelier-charcoal/25 border border-atelier-charcoal/40 rounded-2xs" />
                    <div className="w-5 h-2.5 bg-atelier-charcoal/25 border border-atelier-charcoal/40 rounded-2xs" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Placement Guide Insights */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-atelier-ivory border border-atelier-parchment space-y-2">
              <div className="flex items-center space-x-2 text-xs text-atelier-darkbrown font-medium">
                <Info size={15} className="text-atelier-agedgold flex-shrink-0" />
                <span>Atelier Proportions Rule</span>
              </div>
              <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                {getPlacementGuidance(currentDim, activeRoom)}
              </p>
            </div>

            <div className="text-[11px] text-atelier-taupe font-light space-y-1">
              <div>
                • <strong className="font-medium text-atelier-softblack">Need an exact custom fit?</strong> We weave any millimeter dimension for your exact architectural layout.
              </div>
              <div>
                • Door clearance tip: Pile height of this rug is comfortable under standard 15mm interior doors.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
