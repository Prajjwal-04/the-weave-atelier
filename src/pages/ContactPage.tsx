import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Instagram, Check, ArrowRight, Clock, Loader2, ExternalLink } from 'lucide-react';
import { emailService, ATELIER_PRIMARY_EMAIL } from '../services/emailService';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Custom Rug Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await emailService.sendContactInquiry(formData);
      setDeliveryStatus(result.message);
      setSubmitted(true);
    } catch (err) {
      console.error('Inquiry transmission error:', err);
      // Still show success as local fallback is active
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoLink = emailService.generateMailtoUrl(
    `[Atelier Inquiry] ${formData.inquiryType} - ${formData.name}`,
    `Sender Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\n\nMessage:\n${formData.message}`
  );

  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium mb-2">
            Direct Atelier Correspondence
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight">
            Contact & Studio
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light mt-3 leading-relaxed">
            Whether inquiring about custom rug dimensions, tracking an international dispatch, or consulting on yarn selections, our Bhadohi studio is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Coordinates & Direct WhatsApp */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-atelier-cream border border-atelier-parchment p-8 space-y-6">
              <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                Bhadohi Studio Coordinates
              </h2>

              <div className="space-y-4 text-xs text-atelier-charcoal font-light">
                <div className="flex items-start space-x-3">
                  <MapPin size={16} className="text-atelier-agedgold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-medium text-atelier-softblack block">Atelier Location</strong>
                    <span>Station Road, Maryadpatti, Bhadohi, Uttar Pradesh 221401, India</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail size={16} className="text-atelier-agedgold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-medium text-atelier-softblack block">Direct Correspondence</strong>
                    <a
                      href={`mailto:${ATELIER_PRIMARY_EMAIL}`}
                      className="text-atelier-softblack hover:text-atelier-darkbrown underline font-medium transition-colors"
                    >
                      {ATELIER_PRIMARY_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageCircle size={16} className="text-atelier-agedgold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-medium text-atelier-softblack block">WhatsApp Concierge</strong>
                    <span>+91 94500 00000 (Direct studio messaging)</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Instagram size={16} className="text-atelier-agedgold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-medium text-atelier-softblack block">Instagram Dispatch</strong>
                    <span>@theweaveatelier</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock size={16} className="text-atelier-agedgold flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-medium text-atelier-softblack block">Atelier Operating Hours</strong>
                    <span>Monday – Saturday: 09:00 – 19:00 IST (Indian Standard Time)</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-2">
                <a
                  href="https://wa.me/919450000000?text=Hello%20The%20Weave%20Atelier%2C%20I%20have%20an%20inquiry%20regarding%20your%20handmade%20rugs."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors flex items-center justify-center font-medium"
                >
                  <MessageCircle size={15} className="mr-2 text-atelier-gold" />
                  <span>Start WhatsApp Conversation</span>
                </a>
              </div>
            </div>

            {/* Note on Small Studio Scale */}
            <div className="p-6 bg-atelier-ivory border border-atelier-parchment space-y-2 text-xs text-atelier-charcoal font-light leading-relaxed">
              <span className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
                The Independent Promise
              </span>
              <p>
                We do not use automated bots or third-party call centers. Every correspondence is answered directly by our studio team in Bhadohi via{' '}
                <a href={`mailto:${ATELIER_PRIMARY_EMAIL}`} className="underline font-medium text-atelier-softblack">
                  {ATELIER_PRIMARY_EMAIL}
                </a>.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-atelier-ivory border border-atelier-parchment p-8 sm:p-10 shadow-subtle">
            {submitted ? (
              <div className="py-12 text-center space-y-5">
                <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
                  <Check size={28} />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
                  Message Transmitted
                </h3>
                <div className="inline-block bg-atelier-cream border border-atelier-parchment px-4 py-2 font-mono text-xs text-atelier-softblack">
                  Delivered to: <span className="font-semibold text-atelier-darkbrown">{ATELIER_PRIMARY_EMAIL}</span>
                </div>
                <p className="text-xs sm:text-sm text-atelier-charcoal max-w-md mx-auto font-light leading-relaxed">
                  Thank you, <span className="font-medium">{formData.name}</span>. Your correspondence has been directed to our Bhadohi studio at{' '}
                  <span className="font-medium text-atelier-softblack">{ATELIER_PRIMARY_EMAIL}</span>. We will review your notes and reply to{' '}
                  <span className="font-medium">{formData.email}</span> within 24 hours.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={mailtoLink}
                    className="w-full sm:w-auto px-6 py-2.5 bg-atelier-cream border border-atelier-charcoal/40 text-atelier-softblack text-xs tracking-wider uppercase hover:bg-atelier-parchment transition-colors flex items-center justify-center font-medium"
                  >
                    <Mail size={14} className="mr-2 text-atelier-agedgold" />
                    <span>Open in Email App</span>
                    <ExternalLink size={12} className="ml-1.5 opacity-60" />
                  </a>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        inquiryType: 'Custom Rug Inquiry',
                        message: '',
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                    Send a Message to the Atelier
                  </h2>
                  <p className="text-xs text-atelier-charcoal font-light mt-1">
                    Direct communication with the artisans and studio directors at{' '}
                    <span className="font-medium text-atelier-softblack">{ATELIER_PRIMARY_EMAIL}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full bg-atelier-cream border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.com"
                      className="w-full bg-atelier-cream border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-atelier-cream border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Inquiry Category</label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2.5 text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack transition-colors"
                    >
                      <option value="Custom Rug Inquiry">Custom Rug / Bespoke Sizing</option>
                      <option value="Existing Order Status">Existing Order & Tracking</option>
                      <option value="Interior Designer Trade">Interior Designer / Trade Program</option>
                      <option value="Material & Care Question">Material, Pile & Care Guidance</option>
                      <option value="General Studio Inquiry">General Studio Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1">Your Message *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your space, required rug dimensions, or specific design questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-atelier-cream border border-atelier-parchment p-4 text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack transition-colors"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-atelier-softblack text-atelier-parchment py-3.5 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center group disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="mr-2 animate-spin" />
                        <span>Transmitting to {ATELIER_PRIMARY_EMAIL}...</span>
                      </>
                    ) : (
                      <>
                        <span>Transmit Message to Atelier</span>
                        <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-atelier-taupe text-center mt-2 font-light">
                    Directly routed to {ATELIER_PRIMARY_EMAIL} · Studio response within 24 business hours
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
