export interface FAQItem {
  question: string;
  answer: string;
  category: 'Orders & Custom Sizing' | 'International Shipping' | 'Care & Maintenance' | 'Craft & Materials';
}

export const FAQS: FAQItem[] = [
  {
    category: 'Orders & Custom Sizing',
    question: 'How do custom rug orders work?',
    answer: 'Every custom rug begins with your space requirements. You can submit desired dimensions (length, width, or runner formats), select your preferred technique (hand-tufted or hand-knotted), and specify material preferences. We provide a complimentary quote and digital layout. Once approved, the rug enters production in Bhadohi and typically dispatches in 4 to 6 weeks.'
  },
  {
    category: 'Orders & Custom Sizing',
    question: 'What is the difference between Ready to Ship and Made to Order?',
    answer: 'Ready to Ship rugs have already completed our stringent quality washing and inspection in Bhadohi. They dispatch within 2 to 4 business days via DHL/FedEx Express. Made to Order rugs are woven or tufted specifically upon order, requiring 4 to 6 weeks for thorough handcrafting, washing, and finishing.'
  },
  {
    category: 'International Shipping',
    question: 'Which countries do you ship to, and how is shipping calculated?',
    answer: 'We ship worldwide directly from Bhadohi, India, via premium express air couriers (DHL Express and FedEx). Transit time to the USA, UK, and Europe is typically 5 to 7 business days with door-to-door insured tracking. Orders exceeding $1,500 USD receive complimentary worldwide express shipping.'
  },
  {
    category: 'International Shipping',
    question: 'How are customs and import duties handled?',
    answer: 'Handmade wool carpets shipped from India enter most international destinations under established textile harmonized codes. For the United States, orders under $800 USD are duty-free under Section 321 de minimis. For the EU and UK, VAT/customs are calculated at local rates, which our checkout can estimate or coordinate with your delivery courier.'
  },
  {
    category: 'Care & Maintenance',
    question: 'Is it normal for a new wool rug to shed?',
    answer: 'Yes. Initial shedding is completely natural for genuine wool rugs made from natural staple fibers. It is simply loose unspun fibers releasing from the sheared pile. Shedding significantly subsides within 3 to 6 weeks with regular gentle suction-only vacuuming (do not use rotating brush or beater bars).'
  },
  {
    category: 'Care & Maintenance',
    question: 'How do I clean a liquid spill?',
    answer: 'Act immediately. Blot—never rub—the spill with a clean, dry white cloth or paper towel to absorb moisture. For water-soluble spots, dab lightly with lukewarm water mixed with a drop of neutral wool-safe detergent. Never soak the rug backing.'
  },
  {
    category: 'Craft & Materials',
    question: 'Where are your rugs crafted?',
    answer: 'All our rugs are made exclusively in Bhadohi, Uttar Pradesh, India—a historic weaving center recognized globally for master rug craftsmanship. We work with independent artisan families using traditional wooden looms and hand tools.'
  }
];
