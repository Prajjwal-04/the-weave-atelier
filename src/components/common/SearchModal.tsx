import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useInventory } from '../../context/InventoryContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();
  const { products } = useInventory();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredProducts = trimmed
    ? (products || []).filter((p) => {
        return (
          p.name.toLowerCase().includes(trimmed) ||
          p.collection.toLowerCase().includes(trimmed) ||
          p.technique.toLowerCase().includes(trimmed) ||
          p.material.toLowerCase().includes(trimmed) ||
          p.colors.some((c) => c.toLowerCase().includes(trimmed)) ||
          p.description.toLowerCase().includes(trimmed)
        );
      })
    : [];

  const suggestedQueries = [
    'Hand-Tufted',
    'Hand-Knotted',
    'Quiet Neutrals',
    'Blended Wool',
    'Terralis',
    'Arbor Flow',
    'Flatweave',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-atelier-softblack/70 backdrop-blur-sm flex justify-center items-start pt-16 sm:pt-24 px-4 animate-fadeIn">
      <div className="bg-atelier-ivory w-full max-w-3xl border border-atelier-parchment shadow-2xl p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-atelier-charcoal hover:text-atelier-softblack p-1 transition-colors"
          aria-label="Close search"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Input */}
        <div className="flex items-center border-b border-atelier-parchment pb-4 pt-2">
          <Search size={22} className="text-atelier-taupe mr-3" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by rug name, collection, technique, material, or color..."
            className="w-full bg-transparent font-serif text-lg sm:text-2xl text-atelier-softblack placeholder:text-atelier-taupe/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-atelier-taupe hover:text-atelier-charcoal px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestions */}
        {!trimmed && (
          <div className="pt-6">
            <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-medium mb-3">
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="text-xs px-3 py-1.5 bg-atelier-cream border border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {trimmed && (
          <div className="pt-6">
            <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-medium mb-4 flex justify-between">
              <span>Results ({filteredProducts.length})</span>
              {filteredProducts.length > 0 && (
                <Link
                  to={`/shop?search=${encodeURIComponent(trimmed)}`}
                  onClick={onClose}
                  className="hover:underline flex items-center text-atelier-charcoal"
                >
                  <span>View in Catalog</span>
                  <ArrowRight size={11} className="ml-1" />
                </Link>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-atelier-taupe text-sm">
                No pieces found matching "{query}". Try searching by technique (e.g. Hand-Knotted) or collection (e.g. Modern Forms).
              </div>
            ) : (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                {filteredProducts.map((product) => {
                  const startingPrice = product.variants[0]?.priceUSD || 0;
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center space-x-4 p-2 hover:bg-atelier-cream/80 transition-colors group"
                    >
                      <img
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="w-16 h-20 object-cover border border-atelier-parchment"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-atelier-taupe uppercase tracking-wider">
                          {product.collection} · {product.technique}
                        </div>
                        <h4 className="font-serif text-base text-atelier-softblack font-medium group-hover:text-atelier-darkbrown truncate">
                          {product.name}
                        </h4>
                        <div className="text-xs text-atelier-charcoal mt-0.5">
                          {product.material}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-atelier-taupe font-mono">
                          From {formatPrice(startingPrice)}
                        </div>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 mt-1 inline-block ${
                            product.isReadyToShip
                              ? 'bg-atelier-beige/60 text-atelier-darkbrown'
                              : 'bg-atelier-parchment text-atelier-taupe'
                          }`}
                        >
                          {product.isReadyToShip ? 'Ready to Ship' : 'Made to Order'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
