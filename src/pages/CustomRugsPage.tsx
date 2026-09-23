import React, { useState } from 'react';
import { Ruler, ShieldCheck, CheckCircle2, Calculator, Check, ArrowRight, Loader2, Mail } from 'lucide-react';
import { Technique, Material, RugShape, CustomQuoteRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { emailService, ATELIER_PRIMARY_EMAIL } from '../services/emailService';
import { quoteService } from '../services/quoteService';

export const CustomRugsPage: React.FC = () => {
  const { addCustomQuote } = useAuth();
  const { formatPrice } = useCurrency();

  // Form State
  const [unit, setUnit] = useState<'feet' | 'cm'>('feet');
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(8);
  const [shape, setShape] = useState<RugShape>('Rectangular');
  const [technique, setTechnique] = useState<Technique>('Hand-Tufted');
  const [material, setMaterial] = useState<Material>('Blended Wool');
  const [pileDepth, setPileDepth] = useState<string>('Medium Pile (12mm)');
  const [roomType, setRoomType] = useState<string>('Living Room');
  const [colorNotes, setColorNotes] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [country, setCountry] = useState<string>('United States');
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [referenceCode, setReferenceCode] = useState<string>('');

  // Estimate
  const sqFeet = unit === 'feet' ? length * width : (length * width) / 929.03;
  let baseRate = 22;
  if (technique === 'Hand-Knotted') {
    baseRate = material === 'Wool & Botanical Silk' ? 45 : 34;
  } else if (technique === 'Flatweave') {
    baseRate = 16;
  } else if (material === 'New Zealand Wool & Viscose') {
    baseRate = 24;
  }

  const estMin = Math.round(sqFeet * baseRate * 0.95);
  const estMax = Math.round(sqFeet * baseRate * 1.15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ref = `TWA-CUS-${Math.floor(1000 + Math.random() * 9000)}`;
    setReferenceCode(ref);

    const quoteData: CustomQuoteRequest = {
      id: `quote-${Date.now()}`,
      referenceNumber: ref,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fullName,
      email,
      phone,
      country,
      shape,
      length,
      width,
      unit,
      technique,
      material,
      pileDepth,
      colorPreference: colorNotes || 'Custom Atelier Palette',
      estimatedPriceUSD: { min: estMin, max: estMax },
      roomType,
      notes,
      status: 'Received',
    };

    try {
      await quoteService.submitQuote(quoteData);
      addCustomQuote(quoteData);
      await emailService.sendCustomQuoteInquiry(quoteData);
    } catch (err) {
      console.error('Error submitting custom rug quote:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const steps = [
    { num: '01', title: 'Share your requirements', desc: 'Dimensions, floor plan, shape, and room setting.' },
    { num: '02', title: 'Discuss size, material and design', desc: 'Direct dialogue with our Bhadohi design team.' },
    { num: '03', title: 'Receive quotation', desc: 'Transparent pricing, production timetable, and CAD rendering.' },
    { num: '04', title: 'Approve the details', desc: 'Sign off on yarn color swatches and loom schedule.' },
    { num: '05', title: 'Rug enters production', desc: 'Hand-knotted or hand-tufted knot-by-knot in Bhadohi.' },
    { num: '06', title: 'Final inspection', desc: 'Meticulous gentle washing, natural sun curing, and hand-pile shearing.' },
    { num: '07', title: 'International delivery', desc: 'Insured air courier dispatch directly to your doorstep.' },
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium">
            Bespoke Atelier Service
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight">
            Made for your space.
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light leading-relaxed">
            When standard dimensions cannot frame your room, we build one-of-a-kind rugs to your exact architectural specifications. Direct from the looms of Bhadohi, India.
          </p>
        </div>

        {/* 7-Step Process Diagram */}
        <div className="mb-20 bg-atelier-cream border border-atelier-parchment p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-[10px] tracking-widest uppercase text-atelier-taupe font-mono">
              The Atelier Process
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
              From Inquiry to Floor in Seven Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="space-y-2 relative">
                <div className="font-mono text-xs text-atelier-agedgold font-bold">
                  {s.num}
                </div>
                <h3 className="font-serif text-base text-atelier-softblack font-medium leading-snug">
                  {s.title}
                </h3>
                <p className="text-[11px] text-atelier-charcoal font-light leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Interactive Studio Calculator & Quote Form */}
        <div id="custom-form" className="max-w-4xl mx-auto bg-atelier-cream/60 border border-atelier-parchment p-8 sm:p-12 shadow-luxury">
          {submitted ? (
            <div className="text-center py-12 space-y-5">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
                <Check size={32} />
              </div>
              <h2 className="font-serif text-3xl text-atelier-softblack font-normal">
                Bespoke Inquiry Dispatched
              </h2>
              <div className="inline-flex items-center space-x-2 bg-atelier-ivory px-5 py-2.5 border border-atelier-parchment font-mono text-xs sm:text-sm text-atelier-softblack font-medium">
                <span>Inquiry Reference:</span>
                <span className="text-atelier-darkbrown font-bold">{referenceCode}</span>
              </div>
              <div className="text-xs text-atelier-taupe font-mono">
                Routed directly to: <strong className="text-atelier-softblack">{ATELIER_PRIMARY_EMAIL}</strong>
              </div>
              <p className="text-sm text-atelier-charcoal max-w-lg mx-auto font-light leading-relaxed">
                Thank you, <span className="font-medium text-atelier-softblack">{fullName}</span>. Our senior Bhadohi rug designers have received your custom specifications for your estimated {Math.round(sqFeet)} sq ft piece. You will receive an itemized proposal, digital rendering, and yarn color swatches at <span className="font-medium text-atelier-softblack">{email}</span> within 24–48 hours.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={emailService.generateMailtoUrl(
                    `[Custom Rug Reference: ${referenceCode}] Inquiry by ${fullName}`,
                    `Hello PraSri Rugs Atelier,\n\nI have submitted custom rug inquiry ${referenceCode} for ${length}x${width} ${unit} (${technique}, ${material}).\n\nClient: ${fullName}\nPhone: ${phone || 'N/A'}\nEmail: ${email}`
                  )}
                  className="px-6 py-3 bg-atelier-cream border border-atelier-charcoal/40 text-atelier-softblack text-xs tracking-wider uppercase hover:bg-atelier-parchment transition-colors flex items-center justify-center font-medium"
                >
                  <Mail size={14} className="mr-2 text-atelier-agedgold" />
                  <span>Email Atelier With Ref #{referenceCode}</span>
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium"
                >
                  Configure Another Custom Rug
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="border-b border-atelier-parchment pb-4">
                <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
                  Configure Your Bespoke Rug
                </h2>
                <p className="text-xs text-atelier-charcoal font-light mt-1">
                  Adjust dimensions, construction, and materials to preview preliminary atelier pricing.
                </p>
              </div>

              {/* 1. Dimensions & Unit */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-medium text-atelier-softblack">
                    1. Room Dimensions
                  </span>
                  <div className="flex border border-atelier-parchment rounded text-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setUnit('feet')}
                      className={`px-3 py-1 ${unit === 'feet' ? 'bg-atelier-softblack text-white' : 'bg-atelier-ivory text-atelier-charcoal'}`}
                    >
                      Feet (ft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('cm')}
                      className={`px-3 py-1 ${unit === 'cm' ? 'bg-atelier-softblack text-white' : 'bg-atelier-ivory text-atelier-charcoal'}`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-atelier-taupe block mb-1">
                      Length ({unit})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="3"
                      max="50"
                      required
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-sm text-atelier-softblack focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-atelier-taupe block mb-1">
                      Width ({unit})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="35"
                      required
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-sm text-atelier-softblack focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shape, Room & Pile */}
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider font-medium text-atelier-softblack block">
                  2. Shape & Spatial Application
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-atelier-taupe block mb-1">Shape</label>
                    <select
                      value={shape}
                      onChange={(e) => setShape(e.target.value as any)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-3 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    >
                      <option value="Rectangular">Rectangular</option>
                      <option value="Runner">Hallway Runner</option>
                      <option value="Round">Round / Circular</option>
                      <option value="Oval">Oval</option>
                      <option value="Custom">Organic Freeform</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-atelier-taupe block mb-1">Room Placement</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-3 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Dining Room">Dining Room</option>
                      <option value="Bedroom">Primary Bedroom</option>
                      <option value="Entryway">Entryway / Foyer</option>
                      <option value="Executive Office">Executive Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-atelier-taupe block mb-1">Pile Depth Profile</label>
                    <select
                      value={pileDepth}
                      onChange={(e) => setPileDepth(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-3 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    >
                      <option value="Low Pile (8mm)">Low Profile (8mm)</option>
                      <option value="Medium Pile (12mm)">Medium Plush (12mm)</option>
                      <option value="High Pile (16mm)">Plush High Pile (16mm)</option>
                      <option value="Carved High-Low">High-Low Carved Relief</option>
                      <option value="Zero Pile Flatweave">Zero-Pile Flatweave</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Technique & Material Selection */}
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider font-medium text-atelier-softblack block">
                  3. Technique & Fiber Composition
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-atelier-taupe block mb-1">Loom Technique</label>
                    <select
                      value={technique}
                      onChange={(e) => setTechnique(e.target.value as any)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-3 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    >
                      <option value="Hand-Tufted">Hand-Tufted (Rich relief & modern shapes)</option>
                      <option value="Hand-Knotted">Hand-Knotted (Generational heirloom loom-weave)</option>
                      <option value="Flatweave">Flatweave (Reversible pit-loom dhurrie)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-atelier-taupe block mb-1">Material Blend</label>
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value as any)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-3 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    >
                      <option value="Blended Wool">New Zealand & Indian Blended Wool</option>
                      <option value="100% Pure Wool">100% Pure Highland Virgin Fleece</option>
                      <option value="Wool & Botanical Silk">Wool with Botanical Silk Highlights</option>
                      <option value="New Zealand Wool & Viscose">New Zealand Wool & Botanical Viscose</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Quotation Calculator Box */}
              <div className="p-6 bg-atelier-ivory border border-atelier-parchment space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-atelier-taupe flex items-center font-medium">
                    <Calculator size={14} className="mr-1.5 text-atelier-agedgold" />
                    Preliminary Atelier Estimate ({Math.round(sqFeet)} sq. ft.)
                  </span>
                  <span className="font-mono text-[11px] text-atelier-taupe">
                    Timeline: {technique === 'Hand-Knotted' ? '7–10 weeks' : '4–6 weeks'}
                  </span>
                </div>
                <div className="font-serif text-3xl text-atelier-softblack font-medium">
                  {formatPrice(estMin)} – {formatPrice(estMax)}
                </div>
                <div className="text-[11px] text-atelier-taupe font-light leading-relaxed">
                  *Please note: These figures are preliminary estimates only. Actual rates may vary depending on design intricacies, fiber blends, and loom specifications, and will be confirmed in our direct reply after discussion with our design and weaving team.
                </div>
              </div>

              {/* 4. Client Information */}
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider font-medium text-atelier-softblack block">
                  4. Contact & Project Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone / WhatsApp (for loom updates)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Delivery Destination (e.g. USA, UK, Germany) *"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Color preferences or palette requirements (e.g., Warm Ivory, Terracotta accent, Soft Slate)..."
                  value={colorNotes}
                  onChange={(e) => setColorNotes(e.target.value)}
                  className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                />
                <textarea
                  rows={3}
                  placeholder="Additional architectural notes, door clearances, or specific design intent..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-atelier-ivory border border-atelier-parchment p-4 text-xs text-atelier-softblack focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-atelier-softblack text-atelier-parchment py-4 px-8 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center group disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin text-atelier-gold" />
                      <span>Transmitting Custom Specs to {ATELIER_PRIMARY_EMAIL}...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} className="mr-2 text-atelier-gold" />
                      <span>Start a Custom Request</span>
                      <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <div className="text-[11px] text-atelier-taupe text-center">
                  Specs are routed directly to {ATELIER_PRIMARY_EMAIL}. No payment is taken at this stage.
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
