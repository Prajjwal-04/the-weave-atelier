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
  QrCode,
  Smartphone,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { Order, OrderStatus, CartItem } from '../types';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { emailService } from '../services/emailService';

const COMMON_UPI_HANDLES = ['@okhdfcbank', '@oksbi', '@okaxis', '@paytm', '@ybl', '@ibl'];

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank' },
  { id: 'ICICI', name: 'ICICI Bank' },
  { id: 'SBI', name: 'State Bank of India' },
  { id: 'AXIS', name: 'Axis Bank' },
  { id: 'KOTAK', name: 'Kotak Mahindra' },
  { id: 'OTHER', name: '50+ Other Banks' },
];

export const CheckoutPage: React.FC = () => {
  const { items, subtotalUSD, shippingUSD, destinationCountry, setDestinationCountry, clearCart } = useCart();
  const { formatPrice, currency, rates } = useCurrency();
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
        <div className="max-w-md mx-auto space-y-4 px-4">
          <h2 className="font-serif text-3xl text-atelier-softblack">Your Bag is Empty</h2>
          <p className="text-xs text-atelier-charcoal font-light">
            You haven't selected any handcrafted rugs for checkout yet.
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
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

  // Payment Method Selection State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'international'>('upi');
  const [upiMode, setUpiMode] = useState<'qr_app' | 'vpa'>('qr_app');
  const [upiVpa, setUpiVpa] = useState('');
  const [upiError, setUpiError] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [errorMessage, setErrorMessage] = useState('');

  const totalUSD = effectiveSubtotalUSD + shippingUSD;
  const inrRate = rates['INR']?.rate || 84.0;
  const amountINR = Math.round(totalUSD * inrRate);
  const isINR = currency === 'INR';

  const handleApplyUpiHandle = (handle: string) => {
    setUpiError('');
    if (!upiVpa) {
      setUpiVpa(handle);
    } else if (upiVpa.includes('@')) {
      setUpiVpa(upiVpa.split('@')[0] + handle);
    } else {
      setUpiVpa(upiVpa + handle);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setUpiError('');

    // If UPI ID mode is chosen, validate UPI ID format
    if (paymentMethod === 'upi' && upiMode === 'vpa') {
      const cleanVpa = upiVpa.trim();
      if (!cleanVpa) {
        setUpiError('Please enter your UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm)');
        return;
      }
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(cleanVpa)) {
        setUpiError('Invalid UPI ID format. Expected username@bank (e.g. mobile@paytm or name@okhdfcbank)');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderNum = `TWA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const hasMadeToOrder = effectiveItems.some((i) => !i.isReadyToShip);

      // 1. Process payment via Razorpay All-In-One Checkout
      const paymentRes = await paymentService.processPayment({
        amountUSD: totalUSD,
        amountINR,
        currency,
        customer: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
        },
        orderNumber: orderNum,
        preferredMethod: paymentMethod === 'upi' ? 'upi' : paymentMethod === 'card' ? 'card' : paymentMethod === 'netbanking' ? 'netbanking' : undefined,
        upiVpa: paymentMethod === 'upi' && upiMode === 'vpa' ? upiVpa.trim() : undefined,
        notes: {
          shipping_city: city,
          shipping_state: state,
          shipping_country: country,
          payment_channel: paymentMethod,
          bank_selected: paymentMethod === 'netbanking' ? selectedBank : '',
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
          name: 'Atelier Insured Express Air Delivery',
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
        carrier: 'Insured Express Air',
        trackingNumber: '',
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
                title: 'Artisanal Washing & Rooftop Sun Curing',
                date: 'Estimated Week 5',
                description: 'Thorough gentle wash in purified soft water and natural open-air sun curing.',
                completed: false,
              },
              {
                title: 'Final Shearing & Quality Inspection',
                date: 'Estimated Week 6',
                description: 'Hand-shearing edges, pile beveling, and protective export wrapping.',
                completed: false,
              },
              {
                title: 'Dispatched via Express Air Courier',
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
                title: 'Dispatched via Express Air Courier',
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
            subject: `Order Confirmed: ${newOrder.orderNumber} · Prasri Rugs`,
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
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Checkout Header */}
        <div className="flex items-center justify-between border-b border-atelier-parchment pb-6">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl tracking-[0.24em] text-atelier-softblack font-normal">
              PRASRI RUGS
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
                      Atelier Insured Express Air Delivery
                    </span>
                    {shippingUSD > 0 && (
                      <span className="font-mono text-atelier-darkbrown">
                        {formatPrice(shippingUSD)}
                      </span>
                    )}
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
              /* Payment Step - Authentic Production Multi-Channel Gateway */
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="flex items-center justify-between border-b border-atelier-parchment pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center">
                        <ShieldCheck size={11} className="mr-1 text-emerald-600" />
                        Verified Payment Gateway
                      </span>
                      <span className="text-[10px] text-atelier-taupe font-mono">· 256-Bit TLS Secured</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal mt-1">
                      Payment & Order Authorization
                    </h2>
                    <p className="text-xs text-atelier-charcoal font-light mt-0.5">
                      Select your preferred payment method. Direct from our Bhadohi atelier with 100% insured transit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs text-atelier-taupe hover:text-black underline flex items-center"
                  >
                    <ArrowLeft size={12} className="mr-1" />
                    <span>Edit Shipping</span>
                  </button>
                </div>

                {/* Shipping Destination Recap */}
                <div className="bg-atelier-ivory border border-atelier-parchment p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-atelier-taupe">Shipping Destination</div>
                    <div className="font-medium text-atelier-softblack">
                      {firstName} {lastName} · <span className="font-normal text-atelier-charcoal">{address}{apartment ? `, ${apartment}` : ''}, {city}, {state} {postalCode}, {country}</span>
                    </div>
                    <div className="text-[11px] text-atelier-taupe">
                      Courier: <span className="font-medium text-atelier-softblack">Atelier Insured Express Air</span> · Phone: {phone || 'Not specified'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-[11px] text-atelier-darkbrown hover:text-black underline flex-shrink-0 self-start sm:self-center"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-atelier-softblack uppercase tracking-wider block">
                    Choose Payment Method
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. UPI */}
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('upi'); setErrorMessage(''); }}
                      className={`p-3.5 text-left border transition-all flex items-start space-x-3 relative ${
                        paymentMethod === 'upi'
                          ? 'bg-atelier-ivory border-atelier-softblack shadow-sm ring-1 ring-atelier-softblack'
                          : 'bg-atelier-cream border-atelier-parchment hover:border-atelier-taupe'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'upi' ? 'border-atelier-softblack' : 'border-atelier-taupe'
                        }`}>
                          {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-atelier-softblack" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-atelier-softblack flex items-center">
                            <Zap size={14} className="mr-1.5 text-emerald-600 flex-shrink-0" />
                            Instant UPI
                          </span>
                          <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-atelier-taupe font-light">
                          Google Pay, PhonePe, Paytm, BHIM, QR
                        </p>
                      </div>
                    </button>

                    {/* 2. Cards */}
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('card'); setErrorMessage(''); }}
                      className={`p-3.5 text-left border transition-all flex items-start space-x-3 ${
                        paymentMethod === 'card'
                          ? 'bg-atelier-ivory border-atelier-softblack shadow-sm ring-1 ring-atelier-softblack'
                          : 'bg-atelier-cream border-atelier-parchment hover:border-atelier-taupe'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'card' ? 'border-atelier-softblack' : 'border-atelier-taupe'
                        }`}>
                          {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-atelier-softblack" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-atelier-softblack flex items-center">
                            <CreditCard size={14} className="mr-1.5 text-atelier-agedgold flex-shrink-0" />
                            Credit & Debit Cards
                          </span>
                          <span className="text-[10px] font-mono text-atelier-taupe">
                            3D Secure
                          </span>
                        </div>
                        <p className="text-[11px] text-atelier-taupe font-light">
                          Visa, Mastercard, RuPay, Amex
                        </p>
                      </div>
                    </button>

                    {/* 3. NetBanking */}
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('netbanking'); setErrorMessage(''); }}
                      className={`p-3.5 text-left border transition-all flex items-start space-x-3 ${
                        paymentMethod === 'netbanking'
                          ? 'bg-atelier-ivory border-atelier-softblack shadow-sm ring-1 ring-atelier-softblack'
                          : 'bg-atelier-cream border-atelier-parchment hover:border-atelier-taupe'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'netbanking' ? 'border-atelier-softblack' : 'border-atelier-taupe'
                        }`}>
                          {paymentMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-atelier-softblack" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-atelier-softblack flex items-center">
                            <Building2 size={14} className="mr-1.5 text-blue-700 flex-shrink-0" />
                            NetBanking
                          </span>
                          <span className="text-[10px] font-mono text-atelier-taupe">
                            50+ Banks
                          </span>
                        </div>
                        <p className="text-[11px] text-atelier-taupe font-light">
                          HDFC, ICICI, SBI, Axis, Kotak
                        </p>
                      </div>
                    </button>

                    {/* 4. International */}
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('international'); setErrorMessage(''); }}
                      className={`p-3.5 text-left border transition-all flex items-start space-x-3 ${
                        paymentMethod === 'international'
                          ? 'bg-atelier-ivory border-atelier-softblack shadow-sm ring-1 ring-atelier-softblack'
                          : 'bg-atelier-cream border-atelier-parchment hover:border-atelier-taupe'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'international' ? 'border-atelier-softblack' : 'border-atelier-taupe'
                        }`}>
                          {paymentMethod === 'international' && <div className="w-2 h-2 rounded-full bg-atelier-softblack" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-atelier-softblack flex items-center">
                            <Globe size={14} className="mr-1.5 text-amber-700 flex-shrink-0" />
                            Global & Wire
                          </span>
                          <span className="text-[10px] font-mono text-atelier-taupe">
                            Export Invoice
                          </span>
                        </div>
                        <p className="text-[11px] text-atelier-taupe font-light">
                          Multi-Currency International Cards
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Method Specific Details Pane */}
                <div className="bg-atelier-ivory border border-atelier-parchment p-5 sm:p-6 space-y-4">
                  {/* UPI DETAILS */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-atelier-parchment">
                        <div>
                          <span className="text-xs font-semibold text-atelier-softblack flex items-center">
                            <Zap size={15} className="mr-1.5 text-emerald-600" />
                            Unified Payments Interface (UPI)
                          </span>
                          <p className="text-[11px] text-atelier-taupe font-light mt-0.5">
                            Real-time zero-fee settlement via National Payments Corporation of India (NPCI)
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 bg-white border border-atelier-parchment text-emerald-800">
                            UPI
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white border border-atelier-parchment text-slate-700">
                            GPay
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white border border-atelier-parchment text-purple-700">
                            PhonePe
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white border border-atelier-parchment text-sky-700">
                            Paytm
                          </span>
                        </div>
                      </div>

                      {/* Sub-modes for UPI */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setUpiMode('qr_app'); setUpiError(''); }}
                          className={`p-3 border text-left flex items-center space-x-2 transition-colors ${
                            upiMode === 'qr_app'
                              ? 'bg-atelier-cream border-atelier-softblack font-medium'
                              : 'bg-white border-atelier-parchment text-atelier-taupe hover:border-atelier-charcoal'
                          }`}
                        >
                          <QrCode size={16} className={upiMode === 'qr_app' ? 'text-atelier-softblack' : 'text-atelier-taupe'} />
                          <div>
                            <div className="text-xs text-atelier-softblack">Scan QR / Any UPI App</div>
                            <div className="text-[10px] text-atelier-taupe font-normal">GPay, PhonePe, Paytm QR</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setUpiMode('vpa'); setUpiError(''); }}
                          className={`p-3 border text-left flex items-center space-x-2 transition-colors ${
                            upiMode === 'vpa'
                              ? 'bg-atelier-cream border-atelier-softblack font-medium'
                              : 'bg-white border-atelier-parchment text-atelier-taupe hover:border-atelier-charcoal'
                          }`}
                        >
                          <Smartphone size={16} className={upiMode === 'vpa' ? 'text-atelier-softblack' : 'text-atelier-taupe'} />
                          <div>
                            <div className="text-xs text-atelier-softblack">Enter UPI ID / VPA</div>
                            <div className="text-[10px] text-atelier-taupe font-normal">Direct collect request</div>
                          </div>
                        </button>
                      </div>

                      {upiMode === 'qr_app' ? (
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                          <div className="flex items-center font-medium">
                            <CheckCircle2 size={14} className="mr-1.5 text-emerald-700" />
                            Instant QR Code & App Redirection
                          </div>
                          <p className="text-[11px] text-emerald-900/80 font-light leading-relaxed">
                            Clicking <strong>Authorize with UPI</strong> launches Razorpay's verified UPI window with a dynamic QR code you can scan with any phone, or direct one-tap links to open Google Pay, PhonePe, or Paytm on mobile.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 pt-1">
                          <label className="text-[11px] font-medium text-atelier-softblack block">
                            Your Virtual Payment Address (UPI ID)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={upiVpa}
                              onChange={(e) => {
                                setUpiVpa(e.target.value);
                                setUpiError('');
                              }}
                              placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                              className={`w-full px-3.5 py-2.5 bg-white border text-xs font-mono text-atelier-softblack focus:outline-none ${
                                upiError ? 'border-rose-400 focus:border-rose-600' : 'border-atelier-parchment focus:border-black'
                              }`}
                            />
                          </div>

                          {upiError && (
                            <div className="text-[11px] text-rose-700 flex items-center">
                              <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                              <span>{upiError}</span>
                            </div>
                          )}

                          {/* Quick Append Chips */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-atelier-taupe font-mono uppercase">Quick Add Bank Handle:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {COMMON_UPI_HANDLES.map((handle) => (
                                <button
                                  key={handle}
                                  type="button"
                                  onClick={() => handleApplyUpiHandle(handle)}
                                  className="px-2 py-1 bg-white border border-atelier-parchment hover:border-atelier-softblack text-[11px] font-mono text-atelier-charcoal hover:text-black transition-colors"
                                >
                                  {handle}
                                </button>
                              ))}
                            </div>
                          </div>

                          <p className="text-[11px] text-atelier-taupe font-light">
                            A collect request will be sent to your UPI app. Simply open your app and enter your UPI PIN to approve.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CARDS DETAILS */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-atelier-parchment">
                        <div>
                          <span className="text-xs font-semibold text-atelier-softblack flex items-center">
                            <CreditCard size={15} className="mr-1.5 text-atelier-agedgold" />
                            Credit & Debit Cards
                          </span>
                          <p className="text-[11px] text-atelier-taupe font-light mt-0.5">
                            Bank-grade 256-bit encryption with dynamic OTP verification
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] font-mono">
                          <span className="px-1.5 py-0.5 bg-blue-900 text-white rounded font-bold">VISA</span>
                          <span className="px-1.5 py-0.5 bg-red-800 text-white rounded font-bold">MC</span>
                          <span className="px-1.5 py-0.5 bg-emerald-800 text-white rounded font-bold">RUPAY</span>
                          <span className="px-1.5 py-0.5 bg-sky-800 text-white rounded font-bold">AMEX</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-atelier-cream border border-atelier-parchment text-xs space-y-1.5">
                        <div className="flex items-center font-medium text-atelier-softblack">
                          <ShieldCheck size={14} className="mr-1.5 text-emerald-700" />
                          RBI 3D Secure 2.0 Dynamic OTP
                        </div>
                        <p className="text-[11px] text-atelier-charcoal font-light leading-relaxed">
                          Your card details are securely authorized via Razorpay's PCI-DSS Level 1 compliant gateway. You will be redirected to your bank's secure page to complete authentication via OTP. No card data is stored on atelier servers.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* NETBANKING DETAILS */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-atelier-parchment">
                        <div>
                          <span className="text-xs font-semibold text-atelier-softblack flex items-center">
                            <Building2 size={15} className="mr-1.5 text-blue-700" />
                            Indian NetBanking
                          </span>
                          <p className="text-[11px] text-atelier-taupe font-light mt-0.5">
                            Direct debit access across all major retail and commercial banks
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-atelier-taupe">50+ Banks</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {POPULAR_BANKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b.name)}
                            className={`p-2.5 border text-left transition-colors flex items-center justify-between ${
                              selectedBank === b.name
                                ? 'bg-atelier-cream border-atelier-softblack font-medium text-atelier-softblack'
                                : 'bg-white border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe'
                            }`}
                          >
                            <span>{b.name}</span>
                            {selectedBank === b.name && <Check size={12} className="text-emerald-700" />}
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-atelier-taupe font-light">
                        Selected: <strong className="text-atelier-softblack">{selectedBank}</strong>. Upon submission, you will be redirected to your bank's portal to authenticate and approve the payment.
                      </p>
                    </div>
                  )}

                  {/* INTERNATIONAL DETAILS */}
                  {paymentMethod === 'international' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-atelier-parchment">
                        <div>
                          <span className="text-xs font-semibold text-atelier-softblack flex items-center">
                            <Globe size={15} className="mr-1.5 text-amber-700" />
                            International Patrons & Export Wire
                          </span>
                          <p className="text-[11px] text-atelier-taupe font-light mt-0.5">
                            Seamless overseas card clearance in USD, EUR, GBP, CAD, or AUD
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-atelier-taupe">Worldwide</span>
                      </div>

                      <div className="p-3.5 bg-atelier-cream border border-atelier-parchment text-xs space-y-1.5">
                        <div className="flex items-center font-medium text-atelier-softblack">
                          <CheckCircle2 size={14} className="mr-1.5 text-emerald-700" />
                          Official Commercial Export Invoice
                        </div>
                        <p className="text-[11px] text-atelier-charcoal font-light leading-relaxed">
                          International payments include export packing declarations, Certificate of Origin from Bhadohi, and HS Code 5701/5702 custom clearance documentation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount Authorization Summary */}
                <div className="p-5 bg-atelier-ivory border border-atelier-parchment space-y-3 text-xs">
                  <div className="flex justify-between items-center text-atelier-softblack font-medium">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-atelier-taupe block">Amount to Authorize</span>
                      <div className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal mt-0.5">
                        {formatPrice(totalUSD)}
                      </div>
                    </div>
                    {!isINR && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-atelier-taupe block">Indian Banking Equivalent</span>
                        <div className="font-mono text-sm font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 border border-emerald-200 inline-block mt-0.5">
                          ₹{amountINR.toLocaleString('en-IN')} INR
                        </div>
                      </div>
                    )}
                  </div>

                  {!isINR && (
                    <div className="pt-2 border-t border-atelier-parchment/70 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-atelier-taupe gap-1">
                      <span>Conversion rate: 1 USD ≈ ₹{inrRate} INR</span>
                      <span className="flex items-center text-emerald-800 font-medium">
                        <Check size={12} className="mr-1 text-emerald-600" /> 0% Payment Surcharge
                      </span>
                    </div>
                  )}
                </div>

                {/* Atelier Concierge Direct Support Strip */}
                <div className="p-3 bg-atelier-ivory border border-dashed border-atelier-parchment flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-atelier-charcoal">
                  <div className="flex items-center space-x-2">
                    <HelpCircle size={14} className="text-atelier-gold flex-shrink-0" />
                    <span>Need assistance with payment limits or corporate GST invoices?</span>
                  </div>
                  <a
                    href="https://wa.me/919839418038"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 hover:text-emerald-950 font-medium font-mono text-[11px] underline flex items-center self-start sm:self-auto"
                  >
                    WhatsApp Concierge (+91 98394 18038)
                  </a>
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
                      <span className="animate-pulse">Authorizing Payment Session...</span>
                    ) : (
                      <>
                        <ShieldCheck size={16} className="mr-2 text-atelier-gold" />
                        <span>
                          {paymentMethod === 'upi'
                            ? isINR
                              ? `Authorize with UPI · ${formatPrice(totalUSD)}`
                              : `Authorize with UPI · ${formatPrice(totalUSD)} (₹${amountINR.toLocaleString('en-IN')})`
                            : paymentMethod === 'card'
                            ? `Authorize with Card · ${formatPrice(totalUSD)}`
                            : paymentMethod === 'netbanking'
                            ? `Authorize NetBanking · ${formatPrice(totalUSD)}`
                            : `Authorize Payment · ${formatPrice(totalUSD)}`}
                        </span>
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
              {shippingUSD > 0 && (
                <div className="flex justify-between">
                  <span>Shipping & Delivery</span>
                  <span className="font-mono text-atelier-softblack">
                    {formatPrice(shippingUSD)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-atelier-taupe text-[11px]">
                <span>Customs / Duties (Bhadohi, India Export)</span>
                <span>Included / Under De Minimis</span>
              </div>
              <div className="flex justify-between items-baseline font-serif text-xl text-atelier-softblack font-medium border-t border-atelier-parchment pt-3">
                <span>Total Due</span>
                <span className="font-mono text-2xl text-atelier-darkbrown font-bold">{formatPrice(totalUSD)}</span>
              </div>
              {!isINR && (
                <div className="flex justify-between items-center text-[11px] text-atelier-taupe pt-0.5">
                  <span>Equivalent (INR):</span>
                  <span className="font-mono font-medium text-emerald-800">
                    ₹{amountINR.toLocaleString('en-IN')} INR
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-atelier-ivory border border-atelier-parchment space-y-2 text-[11px] text-atelier-taupe font-light">
              <div className="flex items-center text-atelier-softblack font-medium">
                <ShieldCheck size={14} className="mr-1.5 text-emerald-700" />
                100% Insured Transit & Escrow Protection
              </div>
              <p>
                Each rug is certified handmade at our Bhadohi atelier. Your payment is held with escrow protection until final hand-shearing inspection and international air dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
