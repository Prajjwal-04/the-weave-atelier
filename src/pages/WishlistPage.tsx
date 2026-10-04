import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useInventory } from '../context/InventoryContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/product/ProductCard';
import { SEO } from '../components/common/SEO';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, clearWishlist } = useWishlist();
  const { products } = useInventory();
  const { formatPrice } = useCurrency();

  const savedProducts = (products || []).filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen text-atelier-softblack">
      <SEO
        title="Saved Rugs & Wishlist"
        description="View and review your saved artisan rugs, hand-tufted wool pieces, and bespoke commissions at Prasri Rugs."
        canonicalPath="/wishlist"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium mb-2 flex items-center space-x-2">
              <span className="text-atelier-agedgold">CURATED SELECTION</span>
              <span className="text-atelier-taupe/40">·</span>
              <span className="text-atelier-taupe">YOUR ATELIER ARCHIVE</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-tight">
              Saved <span className="italic font-normal text-atelier-agedgold">Works</span>
            </h1>
            <p className="text-xs sm:text-sm text-atelier-charcoal font-light mt-2">
              {savedProducts.length} {savedProducts.length === 1 ? 'rug' : 'rugs'} saved for your space
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-atelier-taupe hover:text-red-700 underline self-start sm:self-auto flex items-center transition-colors"
            >
              <Trash2 size={13} className="mr-1.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-atelier-cream/50 border border-atelier-parchment max-w-2xl mx-auto p-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-atelier-parchment/60 flex items-center justify-center mx-auto text-atelier-taupe">
              <Heart size={24} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-atelier-softblack font-light">
                Your Saved Collection is Empty
              </h2>
              <p className="text-xs sm:text-sm text-atelier-charcoal font-light max-w-md mx-auto leading-relaxed">
                As you explore our handcrafted works, tap the heart icon on any rug to save it here for comparison and room planning.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium space-x-2"
              >
                <span>Explore The Shop</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
