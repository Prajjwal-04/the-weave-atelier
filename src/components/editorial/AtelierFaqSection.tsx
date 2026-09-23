import React, { useState } from 'react';
import { ChevronDown, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  id: string;
  category: 'craft' | 'care' | 'orders';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'craft-1',
    category: 'craft',
    question: 'What distinguishes a Bhadohi hand-knotted rug from machine-made rugs?',
    answer:
      'Every hand-knotted rug from our Bhadohi atelier is crafted knot-by-knot by master artisans on traditional vertical timber looms. Unlike machine-made or glued tufted rugs, hand-knotted rugs possess an authentic structural weave with zero synthetic adhesives, allowing them to endure for decades, develop a soft organic patina, and be safely washed and restored across generations.',
  },
  {
    id: 'craft-2',
    category: 'craft',
    question: 'How long does it take to weave a single piece?',
    answer:
      'Depending on the knot density (ranging from 60 to 180 KPSI) and the scale of the rug, weaving a standard 8×10 ft piece takes anywhere from 90 to 180 days of patient, uninterrupted loom work by a team of two to three weavers, followed by gentle soft-water washing, natural sun curing, and meticulous hand-shearing.',
  },
  {
    id: 'care-1',
    category: 'care',
    question: 'Is fiber shedding normal with pure Bikaner wool, and how should it be managed?',
    answer:
      'Yes. Genuine high-altitude wool contains short natural fleece fibers that gently loosen during the first 4 to 6 weeks of everyday use. This is a natural characteristic of virgin wool and is not a defect. Vacuum gently with a suction-only setting (avoid abrasive rotating beater bars) once or twice weekly, and shedding will taper off naturally.',
  },
  {
    id: 'care-2',
    category: 'care',
    question: 'How should I clean accidental liquid spills or maintain the pile?',
    answer:
      'Blot immediately using a clean, dry undyed cloth or paper towel to absorb liquids before they penetrate the fibers. Never rub vigorously. For minor spots, dab gently with lukewarm water and mild wool-safe detergent. We recommend rotating your rug 180 degrees once a year for balanced foot traffic exposure.',
  },
  {
    id: 'orders-1',
    category: 'orders',
    question: 'Can I order a custom size, runner, or bespoke shape for my space?',
    answer:
      'Yes, custom dimensions and bespoke commissions are central to our atelier. Through our Custom Rugs portal, you can specify exact dimensions, geometric shapes, pile depths, and fiber blends. We provide architectural renderings and strike-off yarn color samples before weaving begins.',
  },
  {
    id: 'orders-2',
    category: 'orders',
    question: 'What is your return and inspection policy?',
    answer:
      'We stand behind the craftsmanship of every handwoven piece. If you wish to return a ready-to-ship piece, please notify us within 7 days of delivery. Return shipping is handled by the buyer. Once the rug is received back at our Bhadohi atelier in its original, undamaged condition, a full refund will be placed.',
  },
  {
    id: 'orders-3',
    category: 'orders',
    question: 'How are rugs packaged to ensure safe, weather-protected transit?',
    answer:
      'Every rug is rolled pile-inward around a reinforced structural core, encased in breathable moisture-resistant membrane wraps, and finished in heavy-duty protective outer casing before handover to insured courier logistics with real-time tracking.',
  },
];

export const AtelierFaqSection: React.FC<{ className?: string; hideHeader?: boolean }> = ({
  className = '',
  hideHeader = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'craft' | 'care' | 'orders'>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'craft-1': true, // Keep first open by default
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs =
    activeCategory === 'all' ? FAQ_DATA : FAQ_DATA.filter((item) => item.category === activeCategory);

  return (
    <section className={`py-12 sm:py-16 bg-atelier-cream/50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        {!hideHeader && (
          <div className="text-center space-y-3 mb-12 sm:mb-16">
            <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center justify-center space-x-2">
              <span className="text-atelier-agedgold">KNOWLEDGE BASE</span>
              <span className="text-atelier-taupe/40">·</span>
              <span className="text-atelier-taupe">ATELIER KNOWLEDGE & INQUIRIES</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-atelier-softblack font-light tracking-tight">
              Frequently Asked <span className="italic font-normal text-atelier-agedgold">Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-atelier-charcoal/80 font-light max-w-xl mx-auto leading-relaxed">
              Guidance on Bhadohi loom heritage, natural fleece behavior, sizing, and atelier logistics.
            </p>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-10 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'craft', label: 'Craft & Weaving' },
            { id: 'care', label: 'Fiber Care & Shedding' },
            { id: 'orders', label: 'Bespoke & Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-atelier-softblack text-atelier-parchment shadow-sm'
                  : 'bg-atelier-ivory border border-atelier-parchment text-atelier-charcoal hover:border-atelier-softblack/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = !!openItems[faq.id];
            return (
              <div
                key={faq.id}
                className="bg-atelier-ivory border border-atelier-parchment transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between space-x-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg text-atelier-softblack font-normal leading-snug">
                    {faq.question}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full border border-atelier-parchment flex items-center justify-center shrink-0 text-atelier-taupe transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-atelier-parchment/60 text-atelier-softblack' : ''
                    }`}
                  >
                    <ChevronDown size={14} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 pt-1 text-xs sm:text-sm text-atelier-charcoal/85 font-light leading-relaxed border-t border-atelier-parchment/40 animate-fadeIn">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Concierge Assistance Footer */}
        <div className="mt-14 p-6 sm:p-8 bg-atelier-ivory border border-atelier-parchment flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-serif text-base text-atelier-softblack font-light">
              Have a specific room size or <span className="italic font-normal text-atelier-agedgold">design query?</span>
            </h4>
            <p className="text-xs text-atelier-taupe font-light">
              Our studio specialists in Bhadohi are available to advise on custom dimensions, yarn palettes, and loom schedules.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/contact"
              className="px-4 py-2.5 bg-atelier-ivory border border-atelier-softblack text-atelier-softblack text-xs uppercase tracking-wider font-medium hover:bg-atelier-softblack hover:text-atelier-parchment transition-colors inline-flex items-center space-x-2"
            >
              <Mail size={13} />
              <span>Contact Studio</span>
            </Link>
            <a
              href="https://wa.me/919839418038?text=Hello%20Prasri%20Rugs,%20I%20have%20an%20inquiry%20regarding%20handcrafted%20rugs."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#25D366] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#20ba59] transition-colors inline-flex items-center space-x-2 shadow-sm"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
