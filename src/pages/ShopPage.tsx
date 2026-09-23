import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { COLLECTIONS } from '../data/collections';
import { Product, Technique, Material } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { CustomSizeModal } from '../components/product/CustomSizeModal';
import { useCurrency } from '../context/CurrencyContext';
import { useInventory } from '../context/InventoryContext';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  const { products } = useInventory();

  // Search parameter defaults
  const initialCollection = searchParams.get('collection') || 'all';
  const initialAvailability = searchParams.get('availability') || 'all';
  const searchQuery = searchParams.get('search') || '';

  // Filter States
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection);
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>(initialAvailability);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [customSizeProduct, setCustomSizeProduct] = useState<Product | null>(null);

  // Unique lists for filter options
  const techniques = ['all', 'Hand-Tufted', 'Hand-Knotted', 'Flatweave'];
  const materials = ['all', 'Blended Wool', '100% Pure Wool', 'Wool & Botanical Silk', 'New Zealand Wool & Viscose'];
  const colors = ['all', 'Warm Ivory', 'Parchment', 'Oatmeal', 'Cream', 'Muted Taupe', 'Charcoal', 'Muted Terracotta'];
  const sizes = ['all', "5' × 8'", "6' × 9'", "8' × 10'", "9' × 12'", "10' × 14'", "2.5' × 10'"];

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchCol = product.collection.toLowerCase().includes(q);
        const matchTech = product.technique.toLowerCase().includes(q);
        const matchMat = product.material.toLowerCase().includes(q);
        if (!matchName && !matchCol && !matchTech && !matchMat) return false;
      }

      // Collection
      if (selectedCollection !== 'all' && product.collectionSlug !== selectedCollection) {
        return false;
      }

      // Technique
      if (selectedTechnique !== 'all' && product.technique !== selectedTechnique) {
        return false;
      }

      // Material
      if (selectedMaterial !== 'all' && product.material !== selectedMaterial) {
        return false;
      }

      // Color
      if (selectedColor !== 'all' && !product.colors.some((c) => c.toLowerCase().includes(selectedColor.toLowerCase()))) {
        return false;
      }

      // Availability
      if (selectedAvailability === 'ready-to-ship' && !product.isReadyToShip) {
        return false;
      }
      if (selectedAvailability === 'made-to-order' && product.isReadyToShip) {
        return false;
      }

      // Size
      if (selectedSize !== 'all') {
        const cleanSelected = selectedSize.replace(/×/g, 'x').replace(/['"]/g, '').toLowerCase().trim();
        const matchesSize = product.variants.some((v) => {
          const cleanDim = (v.dimensionsFt || v.size || '').replace(/×/g, 'x').replace(/['"]/g, '').toLowerCase();
          return cleanDim.includes(cleanSelected);
        });
        if (!matchesSize) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.variants[0]?.priceUSD || 0;
      const priceB = b.variants[0]?.priceUSD || 0;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'best-selling') return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    searchQuery,
    selectedCollection,
    selectedTechnique,
    selectedMaterial,
    selectedColor,
    selectedSize,
    selectedAvailability,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCollection('all');
    setSelectedTechnique('all');
    setSelectedMaterial('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setSelectedAvailability('all');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCollection !== 'all' ||
    selectedTechnique !== 'all' ||
    selectedMaterial !== 'all' ||
    selectedColor !== 'all' ||
    selectedSize !== 'all' ||
    selectedAvailability !== 'all' ||
    !!searchQuery;

  return (
    <div className="pt-20 sm:pt-24 pb-20 bg-atelier-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-atelier-parchment pb-8 mb-8">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium mb-2 flex items-center space-x-2">
            <span className="text-atelier-agedgold">COMPLETE CATALOG</span>
            <span className="text-atelier-taupe/40">·</span>
            <span className="text-atelier-taupe">CATALOG & ARCHIVE</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
                Handmade <span className="italic font-normal text-atelier-agedgold">Rugs</span>
              </h1>
              <p className="text-xs sm:text-sm text-atelier-charcoal font-light mt-2 max-w-xl">
                Every piece is individually handcrafted in Bhadohi, India using pure and blended wools, traditional timber looms, and artisan hand-shearing.
              </p>
            </div>

            {/* Availability Tabs */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setSelectedAvailability('all')}
                className={`px-3 py-1.5 border transition-colors ${
                  selectedAvailability === 'all'
                    ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack'
                    : 'bg-atelier-cream border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe'
                }`}
              >
                All Works ({products.length})
              </button>
              <button
                onClick={() => setSelectedAvailability('ready-to-ship')}
                className={`px-3 py-1.5 border transition-colors ${
                  selectedAvailability === 'ready-to-ship'
                    ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack'
                    : 'bg-atelier-cream border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe'
                }`}
              >
                Ready to Ship
              </button>
              <button
                onClick={() => setSelectedAvailability('made-to-order')}
                className={`px-3 py-1.5 border transition-colors ${
                  selectedAvailability === 'made-to-order'
                    ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack'
                    : 'bg-atelier-cream border-atelier-parchment text-atelier-charcoal hover:border-atelier-taupe'
                }`}
              >
                Made to Order
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Sort Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-atelier-parchment/80 mb-8 text-xs">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center px-4 py-2 bg-atelier-cream border border-atelier-parchment text-atelier-charcoal"
          >
            <SlidersHorizontal size={14} className="mr-2" />
            <span>Filters ({hasActiveFilters ? 'Active' : 'All'})</span>
          </button>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            {/* Collection Filter */}
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="bg-atelier-cream border border-atelier-parchment text-xs text-atelier-charcoal py-2 px-3 focus:outline-none rounded"
            >
              <option value="all">All Collections</option>
              {COLLECTIONS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Technique Filter */}
            <select
              value={selectedTechnique}
              onChange={(e) => setSelectedTechnique(e.target.value)}
              className="bg-atelier-cream border border-atelier-parchment text-xs text-atelier-charcoal py-2 px-3 focus:outline-none rounded"
            >
              <option value="all">All Techniques</option>
              {techniques.filter((t) => t !== 'all').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Material Filter */}
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="bg-atelier-cream border border-atelier-parchment text-xs text-atelier-charcoal py-2 px-3 focus:outline-none rounded"
            >
              <option value="all">All Materials</option>
              {materials.filter((m) => m !== 'all').map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Size Filter */}
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-atelier-cream border border-atelier-parchment text-xs text-atelier-charcoal py-2 px-3 focus:outline-none rounded"
            >
              <option value="all">All Sizes</option>
              {sizes.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Clear All */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-atelier-taupe hover:text-atelier-softblack underline px-2 transition-colors flex items-center"
              >
                <X size={12} className="mr-1" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown & Product Counter */}
          <div className="flex items-center space-x-4 ml-auto">
            <span className="text-atelier-taupe text-[11px] font-mono">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Design' : 'Designs'}
            </span>

            <div className="flex items-center space-x-1.5">
              <span className="text-atelier-taupe text-[11px] uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-atelier-cream border border-atelier-parchment text-xs text-atelier-charcoal py-2 px-3 focus:outline-none rounded"
              >
                <option value="featured">Featured Atelier</option>
                <option value="newest">Newest Releases</option>
                <option value="best-selling">Best Selling</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[10px] tracking-wider uppercase text-atelier-taupe font-medium mr-1">
              Active:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center bg-atelier-cream border border-atelier-parchment px-2.5 py-1 text-xs text-atelier-charcoal rounded">
                Search: "{searchQuery}"
                <button onClick={() => setSearchParams({})} className="ml-1.5 hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedCollection !== 'all' && (
              <span className="inline-flex items-center bg-atelier-cream border border-atelier-parchment px-2.5 py-1 text-xs text-atelier-charcoal rounded">
                Collection: {COLLECTIONS.find((c) => c.slug === selectedCollection)?.name}
                <button onClick={() => setSelectedCollection('all')} className="ml-1.5 hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedTechnique !== 'all' && (
              <span className="inline-flex items-center bg-atelier-cream border border-atelier-parchment px-2.5 py-1 text-xs text-atelier-charcoal rounded">
                Technique: {selectedTechnique}
                <button onClick={() => setSelectedTechnique('all')} className="ml-1.5 hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedMaterial !== 'all' && (
              <span className="inline-flex items-center bg-atelier-cream border border-atelier-parchment px-2.5 py-1 text-xs text-atelier-charcoal rounded">
                Material: {selectedMaterial}
                <button onClick={() => setSelectedMaterial('all')} className="ml-1.5 hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedSize !== 'all' && (
              <span className="inline-flex items-center bg-atelier-cream border border-atelier-parchment px-2.5 py-1 text-xs text-atelier-charcoal rounded">
                Size: {selectedSize}
                <button onClick={() => setSelectedSize('all')} className="ml-1.5 hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-atelier-cream/50 border border-atelier-parchment">
            <h3 className="font-serif text-2xl text-atelier-softblack">No rugs match your selection</h3>
            <p className="text-xs text-atelier-charcoal max-w-sm mx-auto font-light">
              Try adjusting your filter criteria or request a bespoke rug tailored to your exact palette and dimensions.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Bespoke Size Callout Box */}
        <div className="mt-20 p-8 sm:p-12 bg-atelier-cream border border-atelier-parchment flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="text-[10px] tracking-widest uppercase text-atelier-taupe font-medium">
              Architectural Bespoke Atelier
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal">
              Looking for a specific dimension or custom colorway?
            </h3>
            <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
              Every rug in our catalog can be handcrafted to order in custom sizes, shapes, or materials with complimentary digital renderings before loom setup.
            </p>
          </div>

          <button
            onClick={() => setCustomSizeProduct(products[0] || null)}
            className="px-8 py-3.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium whitespace-nowrap"
          >
            Request Custom Size
          </button>
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
    </div>
  );
};
