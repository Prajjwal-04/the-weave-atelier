import React, { useState } from 'react';
import { ProductImage } from '../../types';
import { ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const getCleanPerspectiveLabel = (label?: string, viewType?: string): string => {
  const perspectiveMap: Record<string, string> = {
    full: 'Full Overview',
    room: 'Living Room',
    'living-room': 'Living Room',
    bedroom: 'Bedroom',
    'reading-nook': 'Reading Nook',
    dining: 'Dining Room',
    entryway: 'Entryway',
    texture: 'Texture & Pile',
    detail: 'Close-Up Detail',
    backing: 'Loom Backing',
    corner: 'Corner Bevel',
    'artisan-loom': 'Artisan Loom',
  };

  if (label) {
    const trimmed = label.trim();
    const isRawFileName =
      trimmed.startsWith('[Local File:') ||
      trimmed.toLowerCase().includes('gemini generated') ||
      trimmed.toLowerCase().includes('screenshot') ||
      trimmed.toLowerCase().includes('img_') ||
      trimmed.toLowerCase().includes('dsc_') ||
      trimmed.toLowerCase().includes('local image') ||
      /\.(png|jpe?g|webp|heic|avif)$/i.test(trimmed) ||
      trimmed.length > 30;

    if (!isRawFileName && trimmed.length > 0) {
      return trimmed;
    }
  }

  if (viewType && perspectiveMap[viewType]) {
    return perspectiveMap[viewType];
  }

  if (viewType) {
    return viewType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return 'Perspective';
};

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const safeImages =
    images && images.length > 0
      ? images
      : [
          {
            id: 'img-placeholder',
            url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
            alt: productName,
            viewType: 'full',
            label: 'Full Overview',
          },
        ];

  const activeImage = safeImages[selectedIndex] || safeImages[0];
  const activeImageUrl =
    activeImage.url ||
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnail List */}
      <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto space-x-3 lg:space-x-0 lg:space-y-3 flex-shrink-0 py-1 scrollbar-none">
        {safeImages.map((img, index) => {
          const badgeText = getCleanPerspectiveLabel(img.label, img.viewType);
          const thumbUrl = img.url || activeImageUrl;
          return (
            <button
              key={img.id || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-atelier-cream border transition-all duration-200 overflow-hidden text-left group ${
                selectedIndex === index
                  ? 'border-atelier-softblack ring-1 ring-atelier-softblack'
                  : 'border-atelier-parchment hover:border-atelier-taupe opacity-80 hover:opacity-100'
              }`}
              aria-label={`View ${badgeText}`}
            >
              <img
                src={thumbUrl}
                alt={img.alt || `${productName} ${badgeText}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-atelier-softblack/75 text-[9px] text-white px-1 py-0.5 text-center truncate tracking-wider uppercase font-medium">
                {badgeText}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Large Visual Stage with Zoom Capability */}
      <div className="flex-1">
        <div
          className="relative w-full aspect-[4/5] bg-atelier-cream border border-atelier-parchment overflow-hidden cursor-crosshair group"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Main Image */}
          <img
            src={activeImageUrl}
            alt={activeImage.alt || `${productName} presentation`}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isZoomed ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* High-Resolution Zoom Stage */}
          {isZoomed && (
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                backgroundImage: `url(${activeImageUrl})`,
                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                backgroundSize: '240%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {/* Zoom Instruction Pill */}
          <div className="absolute bottom-3 right-3 bg-atelier-ivory/90 backdrop-blur-md px-3 py-1.5 border border-atelier-parchment text-[10px] text-atelier-charcoal tracking-wider uppercase flex items-center shadow-sm pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={12} className="mr-1 text-atelier-taupe" />
            <span>Hover to Magnify Weave Detail</span>
          </div>

          {/* Perspective Label */}
          <div className="absolute top-3 left-3 bg-atelier-ivory/90 backdrop-blur-md px-2.5 py-1 border border-atelier-parchment text-[10px] text-atelier-softblack tracking-widest uppercase font-medium shadow-sm">
            {getCleanPerspectiveLabel(activeImage.label, activeImage.viewType)}
          </div>
        </div>
      </div>
    </div>
  );
};
