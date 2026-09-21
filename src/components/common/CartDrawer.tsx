import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Canada',
  'Australia',
  'India',
  'Italy',
  'Netherlands',
  'Switzerland',
  'Japan',
  'Singapore',
  'United Arab Emirates',
];

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotalUSD,
    destinationCountry,
    setDestinationCountry,
    shippingUSD,
    freeShippingThresholdUSD,
    amountNeededForFreeShippingUSD,
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const totalUSD = subtotalUSD + shippingUSD;
  const progressPercent = Math.min(100, Math.round((subtotalUSD / freeShippingThresholdUSD) * 100));

  const handleSaveForLater = (item: any) => {
    toggleWishlist(item.productId);
    removeFromCart(item.variantId);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-atelier-softblack/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-atelier-ivory border-l border-atelier-parchment shadow-drawer flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-atelier-parchment flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <h3 className="font-serif text-xl tracking-wider text-atelier-softblack font-medium">
                Shopping Bag
              </h3>
              <span className="text-xs text-atelier-taupe font-mono">
                ({items.reduce((acc, i) => acc + i.quantity, 0)} {items.length === 1 ? 'piece' : 'pieces'})
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-atelier-charcoal hover:text-atelier-softblack transition-colors"
              aria-label="Close cart"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Dispatch Notice */}
          <div className="px-6 py-2.5 bg-atelier-cream/80 border-b border-atelier-parchment text-[11px] text-atelier-charcoal flex items-center justify-between">
            <span className="flex items-center">
              <Truck size={13} className="mr-1.5 text-atelier-agedgold" />
              <span>Insured International Express Air Dispatch</span>
            </span>
            <span className="text-atelier-taupe font-mono text-[10px]">Door-to-door tracking</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full border border-atelier-parchment flex items-center justify-center text-atelier-taupe">
                  <Truck size={20} strokeWidth={1.2} />
                </div>
                <p className="font-serif text-lg text-atelier-softblack">Your bag is empty</p>
                <p className="text-xs text-atelier-taupe max-w-xs mx-auto">
                  Explore our curated ready-to-ship rugs and made-to-order bespoke designs.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="inline-block px-6 py-2.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex space-x-4 pb-6 border-b border-atelier-parchment/70 last:border-b-0"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.productSlug}`}
                    onClick={closeCart}
                    className="w-20 h-24 bg-atelier-cream flex-shrink-0 overflow-hidden border border-atelier-parchment"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <Link
                        to={`/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="font-serif text-sm font-medium text-atelier-softblack hover:text-atelier-brown line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-atelier-taupe hover:text-red-700 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="text-[11px] text-atelier-taupe">
                      Size: {item.size}
                    </div>

                    <div className="text-[10px] text-atelier-taupe font-mono">
                      SKU: {item.sku}
                    </div>

                    {/* Ready to ship / dispatch */}
                    <div className="text-[10px] pt-0.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 ${
                          item.isReadyToShip
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-900'
                        }`}
                      >
                        {item.isReadyToShip ? 'Ready to Ship (2–4 days)' : 'Made to Order (4–6 weeks)'}
                      </span>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-atelier-parchment bg-atelier-cream">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-atelier-parchment text-atelier-charcoal transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-mono text-atelier-softblack">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 hover:bg-atelier-parchment text-atelier-charcoal transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-medium text-atelier-softblack font-mono">
                          {formatPrice(item.priceUSD * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-atelier-taupe font-mono">
                            {formatPrice(item.priceUSD)} each
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save for later button */}
                    <div className="pt-1">
                      <button
                        onClick={() => handleSaveForLater(item)}
                        className="text-[11px] text-atelier-taupe hover:text-atelier-softblack underline transition-colors"
                      >
                        Save for later
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-atelier-cream border-t border-atelier-parchment space-y-4">
              {/* Shipping Destination Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-atelier-taupe font-medium block">
                  Delivery Destination
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack py-2 px-3 focus:outline-none focus:border-atelier-taupe"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtotal & Estimated Shipping */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between text-atelier-charcoal">
                  <span>Subtotal</span>
                  <span className="font-mono text-atelier-softblack">{formatPrice(subtotalUSD)}</span>
                </div>
                <div className="flex justify-between text-atelier-charcoal">
                  <span>Estimated International Express Delivery</span>
                  <span className="font-mono text-atelier-softblack">
                    {shippingUSD === 0 ? 'Complimentary' : formatPrice(shippingUSD)}
                  </span>
                </div>
                <div className="flex justify-between text-atelier-taupe text-[11px]">
                  <span>Duties & Local Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-atelier-parchment pt-2 flex justify-between font-medium text-sm text-atelier-softblack">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base">{formatPrice(totalUSD)}</span>
                </div>
              </div>

              {/* Trust signal */}
              <div className="flex items-center justify-center text-[10px] text-atelier-taupe space-x-3 pt-1">
                <span className="flex items-center">
                  <ShieldCheck size={12} className="mr-1 text-atelier-agedgold" />
                  Insured Transit
                </span>
                <span>·</span>
                <span>Direct from Bhadohi</span>
                <span>·</span>
                <span>14-Day Returns</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-atelier-softblack text-atelier-parchment py-3.5 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors flex items-center justify-center font-medium"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} className="ml-2" />
                </button>

                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-xs text-atelier-charcoal hover:text-atelier-softblack py-1.5 transition-colors underline"
                >
                  View Full Bag & Estimate Duties
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
