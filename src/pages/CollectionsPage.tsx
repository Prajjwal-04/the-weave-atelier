import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { COLLECTIONS } from '../data/collections';
import { ProductCard } from '../components/product/ProductCard';
import { ArrowRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const CollectionsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products } = useInventory();

  // If slug is provided, show single collection
  if (slug) {
    const currentCollection = COLLECTIONS.find((c) => c.slug === slug) || COLLECTIONS[0];
    const collectionProducts = products.filter((p) => p.collectionSlug === currentCollection.slug);

    return (
      <div className="pt-20 sm:pt-24 pb-20 bg-atelier-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="text-[11px] text-atelier-taupe tracking-wider uppercase mb-8 flex items-center space-x-2">
            <Link to="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-black">Collections</Link>
            <span>/</span>
            <span className="text-atelier-softblack font-medium">{currentCollection.name}</span>
          </div>

          {/* Collection Hero */}
          <div className="relative aspect-[21/9] sm:aspect-[24/9] min-h-[300px] overflow-hidden bg-atelier-deepblack border border-atelier-parchment mb-12 flex items-end">
            <img
              src={currentCollection.heroImage}
              alt={currentCollection.name}
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-atelier-deepblack/80 via-atelier-deepblack/30 to-transparent" />
            <div className="relative z-10 p-6 sm:p-10 text-white max-w-2xl space-y-2">
              <span className="text-[10px] tracking-widest uppercase text-atelier-parchment/80 font-mono">
                {currentCollection.curatedTechniques.join(' · ')}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-light text-white">
                {currentCollection.name}
              </h1>
              <p className="text-xs sm:text-sm text-atelier-parchment/80 font-light leading-relaxed">
                {currentCollection.description}
              </p>
            </div>
          </div>

          {/* Products in Collection */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal">
              Collection <span className="italic font-normal text-atelier-agedgold">Works</span> ({collectionProducts.length})
            </h2>
            <Link to="/shop" className="text-xs text-atelier-taupe hover:text-black underline uppercase tracking-wider">
              View All Collections in Catalog
            </Link>
          </div>

          {collectionProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {collectionProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-atelier-taupe text-sm bg-atelier-cream border border-atelier-parchment">
              New pieces in this collection are currently on loom in Bhadohi.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, render full Collections Index
  return (
    <div className="pt-20 sm:pt-24 pb-20 bg-atelier-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-atelier-parchment pb-8 mb-12">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium mb-2 flex items-center space-x-2">
            <span className="text-atelier-agedgold">ANTHOLOGY</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">AESTHETIC DISCIPLINES</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
            Curated <span className="italic font-normal text-atelier-agedgold">Collections</span>
          </h1>
          <p className="text-xs sm:text-sm text-atelier-charcoal font-light mt-2 max-w-xl leading-relaxed">
            Each collection represents a focused exploration of texture, geometry, and Indian artisanal heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to={`/collections/${c.slug}`}
              className="group block bg-atelier-cream border border-atelier-parchment overflow-hidden hover:border-atelier-taupe transition-colors"
            >
              <div className="aspect-[16/10] overflow-hidden bg-atelier-parchment">
                <img
                  src={c.heroImage}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.95]"
                  loading="lazy"
                />
              </div>
              <div className="p-8 space-y-3">
                <div className="text-[10px] tracking-widest text-atelier-taupe uppercase font-mono">
                  {c.curatedTechniques.join(' · ')} · {products.filter((p) => p.collectionSlug === c.slug).length} Works
                </div>
                <h3 className="font-serif text-2xl text-atelier-softblack font-normal group-hover:text-atelier-darkbrown transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                  {c.description}
                </p>
                <div className="pt-2 flex items-center text-xs tracking-wider uppercase text-atelier-softblack font-medium group-hover:text-atelier-darkbrown">
                  <span>Explore Pieces</span>
                  <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
