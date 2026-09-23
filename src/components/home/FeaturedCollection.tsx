import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { QuickViewModal } from '../product/QuickViewModal';
import { CustomSizeModal } from '../product/CustomSizeModal';
import { useInventory } from '../../context/InventoryContext';

interface FeaturedCollectionProps {
  products: Product[];
}

/* Animated skeleton card — reserves exact same height as a real ProductCard */
const SkeletonCard: React.FC = () => (
  <div className="flex flex-col animate-pulse">
    {/* Image placeholder — matches aspect-[4/5] used by ProductCard */}
    <div className="relative w-full aspect-[4/5] bg-atelier-parchment/60 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
    </div>
    {/* Info placeholder */}
    <div className="pt-4 pb-2 space-y-2">
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-atelier-parchment/70 rounded" />
        <div className="h-3 w-16 bg-atelier-parchment/70 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-atelier-parchment/80 rounded" />
      <div className="h-3 w-1/2 bg-atelier-parchment/60 rounded" />
    </div>
  </div>
);

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [customSizeProduct, setCustomSizeProduct] = useState<Product | null>(null);
  const { isLoading } = useInventory();

  const featuredRugs = React.useMemo(() => {
    const featuredOnly = (products || []).filter((p) => p.featured);
    if (featuredOnly.length >= 4) {
      return featuredOnly.slice(0, 4);
    }
    const otherProducts = (products || []).filter((p) => !p.featured);
    return [...featuredOnly, ...otherProducts].slice(0, 4);
  }, [products]);

  return (
    <section className="py-20 sm:py-28 bg-atelier-cream/40 border-b border-atelier-parchment/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 space-y-4 md:space-y-0">
          <div className="space-y-2">
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
              <span className="text-atelier-agedgold">LIMITED WEAVES</span>
              <span className="text-atelier-taupe/40">·</span>
              <span className="text-atelier-taupe">CURATED RELEASES</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal tracking-tight">
              Featured <span className="italic font-normal text-atelier-agedgold">Pieces</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center text-xs tracking-widest text-atelier-charcoal hover:text-atelier-softblack uppercase font-medium border-b border-atelier-taupe/40 pb-0.5 group transition-colors"
          >
            <span>Explore All Atelier Works</span>
            <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Large Editorial Cards Grid — skeletons while loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : featuredRugs.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onRequestCustomSize={(p) => {
          setQuickViewProduct(null);
          setCustomSizeProduct(p);
        }}
      />

      {/* Custom Size Modal */}
      <CustomSizeModal
        product={customSizeProduct || undefined}
        isOpen={!!customSizeProduct}
        onClose={() => setCustomSizeProduct(null)}
      />
    </section>
  );
};
