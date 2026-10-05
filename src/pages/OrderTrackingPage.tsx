import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, CheckCircle2, Clock, Truck, ShieldCheck, MapPin, Package, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderService } from '../services/orderService';
import { quoteService } from '../services/quoteService';
import { Order, CustomQuoteRequest } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [inputOrderNumber, setInputOrderNumber] = useState(initialOrderNumber);
  const [inputEmail, setInputEmail] = useState('');
  const [activeOrderNumber, setActiveOrderNumber] = useState(initialOrderNumber);
  const [searched, setSearched] = useState(Boolean(initialOrderNumber));
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentQuote, setCurrentQuote] = useState<CustomQuoteRequest | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const { getOrder } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (initialOrderNumber) {
      setInputOrderNumber(initialOrderNumber);
      setActiveOrderNumber(initialOrderNumber);
      setSearched(true);
    }
  }, [initialOrderNumber]);

  useEffect(() => {
    if (!activeOrderNumber.trim()) {
      setCurrentOrder(null);
      setCurrentQuote(null);
      return;
    }

    const localOrder = getOrder(activeOrderNumber);
    if (localOrder) {
      setCurrentOrder(localOrder);
      setCurrentQuote(null);
    } else {
      setLoadingOrder(true);
    }

    let isMounted = true;
    orderService
      .getOrderByNumber(activeOrderNumber)
      .then(async (found) => {
        if (!isMounted) return;
        if (found) {
          setCurrentOrder(found);
          setCurrentQuote(null);
        } else {
          // Check if this reference corresponds to a bespoke custom quote
          const quote = await quoteService.getQuoteByReference(activeOrderNumber);
          if (isMounted) {
            if (quote) {
              setCurrentQuote(quote);
              setCurrentOrder(null);
            } else {
              setCurrentOrder(null);
              setCurrentQuote(null);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Live order lookup error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingOrder(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeOrderNumber, getOrder]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOrderNumber.trim()) {
      setActiveOrderNumber(inputOrderNumber.trim());
      setSearched(true);
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium mb-2 flex items-center space-x-2">
            <span className="text-atelier-agedgold">REAL-TIME LOGISTICS</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">ATELIER TRACKING</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
            Order & <span className="italic font-normal text-atelier-agedgold">Production Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light mt-2 leading-relaxed">
            Monitor every phase of your piece from yarn dyeing and hand-weaving in Bhadohi to international express air courier delivery.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-atelier-cream border border-atelier-parchment p-6 sm:p-8">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="text-xs font-medium text-atelier-softblack uppercase tracking-wider">
              Lookup Your Shipment
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  required
                  placeholder="Order Number (e.g. PR-2026-8491)"
                  value={inputOrderNumber}
                  onChange={(e) => setInputOrderNumber(e.target.value)}
                  className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs font-mono text-atelier-softblack focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <input
                  type="email"
                  placeholder="Account Email (optional)"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-atelier-softblack text-atelier-parchment py-2.5 px-4 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center"
                >
                  <Search size={13} className="mr-1" />
                  <span>Lookup</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Order Tracking Timeline Display */}
        {loadingOrder ? (
          <div className="p-16 text-center bg-atelier-cream border border-atelier-parchment space-y-4">
            <Loader2 size={24} className="animate-spin text-atelier-taupe mx-auto" />
            <p className="text-xs text-atelier-charcoal font-light">
              Retrieving live production & transit records...
            </p>
          </div>
        ) : currentOrder ? (
          <div className="bg-atelier-cream/70 border border-atelier-parchment p-8 sm:p-10 space-y-10 shadow-subtle">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-atelier-parchment pb-6 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-atelier-taupe font-mono">
                  Order Reference
                </span>
                <div className="font-serif text-2xl text-atelier-softblack font-medium">
                  {currentOrder.orderNumber}
                </div>
                <div className="text-xs text-atelier-taupe">Placed on {currentOrder.date}</div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                  <div className="inline-block px-3 py-1 bg-atelier-parchment border border-atelier-sand text-atelier-darkbrown text-xs font-mono font-medium">
                    Status: {currentOrder.status}
                  </div>
                  {currentOrder.isMadeToOrder && (
                    <div className="inline-block px-3 py-1 bg-purple-50 border border-purple-200 text-purple-900 text-xs font-mono font-medium">
                      Loom Stage: {currentOrder.productionMilestone || 'In Production'}
                    </div>
                  )}
                </div>
                <div className="text-xs text-atelier-charcoal font-light">
                  Carrier: <span className="font-medium">{currentOrder.carrier}</span> · Tracking:{' '}
                  <span className="font-mono">
                    {currentOrder.trackingNumber || 'Pending Courier Dispatch'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="space-y-6">
              <div className="text-xs uppercase tracking-wider font-medium text-atelier-softblack">
                Progress & Production Stages
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-atelier-parchment">
                {currentOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start space-x-4">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                        event.completed
                          ? 'bg-atelier-darkbrown border-atelier-darkbrown'
                          : event.current
                          ? 'bg-atelier-gold border-atelier-darkbrown animate-pulse'
                          : 'bg-atelier-ivory border-atelier-taupe'
                      }`}
                    />

                    {/* Content */}
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h4
                          className={`font-serif text-base font-medium ${
                            event.completed || event.current
                              ? 'text-atelier-softblack'
                              : 'text-atelier-taupe'
                          }`}
                        >
                          {event.title}
                        </h4>
                        <span className="text-[11px] font-mono text-atelier-taupe">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Items Preview */}
            <div className="border-t border-atelier-parchment pt-6 space-y-3">
              <div className="text-xs uppercase tracking-wider font-medium text-atelier-softblack">
                Package Contents
              </div>
              <div className="divide-y divide-atelier-parchment/60">
                {currentOrder.items.map((i) => (
                  <div key={i.variantId} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={i.productImage}
                        alt={i.productName}
                        className="w-12 h-14 object-cover border border-atelier-parchment"
                      />
                      <div>
                        <div className="font-serif text-sm text-atelier-softblack font-medium">{i.productName}</div>
                        <div className="text-atelier-taupe text-[11px]">{i.size} · SKU: {i.sku}</div>
                      </div>
                    </div>
                    <span className="font-mono text-atelier-darkbrown">{formatPrice(i.priceUSD * i.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Info */}
            <div className="border-t border-atelier-parchment pt-6 flex flex-col sm:flex-row justify-between text-xs text-atelier-taupe gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-medium text-atelier-softblack">
                  Destination
                </span>
                <div>
                  {currentOrder.customer.firstName} {currentOrder.customer.lastName}
                </div>
                <div>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.country}</div>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] uppercase tracking-wider font-medium text-atelier-softblack">
                  Transit Protection
                </span>
                <div>100% Insured Air Freight</div>
                <div>Conditioning inspected in Bhadohi</div>
              </div>
            </div>
          </div>
        ) : currentQuote ? (
          <div className="bg-atelier-cream/80 border border-atelier-parchment p-8 sm:p-10 space-y-8 shadow-subtle animate-in fade-in-50 duration-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-atelier-parchment pb-6 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-atelier-taupe font-mono">
                  Bespoke Commission Reference
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal mt-1">
                  {currentQuote.referenceNumber}
                </h2>
                <div className="text-xs text-atelier-charcoal font-light mt-1">
                  Commission registered for <strong className="font-medium">{currentQuote.fullName}</strong> · {currentQuote.country}
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] uppercase tracking-wider text-atelier-taupe font-mono">
                  Commission Stage
                </span>
                <span
                  className={`mt-1 px-3 py-1 text-xs font-mono uppercase tracking-wider border font-medium ${
                    currentQuote.status === 'Production Scheduled'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : currentQuote.status === 'Quotation Sent'
                      ? 'bg-sky-50 text-sky-800 border-sky-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  {currentQuote.status}
                </span>
                <span className="text-[11px] text-atelier-taupe mt-1 font-mono">
                  Submitted {currentQuote.createdAt}
                </span>
              </div>
            </div>

            {/* Bespoke Loom Milestones Pipeline */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-atelier-taupe font-mono block">
                Atelier Commission Progression
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  {
                    stage: 'Inquiry Received',
                    desc: 'Dimensions & room specs registered',
                    done: true,
                    current: currentQuote.status === 'Received',
                  },
                  {
                    stage: 'Atelier Review',
                    desc: 'Master weaver & loom assessment',
                    done: currentQuote.status !== 'Received',
                    current: currentQuote.status === 'Reviewing',
                  },
                  {
                    stage: 'Quotation Dispatched',
                    desc: 'Official valuation & timeline issued',
                    done: currentQuote.status === 'Quotation Sent' || currentQuote.status === 'Production Scheduled',
                    current: currentQuote.status === 'Quotation Sent',
                  },
                  {
                    stage: 'Loom Active',
                    desc: 'Yarn dyeing & weaving initiated',
                    done: currentQuote.status === 'Production Scheduled',
                    current: currentQuote.status === 'Production Scheduled',
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 border transition-all ${
                      step.current
                        ? 'bg-atelier-ivory border-atelier-darkbrown shadow-xs ring-1 ring-atelier-darkbrown/40'
                        : step.done
                        ? 'bg-atelier-cream/60 border-emerald-300 text-atelier-softblack'
                        : 'bg-atelier-ivory/50 border-atelier-parchment/70 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      {step.done ? (
                        <CheckCircle2 size={14} className="text-emerald-700 flex-shrink-0" />
                      ) : (
                        <Clock size={14} className="text-atelier-taupe flex-shrink-0" />
                      )}
                      <span className="text-xs font-serif font-medium">{step.stage}</span>
                    </div>
                    <p className="text-[11px] text-atelier-charcoal/80 font-light leading-snug">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission Valuation & Timeline Specs */}
            <div className="bg-atelier-ivory border border-atelier-parchment p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-atelier-taupe uppercase tracking-wider block">Dimensions</span>
                  <div className="font-mono text-sm font-medium text-atelier-softblack">
                    {currentQuote.width}' × {currentQuote.length}' {currentQuote.unit}
                  </div>
                  <div className="text-[11px] text-atelier-taupe">({currentQuote.shape})</div>
                </div>

                <div>
                  <span className="text-[10px] text-atelier-taupe uppercase tracking-wider block">Weave & Material</span>
                  <div className="text-sm font-medium text-atelier-softblack">{currentQuote.technique}</div>
                  <div className="text-[11px] text-atelier-taupe">{currentQuote.material}</div>
                </div>

                <div>
                  <span className="text-[10px] text-atelier-taupe uppercase tracking-wider block">Atelier Valuation</span>
                  <div className="font-mono text-sm font-semibold text-atelier-darkbrown">
                    {currentQuote.quotedPriceUSD ? formatPrice(currentQuote.quotedPriceUSD) : 'Under Evaluation'}
                  </div>
                  <div className="text-[10px] text-emerald-800">
                    {currentQuote.quotedPriceUSD ? 'Official Atelier Quotation' : 'Estimate pending'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-atelier-taupe uppercase tracking-wider block">Handcrafted Timeline</span>
                  <div className="text-xs font-medium text-atelier-softblack">
                    {currentQuote.quotedLeadTime || (currentQuote.technique === 'Hand-Knotted' ? '3 to 6 months' : 'Usual 3–4 weeks')}
                  </div>
                  <div className="text-[10px] text-atelier-taupe">From deposit confirmation</div>
                </div>
              </div>

              {/* Message from Atelier Director */}
              {currentQuote.adminReplyMessage && (
                <div className="bg-atelier-cream border-l-3 border-atelier-agedgold p-4 space-y-1.5 mt-2">
                  <span className="text-[10px] uppercase tracking-wider text-atelier-darkbrown font-mono font-medium block">
                    Message from the Bhadohi Loom Directorship:
                  </span>
                  <p className="text-xs text-atelier-softblack font-light leading-relaxed whitespace-pre-line">
                    {currentQuote.adminReplyMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Direct Studio Contact */}
            <div className="border-t border-atelier-parchment pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-atelier-taupe gap-4">
              <div>
                Questions about your bespoke quote or want to request physical yarn pompoms?
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={`mailto:prasrirugs@gmail.com?subject=Inquiry%20Bespoke%20Commission%20${encodeURIComponent(currentQuote.referenceNumber)}`}
                  className="px-3 py-1.5 bg-atelier-softblack text-atelier-parchment hover:bg-atelier-darkbrown uppercase font-mono tracking-wider text-[11px] transition-colors"
                >
                  Email Studio
                </a>
              </div>
            </div>
          </div>
        ) : searched && activeOrderNumber ? (
          <div className="p-12 text-center bg-atelier-cream border border-atelier-parchment space-y-3">
            <h3 className="font-serif text-xl text-atelier-softblack">No order found for "{activeOrderNumber}"</h3>
            <p className="text-xs text-atelier-charcoal font-light">
              Please verify the order reference number or consult your account order history.
            </p>
          </div>
        ) : (
          <div className="p-12 text-center bg-atelier-cream border border-atelier-parchment space-y-3">
            <Package size={28} className="mx-auto text-atelier-taupe" />
            <h3 className="font-serif text-xl text-atelier-softblack">Track Your Atelier Creation</h3>
            <p className="text-xs text-atelier-charcoal font-light max-w-md mx-auto leading-relaxed">
              Enter your order reference number above to view real-time artisan progress and express air shipment telemetry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
