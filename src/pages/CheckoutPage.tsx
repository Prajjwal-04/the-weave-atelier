import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Zap,
  Globe,
  Building2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { Order, OrderStatus, CartItem } from '../types';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { emailService } from '../services/emailService';

export const CheckoutPage: React.FC = () => {
  const { items, subtotalUSD, shippingUSD, destinationCountry, setDestinationCountry, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { addOrder, user, updateSavedAddress } = useAuth();
  const { decrementInventory } = useInventory();
  const navigate = useNavigate();

  // If cart is empty, check localStorage as well to prevent navigation race conditions
  const localCartItems: CartItem[] = items.length > 0 ? items : (() => {
    try {
      const saved = localStorage.getItem('twa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  if (items.length === 0 && localCartItems.length === 0) {
    return (
      <div className="pt-32 pb-24 text-center bg-atelier-ivory min-h-screen">
        <h2 className="font-serif text-3xl text-atelier-softblack">Your bag is empty</h2>
        <p className="text-xs text-atelier-charcoal mt-2 mb-6 font-light">
          Add a handcrafted rug before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const effectiveItems: CartItem[] = items.length > 0 ? items : localCartItems;
  const effectiveSubtotalUSD = items.length > 0
    ? subtotalUSD
    : effectiveItems.reduce((sum, i) => sum + (i.priceUSD * i.quantity), 0);

  // Multi-step: 'shipping' -> 'payment' -> processing -> done
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [address, setAddress] = useState(user?.savedAddress?.address || '');
  const [apartment, setApartment] = useState(user?.savedAddress?.apartment || '');
  const [city, setCity] = useState(user?.savedAddress?.city || '');
  const [state, setState] = useState(user?.savedAddress?.state || '');
  const [postalCode, setPostalCode] = useState(user?.savedAddress?.postalCode || '');
  const [country, setCountry] = useState(destinationCountry || 'United States');

  // Razorpay Payment State
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKey, setTempKey] = useState(paymentService.getRazorpayKeyId());

  const totalUSD = effectiveSubtotalUSD + shippingUSD;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const orderNum = `TWA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const hasMadeToOrder = effectiveItems.some((i) => !i.isReadyToShip);

      // 1. Process payment via Razorpay All-In-One Checkout
      const paymentRes = await paymentService.processPayment({
        amountUSD: totalUSD,
        currency,
        customer: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
        },
        orderNumber: orderNum,
        notes: {
          shipping_city: city,
          shipping_state: state,
          shipping_country: country,
        },
      });

      if (!paymentRes.success) {
        setErrorMessage(paymentRes.message || 'Payment processing was cancelled or failed.');
        setIsProcessing(false);
        return;
      }

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: orderNum,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        customer: {
          firstName,
          lastName,
          email,
          phone,
        },
        shippingAddress: {
          address,
          apartment,
          city,
          state,
          postalCode,
          country,
        },
        shippingMethod: {
          name: 'Atelier Express Air via DHL Express (Insured)',
          estimatedDays: hasMadeToOrder ? '4–6 weeks handcrafted' : '5–7 business days',
          costUSD: shippingUSD,
        },
        items: [...effectiveItems],
        currency,
        subtotalUSD: effectiveSubtotalUSD,
        shippingUSD,
        taxUSD: 0,
        totalUSD,
        status: hasMadeToOrder ? 'IN PRODUCTION' : 'PROCESSING',
        carrier: 'DHL Express International',
        trackingNumber: `DHL-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        estimatedDeliveryDate: hasMadeToOrder ? 'Late October 2026' : 'September 22, 2026',
        isMadeToOrder: hasMadeToOrder,
        paymentProvider: paymentRes.provider === 'razorpay' ? 'Razorpay Live' : 'Razorpay Sandbox',
        paymentId: paymentRes.transactionId,
        timeline: hasMadeToOrder
          ? [
              {
                title: 'Order Placed & Payment Verified',
                date: 'Today · Verified via Secure Gateway',
                description: 'Order confirmed and registered at our Bhadohi studio.',
                completed: true,
                current: true,
              },
              {
                title: 'Loom Setup & Yarn Dyeing',
                date: 'Estimated Week 1–2',
                description: 'Pot dyeing blended wool lots and warping the loom in Bhadohi.',
                completed: false,
              },
              {
                title: 'Hand-Weaving / Tufting',
                date: 'Estimated Week 3–4',
                description: 'Master artisans weaving knot-by-knot or hand-tufting high-low relief.',
                completed: false,
              },
              {
                title: 'River Washing & Rooftop Sun Drying',
                date: 'Estimated Week 5',
                description: 'Thorough paddle wash in groundwater and natural open-air sun curing.',
                completed: false,
              },
              {
                title: 'Final Shearing & Quality Inspection',
                date: 'Estimated Week 6',
                description: 'Hand-shearing edges, pile beveling, and protective export wrapping.',
                completed: false,
              },
              {
                title: 'Dispatched via DHL Express',
                date: 'Estimated Week 6',
                description: 'Handed to express air courier with international tracking.',
                completed: false,
              },
            ]
          : [
              {
                title: 'Order Placed & Payment Confirmed',
                date: 'Today · Verified via Gateway',
                description: 'Order confirmed at our Bhadohi studio.',
                completed: true,
                current: true,
              },
              {
                title: 'Quality Conditioning & Packaging',
                date: 'Tomorrow',
                description: 'Final pile conditioning and moisture-resistant polyethylene wrapping.',
                completed: false,
              },
              {
                title: 'Dispatched via DHL Express',
                date: 'Within 2–3 business days',
                description: 'Air dispatch from New Delhi International logistics hub.',
                completed: false,
              },
              {
                title: 'International Transit',
                date: '5–7 business days',
                description: 'Direct courier flight to your destination country.',
                completed: false,
              },
              {
                title: 'Delivered',
                date: 'Estimated within 7 days',
                description: 'Signature delivery to your door.',
                completed: false,
              },
            ],
      };

      // 2. Persist order to Supabase and Local Storage (also updates inventory in orderService)
      await orderService.createOrder(newOrder);

      // 3. Decrement local InventoryContext state for live reactivity
      for (const item of effectiveItems) {
        if (item.isReadyToShip) {
          await decrementInventory(item.sku, item.quantity);
        }
      }

      // 4. Save to Auth context state & update saved address for future orders
      addOrder(newOrder);
      if (user) {
        await updateSavedAddress(
          {
            address,
            apartment: apartment || undefined,
            city,
            state,
            postalCode,
            country,
          },
          phone
        );
      }

      // 5. Trigger email dispatch: Customer confirmation AND direct alert to prasrirugs@gmail.com
      try {
        await Promise.allSettled([
          // Customer confirmation
          emailService.sendTransactionalEmail({
            to: email,
            subject: `Order Confirmed: ${newOrder.orderNumber} · The Weave Atelier`,
            html: emailService.generateOrderConfirmationHtml(newOrder),
            type: 'order_confirmation',
          }),
          // Direct notification to prasrirugs@gmail.com
          emailService.sendOrderNotificationToAdmin(newOrder),
        ]);
      } catch (mailErr) {
        console.warn('Email dispatch notice:', mailErr);
      }

      clearCart();
      setIsProcessing(false);
      navigate(`/order-confirmation?orderNumber=${orderNum}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage('An unexpected error occurred while placing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Checkout Header */}
        <div className="flex items-center justify-between border-b border-atelier-parchment pb-6">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl tracking-[0.24em] text-atelier-softblack font-normal">
              THE WEAVE ATELIER
            </span>
            <div className="text-[8px] tracking-[0.35em] text-atelier-taupe uppercase">
              BHADOHI · SECURE CHECKOUT
            </div>
          </Link>

          <div className="flex items-center space-x-2 text-xs text-atelier-taupe">
            <Lock size={14} className="text-emerald-700" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Transaction</span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center space-x-4 text-xs font-mono">
          <span className={`font-medium ${step === 'shipping' ? 'text-atelier-softblack border-b border-atelier-softblack pb-0.5' : 'text-atelier-taupe'}`}>
            01 Shipping Information
          </span>
          <ChevronRight size={14} className="text-atelier-taupe" />
          <span className={`font-medium ${step === 'payment' ? 'text-atelier-softblack border-b border-atelier-softblack pb-0.5' : 'text-atelier-taupe'}`}>
            02 Payment & Verification
          </span>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-atelier-cream border border-atelier-parchment p-8 sm:p-10 shadow-subtle">
            {step === 'shipping' ? (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                    Delivery & Contact Details
                  </h2>
                  <p className="text-xs text-atelier-charcoal font-light mt-1">
                    Please provide the destination address for insured air courier delivery from Bhadohi.
                  </p>
                </div>

                {/* Email & Phone */}
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-wider font-medium text-atelier-softblack">
                    Contact Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-atelier-taupe block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-atelier-taupe block mb-1">Phone Number (for courier) *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs uppercase tracking-wider font-medium text-atelier-softblack">
                    Shipping Address
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-atelier-taupe block mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-atelier-taupe block mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="House number and street name"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Apartment, Suite, Unit (optional)</label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] text-atelier-taupe block mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-atelier-taupe block mb-1">State / Province *</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-atelier-taupe block mb-1">Postal / ZIP Code *</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Country / Territory *</label>
                    <select
                      required
                      value={country}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setCountry(newCountry);
                        setDestinationCountry(newCountry);
                      }}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    >
                      {[
                        'United States',
                        'India',
                        'United Kingdom',
                        'Germany',
                        'France',
                        'Canada',
                        'Australia',
                        'Italy',
                        'Netherlands',
                        'Switzerland',
                        'Japan',
                        'Singapore',
                        'United Arab Emirates',
                        'New Zealand',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Courier Selection Preview */}
                <div className="pt-2 p-4 bg-atelier-ivory border border-atelier-parchment space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-atelier-softblack flex items-center">
                      <Truck size={14} className="mr-1.5 text-atelier-gold" />
                      Atelier Express Air via DHL Express / FedEx
                    </span>
                    <span className="font-mono text-atelier-darkbrown">
                      {shippingUSD === 0 ? 'Complimentary' : formatPrice(shippingUSD)}
                    </span>
                  </div>
                  <div className="text-[11px] text-atelier-taupe font-light">
                    Includes full transit cargo insurance, door-to-door tracking, and signature on delivery.
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Link
                    to="/cart"
                    className="text-xs text-atelier-charcoal hover:text-black underline flex items-center"
                  >
                    <ArrowLeft size={12} className="mr-1" />
                    <span>Return to Bag</span>
                  </Link>

                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight size={14} className="ml-2" />
                  </button>
                </div>
              </form>
            ) : (
              /* Payment Step - Razorpay All-in-One Integration */
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="flex items-center justify-between border-b border-atelier-parchment pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Official Payment Suite
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal mt-1">
                      Razorpay Secure Checkout
                    </h2>
                    <p className="text-xs text-atelier-charcoal font-light mt-0.5">
                      All payment methods are handled seamlessly within Razorpay's bank-grade payment gateway.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs text-atelier-taupe hover:text-black underline"
                  >
                    Edit Shipping
                  </button>
                </div>

                {/* Razorpay Channel Visual Showcase */}
                <div className="bg-atelier-ivory border border-atelier-parchment p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-atelier-softblack">Supported Payment Methods</span>
                    <span className="text-[10px] font-mono text-atelier-taupe">Powered by Razorpay</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-atelier-cream border border-atelier-parchment p-3 text-center space-y-1">
                      <div className="font-medium text-atelier-softblack flex items-center justify-center">
                        <Zap size={14} className="mr-1 text-emerald-600" />
                        <span>Instant UPI</span>
                      </div>
                      <div className="text-[10px] text-atelier-taupe">Google Pay, PhonePe, Paytm, QR</div>
                    </div>

                    <div className="bg-atelier-cream border border-atelier-parchment p-3 text-center space-y-1">
                      <div className="font-medium text-atelier-softblack flex items-center justify-center">
                        <CreditCard size={14} className="mr-1 text-atelier-agedgold" />
                        <span>Cards</span>
                      </div>
                      <div className="text-[10px] text-atelier-taupe">Visa, Mastercard, RuPay, Amex</div>
                    </div>

                    <div className="bg-atelier-cream border border-atelier-parchment p-3 text-center space-y-1">
                      <div className="font-medium text-atelier-softblack flex items-center justify-center">
                        <Building2 size={14} className="mr-1 text-blue-600" />
                        <span>NetBanking</span>
                      </div>
                      <div className="text-[10px] text-atelier-taupe">50+ Banks & Institutional Wire</div>
                    </div>

                    <div className="bg-atelier-cream border border-atelier-parchment p-3 text-center space-y-1">
                      <div className="font-medium text-atelier-softblack flex items-center justify-center">
                        <Globe size={14} className="mr-1 text-amber-700" />
                        <span>International</span>
                      </div>
                      <div className="text-[10px] text-atelier-taupe">Multi-Currency Global Cards</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-atelier-parchment/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-atelier-taupe gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center"><ShieldCheck size={13} className="mr-1 text-emerald-700" /> 256-Bit SSL</span>
                      <span className="flex items-center"><Lock size={13} className="mr-1 text-emerald-700" /> RBI Authorized</span>
                      <span className="flex items-center"><Check size={13} className="mr-1 text-emerald-700" /> PCI-DSS Level 1</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowKeyConfig(!showKeyConfig)}
                      className="text-[10px] font-mono underline hover:text-atelier-softblack transition-colors"
                    >
                      {paymentService.isConfigured()
                        ? `Key: ${paymentService.getRazorpayKeyId().substring(0, 9)}...`
                        : 'Configure Razorpay Key'}
                    </button>
                  </div>
                </div>

                {/* Key Configurator Dropdown */}
                {showKeyConfig && (
                  <div className="p-4 bg-atelier-cream border border-atelier-gold/40 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-atelier-softblack">Razorpay Key Configuration</strong>
                      <button
                        type="button"
                        onClick={() => setShowKeyConfig(false)}
                        className="text-atelier-taupe hover:text-black"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[11px] text-atelier-charcoal font-light">
                      Enter your Razorpay Key ID (e.g. <code>rzp_test_...</code> or <code>rzp_live_...</code>) to connect your live dashboard.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder="rzp_test_..."
                        className="flex-1 px-3 py-2 text-xs font-mono bg-atelier-ivory border border-atelier-parchment focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          paymentService.setRazorpayKeyId(tempKey);
                          setShowKeyConfig(false);
                        }}
                        className="px-4 py-2 bg-atelier-softblack text-atelier-parchment text-xs uppercase tracking-wider font-medium"
                      >
                        Save Key
                      </button>
                    </div>
                  </div>
                )}

                {/* Amount Summary */}
                <div className="p-5 bg-atelier-ivory border border-atelier-parchment space-y-2 text-xs">
                  <div className="flex justify-between items-center text-atelier-softblack font-medium">
                    <span>Amount to Authorize:</span>
                    <div className="text-right">
                      <div className="font-serif text-xl">{formatPrice(totalUSD)}</div>
                      <div className="font-mono text-[11px] text-atelier-taupe font-normal">
                        Approx. ₹{Math.round(totalUSD * 84).toLocaleString('en-IN')} INR
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-atelier-taupe font-light leading-relaxed">
                    Clicking the button below opens the secure <strong>Razorpay Checkout</strong> overlay where you can select UPI, Cards, NetBanking, or Wallets. Once verified, your order is registered and an immediate confirmation is emailed to you.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                    <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Process CTA Button */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs text-atelier-charcoal hover:text-black underline flex items-center"
                  >
                    <ArrowLeft size={12} className="mr-1" />
                    <span>Back to Shipping</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-8 py-4 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center disabled:opacity-50 group"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Launching Razorpay Checkout...</span>
                    ) : (
                      <>
                        <ShieldCheck size={16} className="mr-2 text-atelier-gold" />
                        <span>Pay with Razorpay · {formatPrice(totalUSD)}</span>
                        <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Order Review (5 cols) */}
          <div className="lg:col-span-5 bg-atelier-cream border border-atelier-parchment p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-xl text-atelier-softblack font-normal border-b border-atelier-parchment pb-4">
              Bag Review ({effectiveItems.length})
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 divide-y divide-atelier-parchment/60">
              {effectiveItems.map((item) => (
                <div key={item.variantId} className="pt-3 first:pt-0 flex space-x-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-20 object-cover bg-atelier-ivory border border-atelier-parchment flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-serif font-medium text-atelier-softblack truncate">
                        {item.productName}
                      </span>
                      <span className="font-mono text-atelier-darkbrown font-medium">
                        {formatPrice(item.priceUSD * item.quantity)}
                      </span>
                    </div>
                    <div className="text-[11px] text-atelier-taupe">
                      {item.size} · Qty: {item.quantity}
                    </div>
                    <div className="text-[10px] text-atelier-taupe font-mono">
                      {item.isReadyToShip ? 'Ready to Ship' : 'Made to Order'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-atelier-parchment pt-4 text-xs text-atelier-charcoal">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-atelier-softblack">{formatPrice(effectiveSubtotalUSD)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured International Courier</span>
                <span className="font-mono text-atelier-softblack">
                  {shippingUSD === 0 ? 'Complimentary' : formatPrice(shippingUSD)}
                </span>
              </div>
              <div className="flex justify-between text-atelier-taupe text-[11px]">
                <span>Customs / Duties (Bhadohi, India Export)</span>
                <span>Included / Under De Minimis</span>
              </div>
              <div className="flex justify-between items-baseline font-serif text-xl text-atelier-softblack font-medium border-t border-atelier-parchment pt-3">
                <span>Total Due</span>
                <span className="font-mono text-2xl text-atelier-darkbrown font-bold">{formatPrice(totalUSD)}</span>
              </div>
            </div>

            <div className="p-4 bg-atelier-ivory border border-atelier-parchment space-y-2 text-[11px] text-atelier-taupe font-light">
              <div className="flex items-center text-atelier-softblack font-medium">
                <ShieldCheck size={13} className="mr-1.5 text-atelier-gold" />
                The Weave Atelier Authenticity Guarantee
              </div>
              <p>
                Each piece is certified handmade in Bhadohi. Your tracking code and high-resolution conditioning photographs are shared upon final inspection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
