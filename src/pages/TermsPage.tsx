import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Scale } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const TermsPage: React.FC = () => {
  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen text-atelier-softblack">
      <SEO
        title="Terms & Conditions"
        description="Review the terms and conditions governing purchases, bespoke commissions, international transit, and service agreements at Prasri Rugs."
        canonicalPath="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium mb-2 flex items-center space-x-2">
            <span className="text-atelier-agedgold">LEGAL FRAMEWORK</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">ATELIER AGREEMENTS</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tight">
            Terms & <span className="italic font-normal text-atelier-agedgold">Conditions</span>
          </h1>
          <p className="text-sm text-atelier-charcoal font-light mt-3 leading-relaxed">
            Effective Date: October 2026 · Prasri Rugs, Bhadohi, Uttar Pradesh, India
          </p>
        </div>

        {/* Highlight Card */}
        <div className="p-6 sm:p-8 bg-atelier-cream border border-atelier-parchment space-y-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-atelier-darkbrown uppercase tracking-wider">
            <Scale size={16} className="text-atelier-gold flex-shrink-0" />
            <span>Artisan Direct Atelier Agreement</span>
          </div>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
            By accessing our studio website (prasrirugs.com / www.prasrirugs.com), purchasing ready-to-ship gallery rugs, or placing bespoke custom sizing commissions, you agree to the following terms and conditions.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              1. Atelier Craftsmanship & Handmade Nature
            </h2>
            <p>
              Every rug presented by Prasri Rugs is meticulously crafted by hand in Bhadohi, India, using traditional hand-tufting, hand-knotting, and flatweave loom techniques. Because our works are formed slowly with natural wool fibers, organic yarns, and artisanal washing processes, minor variations in dimensions (up to ±3%), pile hand-shearing contours, and subtle tonal gradations (abrash) are organic hallmarks of authentic handcraft rather than manufacturing defects.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              2. Sizing, Pricing & In-Studio Commissions
            </h2>
            <p>
              Catalog prices are quoted in Indian Rupees (INR) and convertible to international currencies (USD, EUR, GBP, AUD, CAD) based on prevailing exchange rates. We reserve the right to revise pricing for future commissions without prior notice.
            </p>
            <p>
              For made-to-order and bespoke custom sizing orders: Production begins only after written confirmation of rug dimensions, technique specifications, and receipt of agreed payment. Sizing customizations are hand-drafted specifically for the client's architecture.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              3. Dispatch, Global Freight & Customs
            </h2>
            <p>
              • <strong>Ready-to-Ship Pieces:</strong> Prepared, conditioned, and dispatched via express air courier within 2 to 4 business days from Bhadohi.<br />
              • <strong>Made-to-Order Pieces:</strong> Require dedicated loom weaving and artisan washing (typically 4–6 weeks for tufted works and 7–10 weeks for intricate hand-knotted heirlooms).<br />
              • <strong>International Duties:</strong> While orders destined for the United States under $800 USD qualify for duty-free entry under Section 321 de minimis, orders shipping to the UK, EU, Canada, and other jurisdictions may incur local import VAT, tariffs, or clearance charges assessed by destination customs authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              4. Return Policy & Order Cancellations
            </h2>
            <p>
              Standard gallery catalog rugs carry a 14-day home trial period from the date of confirmed delivery. As detailed in our <Link to="/shipping-returns#refund" className="underline text-atelier-softblack hover:text-atelier-gold">Shipping & Returns policy</Link>, return courier logistics, insurance, and freight expenses are the sole responsibility of the buyer. Returned works must arrive at our Bhadohi studio in original, unblemished condition.
            </p>
            <p>
              <strong>Bespoke Exclusions:</strong> Made-to-order custom size creations and commissioned colorways are non-refundable once weaving has commenced.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              5. Intellectual Property & Studio Photography
            </h2>
            <p>
              All rug designs, photography, graphic representations, studio texts, brand marks, and technical weave specifications appearing on this website are the proprietary intellectual property of Prasri Rugs. Unauthorized reproduction, digital scraping, or commercial exploitation is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms and Conditions and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with this agreement shall be subject to the exclusive jurisdiction of the competent courts in Bhadohi / Varanasi, Uttar Pradesh, India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              7. Studio Contact
            </h2>
            <p>
              For legal inquiries, corporate purchase agreements, or trade terms:<br />
              <strong>Prasri Rugs Atelier</strong><br />
              G.T. Road, Gopiganj, Bhadohi, Uttar Pradesh 221303, India<br />
              Direct Email: <a href="mailto:prasrirugs@gmail.com" className="underline text-atelier-softblack">prasrirugs@gmail.com</a><br />
              WhatsApp Concierge: +91 98394 18038
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
