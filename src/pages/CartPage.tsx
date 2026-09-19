import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

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

export const CartPage: React.FC = () => {
  const {
    items,
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

  const totalUSD = subtotalUSD + shippingUSD;
  const progressPercent = Math.min(100, Math.round((subtotalUSD / freeShippingThresholdUSD) * 100));

  const handleSaveForLater = (item: any) => {
    toggleWishlist(item.productId);
    removeFromCart(item.variantId);
  };

  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-6 flex items-baseline justify-between">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-light tracking-tight">
              Your Shopping Bag
            </h1>
            <p className="text-xs text-atelier-taupe mt-1 font-mono">
              {items.reduce((acc, i) => acc + i.quantity, 0)} {items.length === 1 ? 'piece' : 'pieces'} from The Weave Atelier
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs text-atelier-charcoal hover:text-black underline flex items-center"
          >
            <ArrowLeft size={12} className="mr-1" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-atelier-cream border border-atelier-parchment p-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack">
              Your shopping bag is currently empty
            </h2>
            <p className="text-xs text-atelier-charcoal max-w-md mx-auto font-light leading-relaxed">
              Explore our contemporary handmade collections or commission a custom size directly from our Bhadohi studio.
            </p>
            <div className="pt-2 flex justify-center space-x-4">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
              >
                Browse Catalog
              </Link>
              <Link
                to="/custom-rugs"
                className="px-8 py-3.5 bg-atelier-ivory border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:border-atelier-taupe transition-colors"
              >
                Custom Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Line items list (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free shipping banner */}
              <div className="p-4 bg-atelier-cream border border-atelier-parchment text-xs space-y-2">
                {amountNeededForFreeShippingUSD > 0 ? (
                  <div>
                    <div className="flex justify-between text-atelier-charcoal font-medium">
                      <span>Add {formatPrice(amountNeededForFreeShippingUSD)} more for complimentary worldwide express delivery</span>
                      <span className="font-mono text-atelier-taupe">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-atelier-parchment h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-atelier-agedgold h-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-atelier-darkbrown font-medium">
                    <Truck size={15} className="mr-2 text-atelier-agedgold" />
                    <span>Your order qualifies for Complimentary Worldwide Express Courier!</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="divide-y divide-atelier-parchment border-y border-atelier-parchment">
                {items.map((item) => (
                  <div key={item.variantId} className="py-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-start">
                    <Link
                      to={`/product/${item.productSlug}`}
                      className="w-24 h-32 bg-atelier-cream border border-atelier-parchment overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex justify-between">
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="font-serif text-lg text-atelier-softblack hover:text-atelier-brown font-normal"
                        >
                          {item.productName}
                        </Link>
                        <span className="font-mono text-sm font-medium text-atelier-softblack">
                          {formatPrice(item.priceUSD * item.quantity)}
                        </span>
                      </div>

                      <div className="text-xs text-atelier-taupe">
                        Dimensions: <span className="text-atelier-charcoal font-medium">{item.size}</span>
                      </div>
                      <div className="text-[11px] text-atelier-taupe font-mono">
                        SKU: {item.sku} · {item.technique}
                      </div>

                      {/* Ready to ship badge */}
                      <div className="pt-1">
                        <span
                          className={`inline-block text-[10px] px-2 py-0.5 font-medium ${
                            item.isReadyToShip
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-900'
                          }`}
                        >
                          {item.isReadyToShip ? 'Ready to Ship (2–4 days)' : 'Made to Order (4–6 weeks handcrafted)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center border border-atelier-parchment bg-atelier-cream">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1.5 hover:bg-atelier-parchment text-atelier-charcoal"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-3 text-xs font-mono text-atelier-softblack">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1.5 hover:bg-atelier-parchment text-atelier-charcoal"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="flex items-center space-x-4 text-xs">
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="text-atelier-taupe hover:text-atelier-softblack underline transition-colors"
                          >
                            Save for later
                          </button>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-atelier-taupe hover:text-red-700 flex items-center transition-colors"
                          >
                            <Trash2 size={13} className="mr-1" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Summary Box (4 cols) */}
            <div className="lg:col-span-4 bg-atelier-cream border border-atelier-parchment p-6 sm:p-8 space-y-6">
              <h2 className="font-serif text-xl text-atelier-softblack font-normal">
                Order Summary
              </h2>

              {/* Destination Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-atelier-taupe font-medium block">
                  Delivery Destination
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack py-2.5 px-3 focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2.5 text-xs text-atelier-charcoal border-b border-atelier-parchment pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-atelier-softblack">{formatPrice(subtotalUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>International Express Courier</span>
                  <span className="font-mono text-atelier-softblack">
                    {shippingUSD === 0 ? 'Complimentary' : formatPrice(shippingUSD)}
                  </span>
                </div>
                <div className="flex justify-between text-atelier-taupe text-[11px]">
                  <span>Duties & Destination Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline font-serif text-xl text-atelier-softblack font-medium">
                <span>Estimated Total</span>
                <span className="font-mono text-2xl text-atelier-darkbrown">{formatPrice(totalUSD)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-atelier-softblack text-atelier-parchment py-4 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors flex items-center justify-center font-medium shadow-sm group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 text-center text-[10px] text-atelier-taupe space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <ShieldCheck size={12} className="text-atelier-agedgold" />
                  <span>Door-to-door insured air freight from Bhadohi</span>
                </div>
                <div>14-Day Return Guarantee · Secure Checkout</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
