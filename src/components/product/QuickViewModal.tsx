import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, Heart, Eye, Check } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useInventory } from '../../context/InventoryContext';
import { SizeSelector } from './SizeSelector';
import { StockBadge } from './StockBadge';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestCustomSize: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onRequestCustomSize,
}) => {
  if (!isOpen || !product) return null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { getInventory } = useInventory();

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setActiveImageIndex(0);
      setIsAdded(false);
    }
  }, [product]);

  const activeVariant: ProductVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      return {
        id: `var-${product?.slug || 'rug'}-1`,
        size: '8 x 10 ft (240 x 300 cm)',
        dimensionsFt: '8 x 10 ft',
        sku: `PR-${(product?.slug || 'RUG').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'RUG'}-0810`,
        priceUSD: 1850,
        inventory: 1,
        isReadyToShip: true,
        productionTimeWeeks: '4–6 weeks',
        weightKg: 15,
      };
    }
    if (selectedVariant && selectedVariant.sku) {
      const match = product.variants.find((v) => v.sku === selectedVariant.sku);
      if (match) return match;
    }
    return product.variants[0];
  }, [product, selectedVariant]);

  const isFavorited = isInWishlist(product.id);
  const currentStock = getInventory(activeVariant.sku) ?? activeVariant.inventory ?? 1;
  const isAvailable = currentStock > 0;

  const handleAddToCart = () => {
    const primaryImg =
      product.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80';

    addToCart(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        productImage: primaryImg,
        variantId: activeVariant.id,
        size: activeVariant.size,
        sku: activeVariant.sku,
        priceUSD: Number(activeVariant.priceUSD) || 1500,
        technique: product.technique,
        isReadyToShip: Boolean(activeVariant.isReadyToShip),
        estimatedDispatch: activeVariant.isReadyToShip
          ? 'Dispatches in 2–4 business days'
          : `Made to Order (${activeVariant.productionTimeWeeks || '4–6 weeks'})`,
      },
      1,
      true
    );

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  const safeImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            id: 'img-def',
            url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
            alt: product.name,
            viewType: 'full',
            label: 'Full Overview',
          },
        ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-atelier-softblack/75 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-atelier-ivory border border-atelier-parchment shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-atelier-charcoal hover:text-atelier-softblack p-1 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Gallery preview */}
          <div className="space-y-3">
            <div className="aspect-[4/5] bg-atelier-cream border border-atelier-parchment overflow-hidden">
              <img
                src={safeImages[activeImageIndex]?.url || safeImages[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbs */}
            <div className="flex space-x-2 overflow-x-auto">
              {safeImages.map((img, i) => (
                <button
                  key={img.id || i}
                  type="button"
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-16 h-18 border overflow-hidden flex-shrink-0 ${
                    activeImageIndex === i ? 'border-atelier-softblack ring-1 ring-atelier-softblack' : 'border-atelier-parchment opacity-70'
                  }`}
                >
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details & Fast Purchase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-atelier-taupe uppercase font-medium">
                {product.collection} · {product.technique}
              </span>
              <StockBadge
                isReadyToShip={activeVariant.isReadyToShip}
                inventory={currentStock}
              />
            </div>

            <div>
              <h2 className="font-serif text-2xl text-atelier-softblack font-medium">
                {product.name}
              </h2>
              <div className="font-sans text-xl sm:text-2xl text-atelier-softblack font-medium mt-1.5 tracking-normal">
                {formatPrice(activeVariant.priceUSD)}
              </div>
            </div>

            <p className="text-xs text-atelier-charcoal leading-relaxed font-light line-clamp-3">
              {product.description}
            </p>

            <div className="text-xs space-y-1 text-atelier-taupe border-y border-atelier-parchment py-3">
              <div>
                <strong className="text-atelier-charcoal font-medium">Material:</strong> {product.materialComposition}
              </div>
              <div>
                <strong className="text-atelier-charcoal font-medium">Origin:</strong> {product.origin}
              </div>
              <div>
                <strong className="text-atelier-charcoal font-medium">SKU:</strong> {activeVariant.sku}
              </div>
            </div>

            {/* Size Selector */}
            <SizeSelector
              variants={product.variants && product.variants.length > 0 ? product.variants : [activeVariant]}
              selectedVariant={activeVariant}
              onSelectVariant={setSelectedVariant}
              onRequestCustomSize={() => {
                onClose();
                onRequestCustomSize(product);
              }}
            />

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-atelier-softblack text-atelier-parchment py-3 px-4 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-all font-medium flex items-center justify-center space-x-2"
                >
                  {isAdded ? (
                    <>
                      <Check size={14} className="text-emerald-400 stroke-[2.5]" />
                      <span>Added to Bag ✓</span>
                    </>
                  ) : (
                    <span>{isAvailable ? 'Add to Bag' : 'Order Made to Order'}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="p-3 border border-atelier-parchment hover:border-atelier-taupe text-atelier-charcoal bg-atelier-cream"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={16}
                    className={isFavorited ? 'fill-red-700 text-red-700' : ''}
                  />
                </button>
              </div>

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="w-full text-center block py-2 text-xs text-atelier-charcoal hover:text-atelier-softblack underline tracking-wider"
              >
                View Full Product Details, Room Placement & Specifications →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
