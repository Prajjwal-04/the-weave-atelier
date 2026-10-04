import React from 'react';
import { Lock, Shield, Eye } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen text-atelier-softblack">
      <SEO
        title="Privacy Policy"
        description="Understand how Prasri Rugs collects, protects, and handles personal information, payment processing data, and bespoke sizing requests."
        canonicalPath="/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium mb-2 flex items-center space-x-2">
            <span className="text-atelier-agedgold">DATA PRIVACY</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">TRANSPARENCY & INTEGRITY</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tight">
            Privacy <span className="italic font-normal text-atelier-agedgold">Policy</span>
          </h1>
          <p className="text-sm text-atelier-charcoal font-light mt-3 leading-relaxed">
            Effective Date: October 2026 · Prasri Rugs, Bhadohi, India
          </p>
        </div>

        {/* Highlight Card */}
        <div className="p-6 sm:p-8 bg-atelier-cream border border-atelier-parchment space-y-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-atelier-darkbrown uppercase tracking-wider">
            <Shield size={16} className="text-atelier-gold flex-shrink-0" />
            <span>Our Privacy Commitment</span>
          </div>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
            Prasri Rugs is committed to honoring your privacy. We collect only the information necessary to handcraft, dispatch, and track your artisan rugs, communicate bespoke specifications, and provide attentive concierge support. We never sell or rent your personal data.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              1. Information We Collect
            </h2>
            <p>
              When you browse our online gallery, submit bespoke sizing requests, or place orders, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Contact Information:</strong> Your full name, delivery address, phone number, and email address.</li>
              <li><strong>Custom Sizing & Project Specs:</strong> Architectural room dimensions, color preferences, and studio correspondence.</li>
              <li><strong>Order History & Logistics:</strong> Invoices, transaction identifiers, and door-to-door courier tracking records.</li>
              <li><strong>Technical Data:</strong> Anonymized browser information, IP address, and cookie sessions necessary for cart persistence and regional currency display.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              2. Secure Payment Processing
            </h2>
            <p>
              Prasri Rugs does not store, process, or retain complete credit card or debit card numbers on our servers. All financial transactions are encrypted and processed through certified PCI-DSS compliant payment gateways (such as Razorpay and international banking networks) using 256-bit SSL encryption.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              3. How We Use Your Information
            </h2>
            <p>
              The data you provide is used solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Fulfill orders, coordinate loom production, and arrange insured international air delivery.</li>
              <li>Transmit order confirmations, shipment tracking updates, and custom quote documentation.</li>
              <li>Respond directly to customer service inquiries via email or WhatsApp Concierge.</li>
              <li>Send occasional studio newsletters (The Atelier Letter) if you have explicitly subscribed. You may unsubscribe at any time with a single click.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              4. Third-Party Disclosures & International Freight
            </h2>
            <p>
              We share minimal necessary contact information with trusted logistics partners (such as express international air carriers and customs brokers) strictly to execute doorstep delivery and customs declarations. We never sell, lease, or monetize customer data to advertising brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              5. Cookies & Local Storage
            </h2>
            <p>
              Our website uses essential local browser storage and session cookies to preserve your selected currency (INR, USD, EUR, etc.), shopping bag contents, and saved wishlist items. You may adjust your browser settings to decline cookies, although doing so may impair shopping bag persistence.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              6. Your Rights & Data Access
            </h2>
            <p>
              Regardless of your location, you have the right to request access to the personal data we hold about you, request corrections, or request deletion of your atelier account and correspondence history. To exercise these rights, please email us directly at <a href="mailto:prasrirugs@gmail.com" className="underline text-atelier-softblack">prasrirugs@gmail.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              7. Inquiries & Atelier Contact
            </h2>
            <p>
              For questions regarding our privacy practices:<br />
              <strong>Prasri Rugs Atelier</strong><br />
              G.T. Road, Gopiganj, Bhadohi, Uttar Pradesh 221303, India<br />
              Email: <a href="mailto:prasrirugs@gmail.com" className="underline text-atelier-softblack">prasrirugs@gmail.com</a><br />
              Phone / WhatsApp: +91 98394 18038
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
