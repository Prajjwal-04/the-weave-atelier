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

  // Extract clean dimension key like "8' × 10'"
  const currentDim = selectedVariant.dimensionsFt || selectedVariant.size.split('(')[0].trim();

  // Placement guideline based on room & size
  const getPlacementGuidance = (dim: string, room: RoomType): string => {
    if (room === 'living') {
      if (dim.includes("5' × 8'")) {
        return "Ideal for compact apartments. Place coffee table centered; front legs of seating can either rest off or just graze the rug's border.";
      }
      if (dim.includes("6' × 9'") || dim.includes("8' × 10'")) {
        return "The modern classic layout. Front legs of sofa and armchairs sit on the rug, anchoring the conversation space seamlessly.";
      }
      if (dim.includes("9' × 12'") || dim.includes("10' × 14'")) {
        return "The grand architectural layout. All sofa and chair legs sit completely within the rug boundary, creating an expansive room-within-a-room.";
      }
      return "Ensure at least 14 to 18 inches of exposed flooring between the rug perimeter and the room perimeter walls.";
    }

    if (room === 'bedroom') {
      if (dim.includes("5' × 8'")) {
        return "Place horizontally across the bottom third of the bed to provide a soft landing step in smaller bedroom suites.";
      }
      if (dim.includes("8' × 10'") || dim.includes("6' × 9'")) {
        return "Slide under the lower two-thirds of the bed perpendicular to the frame, extending at least 24 inches on both sides.";
      }
      return "Extends beneath both the bed and bedside nightstands with generous perimeter margins for a luxurious boutique hotel ambiance.";
    }

    // Dining
    if (dim.includes("5' × 8'") || dim.includes("6' × 9'")) {
      return "Best suited for compact 4-seater breakfast nooks. Chairs should stay on the surface when pulled out.";
    }
    return "Accommodates a full 6 to 8-person dining table. Allows chairs to remain fully on the rug even when guests slide back from the table.";
  };

  // Proportional size mapping for SVG/CSS canvas
  const getSizeScaleClass = (dim: string) => {
    if (dim.includes("5' × 8'")) return { w: 'w-[44%]', h: 'h-[42%]' };
    if (dim.includes("6' × 9'")) return { w: 'w-[54%]', h: 'h-[52%]' };
    if (dim.includes("8' × 10'")) return { w: 'w-[68%]', h: 'h-[66%]' };
    if (dim.includes("9' × 12'")) return { w: 'w-[80%]', h: 'h-[78%]' };
    if (dim.includes("10' × 14'")) return { w: 'w-[92%]', h: 'h-[88%]' };
    if (dim.toLowerCase().includes('runner')) return { w: 'w-[26%]', h: 'h-[85%]' };
    return { w: 'w-[68%]', h: 'h-[66%]' };
  };

  const scale = getSizeScaleClass(currentDim);

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
              className={`transition-all duration-500 bg-atelier-sand/35 border-2 border-atelier-darkbrown/60 relative flex flex-col items-center justify-center shadow-sm ${scale.w} ${scale.h}`}
            >
              <div className="text-center pointer-events-none p-1">
                <div className="font-mono text-xs text-atelier-softblack font-semibold tracking-wider">
                  {currentDim}
                </div>
                <div className="text-[8px] tracking-widest text-atelier-taupe uppercase font-mono mt-0.5">
                  The Weave Atelier
                </div>
              </div>

              {/* Vector Architectural Furniture Overlays */}
              {activeRoom === 'living' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2">
                  {/* Sofa */}
                  <div className="w-[65%] h-5 bg-atelier-charcoal/20 mx-auto rounded-xs border border-atelier-charcoal/40 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-atelier-charcoal/70 uppercase">3-Seater Sofa</span>
                  </div>
                  {/* Coffee Table */}
                  <div className="w-14 h-7 bg-atelier-parchment/90 border border-atelier-charcoal/50 mx-auto rounded flex items-center justify-center shadow-xs">
                    <span className="text-[7px] font-mono text-atelier-charcoal uppercase">Table</span>
                  </div>
                  {/* 2 Accent Armchairs */}
                  <div className="flex justify-between px-3">
                    <div className="w-6 h-6 bg-atelier-charcoal/15 border border-atelier-charcoal/30 rounded-xs" />
                    <div className="w-6 h-6 bg-atelier-charcoal/15 border border-atelier-charcoal/30 rounded-xs" />
                  </div>
                </div>
              )}

              {activeRoom === 'bedroom' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-2">
                  {/* Nightstands + Bed Headboard */}
                  <div className="flex items-center space-x-1.5 w-full justify-center">
                    <div className="w-4 h-4 bg-atelier-charcoal/20 border border-atelier-charcoal/40 rounded-xs" />
                    <div className="w-[50%] h-14 bg-atelier-charcoal/15 border border-atelier-charcoal/40 rounded-xs flex items-center justify-center">
                      <span className="text-[8px] font-mono text-atelier-charcoal/80 uppercase">King Bed</span>
                    </div>
                    <div className="w-4 h-4 bg-atelier-charcoal/20 border border-atelier-charcoal/40 rounded-xs" />
                  </div>
                </div>
              )}

              {activeRoom === 'dining' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* 6-8 Person Dining Table with chairs */}
                  <div className="w-[55%] h-12 bg-atelier-parchment/90 border border-atelier-charcoal/50 rounded flex items-center justify-center relative shadow-xs">
                    <span className="text-[8px] font-mono text-atelier-charcoal uppercase">Dining Table</span>
                    {/* Top Chairs */}
                    <div className="absolute -top-3 inset-x-2 flex justify-between">
                      <div className="w-4 h-2 bg-atelier-charcoal/20 border border-atelier-charcoal/40" />
                      <div className="w-4 h-2 bg-atelier-charcoal/20 border border-atelier-charcoal/40" />
                      <div className="w-4 h-2 bg-atelier-charcoal/20 border border-atelier-charcoal/40" />
                    </div>
                    {/* Bottom Chairs */}
                    <div className="absolute -bottom-3 inset-x-2 flex justify-between">
                      <div className="w-4 h-2 bg-atelier-charcoal/20 border border-atelier-charcoal/40" />
                      <div className="w-4 h-2 bg-atelier-charcoal/20 border border-atelier-charcoal/40" />
                      <div className="w-4 h-2 bg-atelier-charcoal/20 border border-atelier-charcoal/40" />
                    </div>
                  </div>
                </div>
              )}
            </div>
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
