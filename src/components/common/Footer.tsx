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
  const { currency, setCurrency, rates } = useCurrency();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;

    setSubscribing(true);
    try {
      const result = await newsletterService.subscribe(email);
      setSubscribeMessage(result.message);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      setSubscribeMessage('Thank you for subscribing.');
      setSubscribed(true);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-atelier-softblack text-atelier-parchment pt-16 pb-12 border-t border-atelier-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-atelier-charcoal/60">
          <div className="lg:col-span-6 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.28em] text-atelier-cream">
                PRASRI RUGS
              </span>
              <div className="text-[9px] tracking-[0.4em] text-atelier-taupe uppercase mt-1">
                BHADOHI · INDIA
              </div>
            </Link>
            <p className="text-sm text-atelier-parchment/70 max-w-md font-light leading-relaxed">
              Contemporary rugs rooted in Indian craftsmanship. Handcrafted slowly, with patience and restraint, in Bhadohi for considered architectural spaces worldwide.
            </p>
            <div className="text-xs text-atelier-taupe pt-2 space-y-1">
              <div>Prasri Rugs · G.T. Road, Gopiganj, Bhadohi, Uttar Pradesh 221303, India</div>
              <div>Insured International Express Air Delivery</div>
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

          {/* Column 4: Client Services */}
          <div className="space-y-3">
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
                <a
                  href="https://wa.me/919839418038?text=Hello%2C%20I%20am%20inquiring%20about%20a%20handcrafted%20rug%20from%20Prasri%20Rugs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-atelier-parchment/80 hover:text-white transition-colors"
                >
                  WhatsApp Concierge
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/prasrirugs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-atelier-parchment/80 hover:text-white transition-colors"
                >
                  Instagram @prasrirugs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Origin */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-3">
            <div className="text-[10px] tracking-[0.25em] uppercase text-atelier-taupe font-medium">
              Region & Currency
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-xs text-atelier-parchment/80">
                <Globe size={14} className="mr-2 text-atelier-taupe" />
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

        {/* Bottom: Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-atelier-taupe space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} Prasri Rugs. All rights reserved. Handcrafted in Bhadohi, India.
          </div>
          <div className="flex flex-wrap items-center space-x-6">
            <Link to="/shipping-returns#terms" className="hover:text-atelier-parchment transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/shipping-returns#privacy" className="hover:text-atelier-parchment transition-colors">
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
