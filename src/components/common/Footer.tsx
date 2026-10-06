import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Check, Loader2 } from 'lucide-react';
import { useCurrency, CURRENCY_RATES } from '../../context/CurrencyContext';
import { newsletterService } from '../../services/newsletterService';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeError, setSubscribeError] = useState('');
  const { currency, setCurrency, rates } = useCurrency();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;

    setSubscribing(true);
    setSubscribeError('');
    try {
      const result = await newsletterService.subscribe(email);
      if (result.success) {
        setSubscribeMessage(result.message);
        setSubscribed(true);
        setEmail('');
      } else {
        setSubscribeError(result.message || 'Could not subscribe. Please try again.');
        setSubscribed(false);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setSubscribeError('Unable to connect to server. Please try again.');
      setSubscribed(false);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-atelier-softblack text-atelier-parchment pt-16 pb-12 border-t border-atelier-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-atelier-charcoal/60">
          <div className="lg:col-span-6 space-y-5">
            <Link to="/" className="inline-flex items-center gap-4 sm:gap-5 group">
              {/* Gold Heritage Medallion Seal */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-1 ring-[#C59E50]/50 shadow-2xl shadow-black/80 flex-shrink-0 bg-[#F4EFEA] transition-all duration-700 ease-out group-hover:scale-105 group-hover:ring-[#C59E50]">
                <img
                  src="/images/prasri-medallion.jpg"
                  alt="Prasri Rugs Bhadohi Heritage Medallion Seal"
                  className="w-full h-full object-cover scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-112"
                />
              </div>

              <div className="space-y-1">
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.28em] text-atelier-cream block group-hover:text-white transition-colors">
                  PRASRI RUGS
                </span>
                <div className="text-[9px] tracking-[0.4em] text-atelier-taupe uppercase">
                  BHADOHI · INDIA
                </div>
              </div>
            </Link>

            <p className="text-sm text-atelier-parchment/70 max-w-md font-light leading-relaxed">
              Contemporary rugs rooted in Indian craftsmanship. Handcrafted slowly, with patience and restraint, in Bhadohi for considered architectural spaces worldwide.
            </p>
            <div className="text-xs text-atelier-taupe pt-1 space-y-1">
              <div>Prasri Rugs · G.T. Road, Gopiganj, Bhadohi, Uttar Pradesh 221303, India</div>
              <div>Insured International Express Air Delivery · Door-to-Door Tracking</div>
            </div>

            {/* Direct Connected Social & WhatsApp Channels */}
            <div className="pt-2 flex items-center space-x-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-atelier-taupe font-mono">
                Connect:
              </span>
              <a
                href="https://instagram.com/prasrirugs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Prasri Rugs on Instagram"
                title="Instagram @prasrirugs"
                className="w-8 h-8 rounded-full bg-atelier-deepblack border border-atelier-charcoal hover:border-[#E4405F] text-atelier-parchment/80 hover:text-[#E4405F] hover:bg-black flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/919839418038?text=Hello%20Prasri%20Rugs%2C%20I%20am%20inquiring%20about%20your%20handcrafted%20rugs."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                title="WhatsApp Concierge (+91 98394 18038)"
                className="w-8 h-8 rounded-full bg-atelier-deepblack border border-atelier-charcoal hover:border-[#25D366] text-atelier-parchment/80 hover:text-[#25D366] hover:bg-black flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter / The Atelier Letter */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="font-serif text-lg tracking-wider text-atelier-cream">
              The Atelier Letter
            </h4>
            <p className="text-xs text-atelier-parchment/70 max-w-md font-light leading-relaxed">
              Infrequent dispatches exploring slow craft, architectural interiors, new loom releases, and rug care guides. No spam.
            </p>

            {subscribed ? (
              <div className="flex items-center text-xs text-atelier-gold bg-atelier-charcoal/50 py-3 px-4 rounded border border-atelier-gold/20">
                <Check size={16} className="mr-2 text-atelier-gold flex-shrink-0" />
                <span>{subscribeMessage || 'Thank you. You have been added to the atelier correspondence list.'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md pt-1">
                <input
                  type="email"
                  required
                  value={email}
                  disabled={subscribing}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-atelier-deepblack/60 border border-atelier-charcoal text-xs text-atelier-parchment placeholder:text-atelier-taupe/60 px-4 py-3 focus:outline-none focus:border-atelier-gold/60 transition-colors disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-atelier-parchment text-atelier-softblack px-5 py-3 text-xs tracking-widest uppercase hover:bg-atelier-cream transition-colors flex items-center justify-center font-medium disabled:opacity-60"
                >
                  {subscribing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      <span className="mr-1">Join</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </form>
            )}
            {subscribeError && (
              <p className="text-xs text-rose-300 font-light mt-1.5 flex items-center">
                <span>{subscribeError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Middle: Categorized Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12 border-b border-atelier-charcoal/60 text-xs">
          {/* Column 1: Shop & Collections */}
          <div className="space-y-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-atelier-taupe font-medium">
              Explore
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Shop All Rugs
                </Link>
              </li>
              <li>
                <Link to="/shop?availability=ready-to-ship" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Ready to Ship
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/collections/modern-forms" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Modern Forms
                </Link>
              </li>
              <li>
                <Link to="/collections/quiet-neutrals" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Quiet Neutrals
                </Link>
              </li>
              <li>
                <Link to="/collections/hand-knotted-collection" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Hand-Knotted
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Custom & Craft */}
          <div className="space-y-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-atelier-taupe font-medium">
              Bespoke & Craft
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/custom-rugs" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Custom Rugs Studio
                </Link>
              </li>
              <li>
                <Link to="/craft" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  The Craft & Techniques
                </Link>
              </li>
              <li>
                <Link to="/the-atelier" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  The Bhadohi Story
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Interactive Size Guide
                </Link>
              </li>
              <li>
                <Link to="/rug-care" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Wool & Rug Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Atelier & Editorial */}
          <div className="space-y-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-atelier-taupe font-medium">
              Editorial
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/the-atelier" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  The Atelier
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  The Journal
                </Link>
              </li>
              <li>
                <Link to="/journal?tab=faq" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  FAQ & Inquiries
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Contact & Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Client Services & Direct Social Links */}
          <div className="space-y-4">
            <div className="text-[10px] tracking-[0.25em] uppercase text-atelier-taupe font-medium">
              Client Care
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/order-tracking" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-atelier-parchment/80 hover:text-white transition-colors">
                  Concierge & Inquiries
                </Link>
              </li>
            </ul>

            {/* Direct Connected Logos Instead of Written Text */}
            <div className="pt-2">
              <div className="text-[10px] tracking-[0.2em] uppercase text-atelier-taupe font-medium mb-2.5">
                Direct Channels
              </div>
              <div className="flex items-center space-x-3">
                {/* Instagram Logo Button */}
                <a
                  href="https://instagram.com/prasrirugs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Prasri Rugs on Instagram"
                  title="Follow on Instagram (@prasrirugs)"
                  className="w-9 h-9 rounded-full bg-atelier-deepblack border border-atelier-charcoal hover:border-[#E4405F] text-atelier-parchment/80 hover:text-[#E4405F] hover:bg-[#E4405F]/10 hover:shadow-[0_0_16px_rgba(228,64,95,0.45)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <svg className="w-4 h-4 fill-current group-hover:brightness-125 group-hover:drop-shadow-[0_0_6px_rgba(228,64,95,0.8)] transition-all duration-300" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* WhatsApp Logo Button */}
                <a
                  href="https://wa.me/919839418038?text=Hello%20Prasri%20Rugs%2C%20I%20am%20inquiring%20about%20your%20handcrafted%20rugs."
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  title="WhatsApp Concierge (+91 98394 18038)"
                  className="w-9 h-9 rounded-full bg-atelier-deepblack border border-atelier-charcoal hover:border-[#25D366] text-atelier-parchment/80 hover:text-[#25D366] hover:bg-[#25D366]/10 hover:shadow-[0_0_16px_rgba(37,211,102,0.45)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <svg className="w-4 h-4 fill-current group-hover:brightness-125 group-hover:drop-shadow-[0_0_6px_rgba(37,211,102,0.8)] transition-all duration-300" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 5: Region & Currency */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-atelier-taupe font-medium">
              Region & Currency
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-xs text-atelier-parchment/80">
                <Globe size={14} className="mr-2 text-atelier-taupe shrink-0" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-atelier-deepblack text-xs text-atelier-parchment border border-atelier-charcoal px-2.5 py-1.5 focus:outline-none focus:border-atelier-gold/60 rounded"
                >
                  {Object.values(rates || CURRENCY_RATES).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} ({r.symbol}) — {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Authenticity Strip with Brightening Hover Glow on All Brand Logos */}
        <div className="py-6 border-b border-atelier-charcoal/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Razorpay Brand Badge with Signature Brightening Glow */}
          <div
            title="Secured by Razorpay Payment Gateway"
            className="group/rzp flex items-center space-x-2.5 h-9 px-4 rounded-lg bg-atelier-deepblack border border-atelier-charcoal hover:border-[#3395FF] hover:bg-[#3395FF]/10 hover:shadow-[0_0_16px_rgba(51,149,255,0.45)] hover:scale-105 transition-all duration-300 cursor-default select-none"
          >
            <svg className="w-4 h-4 fill-[#3395FF] group-hover/rzp:brightness-125 group-hover/rzp:drop-shadow-[0_0_6px_rgba(51,149,255,0.8)] transition-all duration-300" viewBox="0 0 24 24">
              <path d="M14.5 1.5L4 16h6l-3.5 6.5 13-13.5h-6.5l3.5-7.5z" />
            </svg>
            <span className="text-xs font-sans tracking-wide text-atelier-parchment/90 group-hover/rzp:text-white transition-colors">
              Payments by <strong className="font-semibold text-white group-hover/rzp:text-[#3395FF] transition-colors">Razorpay</strong>
            </span>
          </div>

          {/* Payment Method Badges with Authentic SVG Logos & Dynamic Brand Brightening Glow */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {/* UPI */}
            <div
              title="Unified Payments Interface (UPI - GPay, PhonePe, Paytm, BHIM)"
              className="group/upi h-9 px-3.5 bg-atelier-deepblack border border-atelier-charcoal rounded-lg flex items-center space-x-2 text-atelier-parchment/80 hover:text-white hover:border-[#097939] hover:bg-[#097939]/10 hover:shadow-[0_0_16px_rgba(9,121,57,0.45)] hover:scale-105 transition-all duration-300 cursor-default select-none"
            >
              <svg className="h-4 w-auto group-hover/upi:brightness-125 group-hover/upi:drop-shadow-[0_0_6px_rgba(9,121,57,0.7)] transition-all duration-300" viewBox="0 0 52 18" fill="none">
                <path d="M9 2L3 16H7L13 2H9Z" fill="#097939" />
                <path d="M15 2L9 16H13L19 2H15Z" fill="#753594" />
                <path d="M21 2L15 16H19L25 2H21Z" fill="#F37021" />
                <text x="27" y="14" fill="currentColor" fontSize="11" fontWeight="800" fontStyle="italic" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5px">UPI</text>
              </svg>
            </div>

            {/* Visa */}
            <div
              title="Visa Secure Worldwide"
              className="group/visa h-9 px-3.5 bg-atelier-deepblack border border-atelier-charcoal rounded-lg flex items-center space-x-2 text-atelier-parchment/80 hover:text-[#3B82F6] hover:border-[#2563EB] hover:bg-[#2563EB]/10 hover:shadow-[0_0_16px_rgba(37,99,235,0.45)] hover:scale-105 transition-all duration-300 cursor-default select-none"
            >
              <svg className="h-3.5 w-auto fill-current group-hover/visa:brightness-125 group-hover/visa:drop-shadow-[0_0_6px_rgba(59,130,246,0.8)] transition-all duration-300" viewBox="0 0 50 16">
                <path d="M19.2 1.3L12.5 15.2H8.3L5.1 4.2C4.9 3.4 4.7 3.1 4 2.7C2.9 2.1 1.4 1.6 0 1.3L0.1 0.8H7.3C8.2 0.8 9 1.5 9.2 2.5L11 11.2L15.3 0.8H19.2ZM36 10.3C36 6.4 30.5 6.2 30.5 4.5C30.5 3.9 31.1 3.2 32.4 3C33 2.9 34.8 2.8 36.7 3.7L37.4 0.6C36.4 0.2 35.1 0 33.5 0C29.4 0 26.5 2.2 26.5 5.3C26.5 7.6 28.6 8.9 30.2 9.7C31.8 10.5 32.4 11 32.4 11.7C32.4 12.8 31.1 13.3 29.8 13.3C27.7 13.3 26.5 12.8 25.5 12.3L24.7 15.6C25.7 16.1 27.5 16.5 29.4 16.5C33.8 16.5 36.6 14.3 36 10.3ZM46.6 15.2H50.2L47.1 0.8H43.8C43 0.8 42.4 1.3 42.1 2L36 15.2H40.2L41 12.9H46.1L46.6 15.2ZM42.2 9.8L44.3 3.9L45.5 9.8H42.2ZM25.5 0.8L22.2 15.2H18.2L21.5 0.8H25.5Z" />
              </svg>
            </div>

            {/* Mastercard */}
            <div
              title="Mastercard Identity Check"
              className="group/mc h-9 px-3.5 bg-atelier-deepblack border border-atelier-charcoal rounded-lg flex items-center space-x-2 text-atelier-parchment/80 hover:text-white hover:border-[#EB001B] hover:bg-[#EB001B]/10 hover:shadow-[0_0_16px_rgba(235,0,27,0.45)] hover:scale-105 transition-all duration-300 cursor-default select-none"
            >
              <svg className="h-4 w-auto group-hover/mc:brightness-125 group-hover/mc:drop-shadow-[0_0_6px_rgba(235,0,27,0.7)] transition-all duration-300" viewBox="0 0 32 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="#EB001B" />
                <circle cx="22" cy="10" r="9" fill="#F79E1B" fillOpacity="0.95" />
                <path d="M16 3.7A9 9 0 0 0 16 16.3 9 9 0 0 0 16 3.7Z" fill="#FF5F00" />
              </svg>
              <span className="text-[10px] tracking-wide font-sans text-atelier-parchment/90 group-hover/mc:text-white transition-colors">
                Mastercard
              </span>
            </div>

            {/* RuPay */}
            <div
              title="RuPay Domestic & Global Cards"
              className="group/rupay h-9 px-3.5 bg-atelier-deepblack border border-atelier-charcoal rounded-lg flex items-center space-x-1.5 text-atelier-parchment/80 hover:text-white hover:border-[#F37021] hover:bg-[#F37021]/10 hover:shadow-[0_0_16px_rgba(243,112,33,0.45)] hover:scale-105 transition-all duration-300 cursor-default select-none"
            >
              <svg className="h-4 w-auto group-hover/rupay:brightness-125 group-hover/rupay:drop-shadow-[0_0_6px_rgba(243,112,33,0.7)] transition-all duration-300" viewBox="0 0 54 16" fill="none">
                <text x="0" y="13" fill="currentColor" fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="-0.2px">RuPay</text>
                <path d="M43 2L47 8L43 14H47L51 8L47 2H43Z" fill="#097939" />
                <path d="M39 2L43 8L39 14H42L46 8L42 2H39Z" fill="#F37021" />
              </svg>
            </div>

            {/* NetBanking */}
            <div
              title="Net Banking & 50+ Direct Banks"
              className="group/nb h-9 px-3.5 bg-atelier-deepblack border border-atelier-charcoal rounded-lg flex items-center space-x-1.5 text-atelier-parchment/80 hover:text-atelier-gold hover:border-atelier-gold hover:bg-atelier-gold/10 hover:shadow-[0_0_16px_rgba(197,158,80,0.45)] hover:scale-105 transition-all duration-300 cursor-default select-none"
            >
              <svg className="h-4 w-4 stroke-current group-hover/nb:brightness-125 group-hover/nb:drop-shadow-[0_0_6px_rgba(197,158,80,0.8)] transition-all duration-300" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 22 7 12 2" />
                <rect x="4" y="10" width="3" height="7" />
                <rect x="10" y="10" width="3" height="7" />
                <rect x="16" y="10" width="3" height="7" />
                <line x1="2" y1="21" x2="22" y2="21" />
              </svg>
              <span className="text-[10px] tracking-wide font-sans group-hover/nb:text-atelier-gold transition-colors">NetBanking</span>
            </div>
          </div>
        </div>

        {/* Bottom: Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-atelier-taupe gap-4 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} Prasri Rugs. All rights reserved. Handcrafted in Bhadohi, India.
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2">
            <Link to="/terms" className="hover:text-atelier-parchment transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="hover:text-atelier-parchment transition-colors">
              Privacy Policy
            </Link>
            <Link to="/shipping-returns#refund" className="hover:text-atelier-parchment transition-colors">
              Refund Policy
            </Link>
            <Link to="/shipping-returns#shipping" className="hover:text-atelier-parchment transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
