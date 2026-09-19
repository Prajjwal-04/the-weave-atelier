import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, Globe, RotateCcw, Package, AlertCircle } from 'lucide-react';

export const ShippingReturnsPage: React.FC = () => {
  const destinations = [
    {
      region: 'United States & Canada',
      transit: '5 to 7 business days',
      carrier: 'DHL Express / FedEx Priority',
      duties: 'Duty-free under $800 USD (USA Section 321 de minimis). Canada subject to GST/PST.',
    },
    {
      region: 'United Kingdom',
      transit: '5 to 7 business days',
      carrier: 'DHL Express International',
      duties: 'Subject to standard UK VAT and HMRC customs processing.',
    },
    {
      region: 'European Union',
      transit: '5 to 7 business days',
      carrier: 'DHL Express Worldwide',
      duties: 'Delivered DDU/DDP depending on checkout country selection. Local VAT applies.',
    },
    {
      region: 'Australia & New Zealand',
      transit: '7 to 10 business days',
      carrier: 'DHL Express / Australia Post Global',
      duties: 'Orders under $1,000 AUD are duty-free. 10% GST applies.',
    },
    {
      region: 'India (Domestic)',
      transit: '3 to 5 business days',
      carrier: 'Bluedart / Delhivery Express',
      duties: 'All GST included. Doorstep white glove dispatch from Bhadohi.',
    },
    {
      region: 'Rest of the World (50+ Countries)',
      transit: '7 to 12 business days',
      carrier: 'DHL Express Insured Air Freight',
      duties: 'Calculated at destination customs per national tariff guidelines.',
    },
  ];

  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium mb-2">
            Global Logistics
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight">
            International Shipping & Returns
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light mt-3 leading-relaxed">
            Every rug is dispatched directly from our Bhadohi studio in India via premium insured express air freight with door-to-door tracking.
          </p>
        </div>

        {/* Free Shipping Policy Notice */}
        <div className="p-8 bg-atelier-cream border border-atelier-parchment space-y-3">
          <div className="flex items-center space-x-2 text-xs font-medium text-atelier-darkbrown uppercase tracking-wider">
            <ShieldCheck size={16} className="text-atelier-gold" />
            <span>Complimentary Worldwide Delivery Policy</span>
          </div>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
            We offer complimentary worldwide express shipping on all orders over <strong>$1,500 USD</strong> (or equivalent in EUR, GBP, AUD, CAD, INR). For orders under this threshold, shipping is dynamically calculated at checkout based on rug weight, cubic dimensions, and destination country.
          </p>
        </div>

        {/* International Transit Times Table */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
            Destination Transit Timetables
          </h2>
          <div className="overflow-x-auto border border-atelier-parchment bg-atelier-ivory">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-atelier-cream border-b border-atelier-parchment text-[10px] uppercase tracking-wider text-atelier-taupe font-medium">
                  <th className="p-4">Destination</th>
                  <th className="p-4">Estimated Transit</th>
                  <th className="p-4">Carrier Service</th>
                  <th className="p-4">Duties & Taxes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-atelier-parchment text-atelier-charcoal">
                {destinations.map((d) => (
                  <tr key={d.region} className="hover:bg-atelier-cream/50 transition-colors">
                    <td className="p-4 font-medium text-atelier-softblack">{d.region}</td>
                    <td className="p-4 font-mono">{d.transit}</td>
                    <td className="p-4">{d.carrier}</td>
                    <td className="p-4 text-[11px] text-atelier-taupe font-light leading-relaxed">{d.duties}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processing vs Production Timelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="p-8 bg-atelier-ivory border border-atelier-parchment space-y-3">
            <div className="flex items-center space-x-2 text-xs font-medium text-atelier-softblack uppercase tracking-wider">
              <Clock size={16} className="text-atelier-gold" />
              <span>Ready to Ship Collections</span>
            </div>
            <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
              Pieces identified as <strong>READY TO SHIP</strong> have completed inspection and conditioning. They dispatch from Bhadohi within <strong>2 to 4 business days</strong> of payment verification.
            </p>
          </div>

          <div className="p-8 bg-atelier-ivory border border-atelier-parchment space-y-3">
            <div className="flex items-center space-x-2 text-xs font-medium text-atelier-softblack uppercase tracking-wider">
              <Package size={16} className="text-atelier-gold" />
              <span>Made to Order & Custom Sizing</span>
            </div>
            <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
              Rugs marked <strong>MADE TO ORDER</strong> are warped and woven knot-by-knot specifically upon order confirmation. Production requires <strong>4 to 6 weeks</strong> for hand-tufted pieces, and <strong>7 to 10 weeks</strong> for high-density hand-knotted heirlooms.
            </p>
          </div>
        </div>

        {/* Packaging, Insurance & Damage in Transit */}
        <div className="space-y-6 pt-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
            Packaging & Transit Protection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-atelier-charcoal font-light leading-relaxed">
            <div className="p-6 bg-atelier-cream border border-atelier-parchment space-y-2">
              <div className="font-medium text-atelier-softblack">Moisture-Proof Membrane</div>
              <p>Every rug is rolled pile-inward around heavy-gauge core tubes and double-wrapped in breathable water-resistant polyethylene barriers.</p>
            </div>
            <div className="p-6 bg-atelier-cream border border-atelier-parchment space-y-2">
              <div className="font-medium text-atelier-softblack">Reinforced Outer Casing</div>
              <p>Heavy-duty woven polypropylene outer protective sacks sealed with waterproof vulcanized tape ensure defense against airport handling.</p>
            </div>
            <div className="p-6 bg-atelier-cream border border-atelier-parchment space-y-2">
              <div className="font-medium text-atelier-softblack">100% Insured Air Transit</div>
              <p>All shipments carry comprehensive cargo insurance covering loss or damage. If your package arrives compromised, we replace or refund promptly.</p>
            </div>
          </div>
        </div>

        {/* 14-Day Return Policy */}
        <div id="refund" className="p-8 sm:p-10 bg-atelier-ivory border border-atelier-parchment space-y-4">
          <div className="flex items-center space-x-2 text-xs font-medium text-atelier-softblack uppercase tracking-wider">
            <RotateCcw size={16} className="text-atelier-gold" />
            <span>14-Day Atelier Return Policy</span>
          </div>
          <h3 className="font-serif text-2xl text-atelier-softblack font-normal">
            Rethink It in Your Home
          </h3>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
            We understand that seeing a rug in your unique daylight and alongside your furniture is the ultimate test. You may initiate a return for standard catalog rugs within <strong>14 calendar days</strong> of confirmed courier delivery.
          </p>
          <div className="text-xs text-atelier-taupe space-y-1.5 font-light pt-2">
            <div>• Items must be in original, unsoiled condition with atelier tags attached.</div>
            <div>• Custom sized and made-to-order bespoke rugs are crafted specifically for your space and cannot be returned once production commences, except in cases of manufacturing defect.</div>
            <div>• Return shipping coordination is facilitated by our atelier concierge.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
