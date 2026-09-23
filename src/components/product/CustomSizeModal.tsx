import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, ShieldCheck } from 'lucide-react';
import { Product, Technique, Material, RugShape, CustomQuoteRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { quoteService } from '../../services/quoteService';
import { emailService } from '../../services/emailService';

interface CustomSizeModalProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomSizeModal: React.FC<CustomSizeModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addCustomQuote } = useAuth();
  const { formatPrice } = useCurrency();

  const [unit, setUnit] = useState<'feet' | 'cm'>('feet');
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(8);
  const [shape, setShape] = useState<RugShape>('Rectangular');
  const [technique, setTechnique] = useState<Technique>(product?.technique || 'Hand-Tufted');
  const [material, setMaterial] = useState<Material>(product?.material || 'Blended Wool');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [roomType, setRoomType] = useState('Living Room');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate estimated price based on square footage and technique
  const sqFeet = unit === 'feet' ? length * width : (length * width) / 929.03;
  let baseRatePerSqFt = 22; // default Hand-Tufted Blended Wool
  if (technique === 'Hand-Knotted') {
    baseRatePerSqFt = material === 'Wool & Botanical Silk' ? 45 : 34;
  } else if (technique === 'Flatweave') {
    baseRatePerSqFt = 16;
  } else if (material === 'New Zealand Wool & Viscose') {
    baseRatePerSqFt = 24;
  }

  const estimatedMin = Math.round(sqFeet * baseRatePerSqFt * 0.95);
  const estimatedMax = Math.round(sqFeet * baseRatePerSqFt * 1.15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      pileDepth: 'Standard Atelier Specification',
      colorPreference: product?.colors.join(', ') || 'Custom Atelier Palette',
      estimatedPriceUSD: { min: estimatedMin, max: estimatedMax },
      roomType,
      notes: notes ? `${notes} (Piece: ${product?.name || 'Bespoke Rug'})` : `Inquiry for ${product?.name || 'Bespoke Rug'}`,
      status: 'Received',
    };

    try {
      await quoteService.submitQuote(quoteData);
      addCustomQuote(quoteData);
      await emailService.sendCustomQuoteInquiry(quoteData);
    } catch (err) {
      console.error('Error submitting custom quote from modal:', err);
    }

    setSubmitted(true);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-atelier-softblack/75 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-atelier-ivory border border-atelier-parchment shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-atelier-charcoal hover:text-atelier-softblack p-1 transition-colors"
          aria-label="Close custom size modal"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center">
              <Check size={28} />
            </div>
            <h3 className="font-serif text-2xl text-atelier-softblack font-medium">
              Custom Specification Received
            </h3>
            <div className="inline-block bg-atelier-cream px-4 py-2 border border-atelier-parchment font-mono text-xs text-atelier-softblack">
              Reference: <span className="font-bold">{referenceCode}</span>
            </div>
            <p className="text-sm text-atelier-charcoal max-w-md mx-auto leading-relaxed">
              Thank you, {fullName || 'client'}. Our Bhadohi design atelier has received your requirements for the{' '}
              <span className="font-medium">{product?.name || 'custom rug'}</span>. A tailored digital rendering, loom schedule, and precise quotation will be sent to <span className="font-medium">{email}</span> within 24–48 hours.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
              >
                Return to Atelier
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-atelier-parchment pb-4 mb-6">
              <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-medium">
                Bespoke Atelier Service · Made to Order
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-medium mt-1">
                Request a Custom Size
              </h2>
              <p className="text-xs text-atelier-charcoal mt-1">
                {product ? `For ${product.name}.` : 'Handcrafted to your exact architectural dimensions.'} Every bespoke rug is made to order on our Bhadohi looms.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Unit & Dimensions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-medium text-atelier-softblack">
                    Dimensions
                  </label>
                  <div className="flex border border-atelier-parchment rounded text-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setUnit('feet')}
                      className={`px-3 py-1 ${
                        unit === 'feet' ? 'bg-atelier-softblack text-atelier-parchment' : 'bg-atelier-ivory text-atelier-charcoal'
                      }`}
                    >
                      Feet (ft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('cm')}
                      className={`px-3 py-1 ${
                        unit === 'cm' ? 'bg-atelier-softblack text-atelier-parchment' : 'bg-atelier-ivory text-atelier-charcoal'
                      }`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">
                      Length ({unit === 'feet' ? 'ft' : 'cm'})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="40"
                      required
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                      className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-sm text-atelier-softblack focus:outline-none focus:border-atelier-softblack"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">
                      Width ({unit === 'feet' ? 'ft' : 'cm'})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="30"
                      required
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-sm text-atelier-softblack focus:outline-none focus:border-atelier-softblack"
                    />
                  </div>
                </div>
              </div>

              {/* Shape & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1 uppercase tracking-wider">
                    Format / Shape
                  </label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as any)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  >
                    <option value="Rectangular">Rectangular</option>
                    <option value="Runner">Hallway Runner</option>
                    <option value="Round">Circular / Round</option>
                    <option value="Oval">Oval</option>
                    <option value="Custom">Organic Freeform</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1 uppercase tracking-wider">
                    Room Setting
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Bedroom">Primary Bedroom</option>
                    <option value="Entryway">Entryway / Hallway</option>
                    <option value="Office">Studio / Executive Office</option>
                  </select>
                </div>
              </div>

              {/* Technique & Material */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1 uppercase tracking-wider">
                    Weaving Technique
                  </label>
                  <select
                    value={technique}
                    onChange={(e) => setTechnique(e.target.value as any)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  >
                    <option value="Hand-Tufted">Hand-Tufted (Sculpted & Textured)</option>
                    <option value="Hand-Knotted">Hand-Knotted (Traditional Loom Heirloom)</option>
                    <option value="Flatweave">Flatweave (Reversible Dhurrie)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1 uppercase tracking-wider">
                    Material Preference
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as any)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  >
                    <option value="Blended Wool">Blended New Zealand & Indian Wool</option>
                    <option value="100% Pure Wool">100% Pure Highland Fleece</option>
                    <option value="Wool & Botanical Silk">Wool with Botanical Silk Highlights</option>
                    <option value="New Zealand Wool & Viscose">New Zealand Wool & Viscose</option>
                  </select>
                </div>
              </div>

              {/* Instant Price Range Estimate */}
              <div className="bg-atelier-cream p-4 border border-atelier-parchment space-y-1">
                <div className="flex items-center text-xs text-atelier-taupe font-medium">
                  <Calculator size={13} className="mr-1 text-atelier-agedgold" />
                  Estimated Range ({Math.round(sqFeet)} sq ft):
                </div>
                <div className="font-serif text-xl text-atelier-softblack font-medium">
                  {formatPrice(estimatedMin)} – {formatPrice(estimatedMax)}
                </div>
                <div className="text-[10px] text-atelier-taupe leading-relaxed">
                  *Please note: These figures are indicative estimates only. Actual rates may vary and will be confirmed in our direct reply after discussion with our design and weaving team.
                </div>
              </div>

              {/* Client Contact Info */}
              <div className="space-y-3 pt-2">
                <div className="text-xs uppercase tracking-wider font-medium text-atelier-softblack">
                  Your Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    placeholder="Phone Number (for WhatsApp coordination)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Country (e.g. United States, France)"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-atelier-cream border border-atelier-parchment px-3 py-2 text-xs text-atelier-softblack focus:outline-none"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Additional spatial notes, color adaptations, or architectural considerations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-atelier-cream border border-atelier-parchment p-3 text-xs text-atelier-softblack focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-atelier-softblack text-atelier-parchment py-3.5 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center"
                >
                  <ShieldCheck size={14} className="mr-2 text-atelier-gold" />
                  <span>Request Atelier Quotation</span>
                </button>
                <p className="text-[10px] text-atelier-taupe text-center mt-2">
                  No payment required today. You will receive an itemized proposal to review before any loom commitment.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
