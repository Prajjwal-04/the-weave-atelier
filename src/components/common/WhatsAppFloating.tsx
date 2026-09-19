import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = '919450000000'; // Bhadohi Atelier Concierge
  const defaultMessage = encodeURIComponent(
    'Hello The Weave Atelier, I am interested in your handcrafted rugs and custom sizing options.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen && (
        <div className="mb-3 bg-atelier-ivory border border-atelier-parchment shadow-luxury p-4 rounded max-w-xs text-xs space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-atelier-parchment pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-serif font-medium text-sm text-atelier-softblack">
                Atelier Concierge
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-atelier-taupe hover:text-atelier-softblack p-0.5"
              aria-label="Close concierge preview"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-atelier-charcoal font-light leading-relaxed">
            Have a question regarding dimensions, custom weaving, or international delivery? Connect directly with our studio in Bhadohi.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-atelier-softblack text-atelier-parchment py-2 px-3 text-[11px] tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-atelier-softblack hover:bg-atelier-darkbrown text-atelier-parchment px-4 py-2.5 rounded-full shadow-luxury border border-atelier-charcoal transition-all hover:scale-105"
        aria-label="Contact atelier on WhatsApp"
      >
        <MessageCircle size={16} className="text-atelier-gold" />
        <span className="text-[11px] tracking-widest uppercase font-medium">
          Atelier Direct
        </span>
      </button>
    </div>
  );
};
