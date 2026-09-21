import React from 'react';
import { ShieldCheck, Truck, Sparkles, MapPin, RefreshCw } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  const pillars = [
    {
      icon: MapPin,
      title: 'Handmade in Bhadohi',
      desc: 'Crafted directly in India’s historic weaving district by independent master artisan families.',
    },
    {
      icon: Sparkles,
      title: 'Direct From Atelier',
      desc: 'No distributors or retail markups. Direct communication between the maker and your home.',
    },
    {
      icon: Truck,
      title: 'Insured Global Transit',
      desc: 'Dispatched via insured international air express with full cargo insurance and door-to-door tracking.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Processing',
      desc: 'Encrypted international payment processing supporting cards, digital wallets, and wire transfer.',
    },
    {
      icon: RefreshCw,
      title: '14-Day Return Guarantee',
      desc: 'Standard catalog pieces returnable within 14 days. Refund issued upon return in original quality without damage.',
    },
  ];

  return (
    <section className="py-16 bg-atelier-ivory border-b border-atelier-parchment/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="space-y-2 text-center sm:text-left">
                <Icon size={20} className="text-atelier-agedgold mx-auto sm:mx-0" strokeWidth={1.5} />
                <h4 className="font-serif text-base text-atelier-softblack font-medium">
                  {p.title}
                </h4>
                <p className="text-[11px] text-atelier-charcoal/80 font-light leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
