import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
  Info,
  Ruler,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInventory } from '../context/InventoryContext';
import { ImageGallery } from '../components/product/ImageGallery';
import { SizeSelector } from '../components/product/SizeSelector';
import { StockBadge } from '../components/product/StockBadge';
import { CustomSizeModal } from '../components/product/CustomSizeModal';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, getInventory, notifyMeBackInStock } = useInventory();

  const product = products.find((p) => p.slug === slug);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [isAddedToBag, setIsAddedToBag] = useState(false);

  // Accordion tabs
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');

  const { addToCart, closeCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  // Reset selected variant when slug or products change
  useEffect(() => {
    window.scrollTo(0, 0);
    const p = products.find((item) => item.slug === slug);
    if (p && p.variants && p.variants.length > 0) {
      setSelectedVariant(p.variants[0]);
    }
    setQuantity(1);
    setNotifySubmitted(false);
  }, [slug, products]);

  // Derive active variant safely so it never desynchronizes or causes undefined errors
  const activeVariant: ProductVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      return {
        id: `var-${product?.slug || 'rug'}-1`,
        size: '8 x 10 ft (240 x 300 cm)',
        dimensionsFt: '8 x 10 ft',
        sku: `TWA-${(product?.slug || 'RUG').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'RUG'}-0810`,
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

  if (!product) {
    return (
      <div className="pt-36 pb-28 text-center bg-atelier-ivory min-h-screen px-4">
        <div className="max-w-md mx-auto space-y-6 bg-atelier-cream border border-atelier-parchment p-10 shadow-subtle">
          <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
            Atelier Catalog Notice
          </div>
          <h1 className="font-serif text-3xl text-atelier-softblack font-light">
            Rug Piece Not Found
          </h1>
          <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
            The rug masterpiece you are looking for may have been archived, renamed, or is currently on private exhibition in Bhadohi.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium"
            >
              Explore Catalog
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-atelier-ivory border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:border-black transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const currentStock = getInventory(activeVariant.sku) ?? activeVariant.inventory ?? 1;
  const isAvailable = currentStock > 0;
  const isLastPiece = currentStock === 1;

  const handleAddToCart = (openDrawer = true) => {
    if (!product || !activeVariant) return;

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
          ? 'Dispatches in 2–4 business days from Bhadohi'
          : `Made to Order (${activeVariant.productionTimeWeeks || '4–6 weeks'})`,
      },
      quantity,
      openDrawer
    );

    setIsAddedToBag(true);
    setTimeout(() => setIsAddedToBag(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    closeCart();
    navigate('/checkout');
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail.trim()) {
      notifyMeBackInStock(activeVariant.sku, notifyEmail);
      setNotifySubmitted(true);
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Related products from same collection or technique
  const relatedProducts = (products || []).filter((p) => product && p.id !== product.id).slice(0, 3);

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-atelier-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-[11px] text-atelier-taupe tracking-wider uppercase mb-8 flex items-center space-x-2">
          <Link to="/" className="hover:text-atelier-softblack transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-atelier-softblack transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/collections/${product.collectionSlug}`} className="hover:text-atelier-softblack transition-colors">
            {product.collection}
          </Link>
          <span>/</span>
          <span className="text-atelier-softblack truncate font-medium">{product.name}</span>
        </div>

        {/* Main PDP Grid: Left Gallery | Right Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-20 border-b border-atelier-parchment">
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7">
            <ImageGallery
              images={
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
                    ]
              }
              productName={product.name}
            />
          </div>

          {/* Right Column: Product Information & Purchase (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Collection & Technique header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] tracking-[0.25em] text-atelier-taupe uppercase font-medium">
                {product.collection} · {product.technique}
              </span>
              <StockBadge
                isReadyToShip={activeVariant.isReadyToShip}
                inventory={currentStock}
              />
            </div>

            {/* Title & Pricing */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-2xl sm:text-3xl text-atelier-darkbrown font-medium">
                  {formatPrice(activeVariant.priceUSD)}
                </span>
                <span className="text-xs text-atelier-taupe font-mono">
                  SKU: {activeVariant.sku}
                </span>
              </div>
            </div>

            {/* Short editorial description */}
            <p className="text-xs sm:text-sm text-atelier-charcoal leading-relaxed font-light">
              {product.description}
            </p>

            {/* Availability and Dispatch Time Box */}
            <div className="p-4 bg-atelier-cream border border-atelier-parchment text-xs space-y-2">
              {activeVariant.isReadyToShip && currentStock > 0 ? (
                <div className="flex items-start space-x-2.5 text-atelier-softblack">
                  <Truck size={16} className="text-atelier-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Ready to Ship: </span>
                    <span className="text-atelier-charcoal">
                      In stock at our Bhadohi studio. Dispatches via DHL Express in 2–4 business days.
                    </span>
                    {isLastPiece && (
                      <div className="text-amber-800 font-medium text-[11px] mt-0.5">
                        *Last piece available in this size.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-2.5 text-atelier-softblack">
                  <Clock size={16} className="text-atelier-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Made to Order: </span>
                    <span className="text-atelier-charcoal">
                      Woven specifically for your order. Estimated handcrafted completion in{' '}
                      {activeVariant.productionTimeWeeks || '4–6 weeks'}.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Size Variant Picker */}
            <div className="pt-2">
              <SizeSelector
                variants={product.variants && product.variants.length > 0 ? product.variants : [activeVariant]}
                selectedVariant={activeVariant}
                onSelectVariant={setSelectedVariant}
                onRequestCustomSize={() => setCustomModalOpen(true)}
              />
            </div>

            {/* Out of Stock / Back in stock notification */}
            {currentStock === 0 && activeVariant.isReadyToShip && (
              <div className="p-4 bg-atelier-cream border border-atelier-parchment space-y-3">
                <div className="text-xs font-medium text-atelier-softblack">
                  This size is currently sold out.
                </div>
                {notifySubmitted ? (
                  <div className="text-xs text-emerald-800 flex items-center">
                    <Check size={14} className="mr-1" />
                    <span>You will be notified when this piece is back on loom.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="space-y-2">
                    <label className="text-[10px] text-atelier-taupe uppercase tracking-wider block">
                      Notify me when available
                    </label>
                    <div className="flex">
                      <input
                        type="email"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 bg-atelier-ivory border border-atelier-parchment text-xs px-3 py-2 text-atelier-softblack focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-atelier-softblack text-atelier-parchment text-xs uppercase tracking-wider hover:bg-atelier-darkbrown transition-colors"
                      >
                        Alert Me
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Quantity Stepper, Add to Bag & Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                {/* Quantity */}
                <div className="flex items-center border border-atelier-parchment bg-atelier-cream">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-3 text-xs text-atelier-charcoal hover:bg-atelier-parchment transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-mono text-atelier-softblack font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeVariant.isReadyToShip && currentStock > 0) {
                        setQuantity((q) => Math.min(currentStock, q + 1));
                      } else {
                        setQuantity((q) => q + 1);
                      }
                    }}
                    disabled={activeVariant.isReadyToShip && currentStock > 0 && quantity >= currentStock}
                    className="px-3 py-3 text-xs text-atelier-charcoal hover:bg-atelier-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 bg-atelier-softblack text-atelier-parchment py-3.5 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-all font-medium shadow-sm flex items-center justify-center space-x-2"
                >
                  {isAddedToBag ? (
                    <>
                      <Check size={14} className="text-emerald-400 stroke-[2.5]" />
                      <span>Added to Bag ✓</span>
                    </>
                  ) : (
                    <span>{isAvailable ? 'Add to Bag' : 'Order Made to Order'}</span>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="p-3.5 border border-atelier-parchment hover:border-atelier-taupe text-atelier-charcoal bg-atelier-cream transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={16}
                    className={isFavorited ? 'fill-red-700 text-red-700' : ''}
                  />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full bg-atelier-parchment border border-atelier-sand text-atelier-darkbrown py-3 px-6 text-xs tracking-widest uppercase hover:bg-atelier-sand/60 hover:text-atelier-softblack transition-all font-medium flex items-center justify-center space-x-2"
              >
                <span>Instant Buy Now</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Guarantee Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-atelier-taupe border-t border-atelier-parchment">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck size={14} className="text-atelier-agedgold" />
                <span>Certified Bhadohi Handmade</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Truck size={14} className="text-atelier-agedgold" />
                <span>Complimentary Over $1,500</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <RotateCcw size={14} className="text-atelier-agedgold" />
                <span>14-Day In-Home Return</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Sparkles size={14} className="text-atelier-agedgold" />
                <span>Custom Sizing Available</span>
              </div>
            </div>

            {/* Collapsible Accordions: Specs, Craft, Care, Shipping */}
            <div className="border-t border-atelier-parchment divide-y divide-atelier-parchment pt-4 text-xs">
              {/* Accordion 1: Specifications */}
              <div>
                <button
                  onClick={() => toggleAccordion('specs')}
                  className="w-full py-3 flex items-center justify-between text-left font-serif text-base text-atelier-softblack font-medium"
                >
                  <span>Dimensions & Specifications</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'specs' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'specs' && (
                  <div className="pb-4 space-y-2 text-atelier-charcoal font-light leading-relaxed">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="font-medium text-atelier-softblack">Dimensions:</strong> {activeVariant.size}</div>
                      <div><strong className="font-medium text-atelier-softblack">Pile Height:</strong> {product.pileHeight}</div>
                      <div><strong className="font-medium text-atelier-softblack">Construction:</strong> {product.technique}</div>
                      <div><strong className="font-medium text-atelier-softblack">Material:</strong> {product.materialComposition}</div>
                      <div><strong className="font-medium text-atelier-softblack">Weight:</strong> ~{activeVariant.weightKg} kg</div>
                      <div><strong className="font-medium text-atelier-softblack">Origin:</strong> {product.origin}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Craftsmanship & Bhadohi Origin */}
              <div>
                <button
                  onClick={() => toggleAccordion('craft')}
                  className="w-full py-3 flex items-center justify-between text-left font-serif text-base text-atelier-softblack font-medium"
                >
                  <span>Craftsmanship & Origin (Bhadohi)</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'craft' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'craft' && (
                  <div className="pb-4 space-y-2 text-atelier-charcoal font-light leading-relaxed">
                    <p>{product.craftNotes}</p>
                    <p className="text-[11px] text-atelier-taupe pt-1">
                      Bhadohi has held a distinguished lineage in carpet making for centuries. Each piece is crafted by artisans working on traditional looms without factory automation.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Material & Care */}
              <div>
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full py-3 flex items-center justify-between text-left font-serif text-base text-atelier-softblack font-medium"
                >
                  <span>Care & Maintenance</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'care' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'care' && (
                  <div className="pb-4 space-y-2 text-atelier-charcoal font-light leading-relaxed">
                    <p>{product.careSummary}</p>
                    <div className="pt-2">
                      <Link to="/rug-care" className="underline text-atelier-darkbrown hover:text-black">
                        View our complete living wool care handbook →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: International Delivery & Duties */}
              <div>
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-3 flex items-center justify-between text-left font-serif text-base text-atelier-softblack font-medium"
                >
                  <span>International Shipping & Returns</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === 'shipping' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 space-y-2 text-atelier-charcoal font-light leading-relaxed">
                    <p>
                      Shipped via express courier (DHL Express / FedEx) with full door-to-door insurance. Transit time to USA and Europe is 5–7 business days.
                    </p>
                    <p>
                      Returns are accepted within 14 calendar days of delivery.
                    </p>
                    <div className="pt-2">
                      <Link to="/shipping-returns" className="underline text-atelier-darkbrown hover:text-black">
                        Learn more about customs, packaging and returns →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Space: Related Rugs */}
        <div className="pt-16">
          <div className="flex items-baseline justify-between mb-8">
            <h3 className="font-serif text-2xl text-atelier-softblack font-normal">
              Complementary Works from the Atelier
            </h3>
            <Link to="/shop" className="text-xs text-atelier-taupe hover:text-black underline uppercase tracking-wider">
              View Catalog
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Custom Size Modal */}
      <CustomSizeModal
        product={product}
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
      />
    </div>
  );
};
