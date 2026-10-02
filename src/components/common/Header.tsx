import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Globe,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Layers,
  Compass,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency, CURRENCY_RATES } from '../../context/CurrencyContext';
import { Currency } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [collectionsHovered, setCollectionsHovered] = useState(false);
  const [studioHovered, setStudioHovered] = useState(false);

  const currencyRef = useRef<HTMLDivElement>(null);
  const collectionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const studioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { toggleCart, totalItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { currency, setCurrency, rates } = useCurrency();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCollectionsOpen(false);
    setCollectionsHovered(false);
    setStudioHovered(false);
    setCurrencyDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener for currency dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCollectionsEnter = () => {
    if (collectionsTimeoutRef.current) clearTimeout(collectionsTimeoutRef.current);
    setCollectionsHovered(true);
  };

  const handleCollectionsLeave = () => {
    collectionsTimeoutRef.current = setTimeout(() => {
      setCollectionsHovered(false);
    }, 140);
  };

  const handleStudioEnter = () => {
    if (studioTimeoutRef.current) clearTimeout(studioTimeoutRef.current);
    setStudioHovered(true);
  };

  const handleStudioLeave = () => {
    studioTimeoutRef.current = setTimeout(() => {
      setStudioHovered(false);
    }, 140);
  };

  const collections = [
    {
      name: 'Modern Forms',
      path: '/collections/modern-forms',
      tagline: 'Architectural geometries & organic contours',
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Quiet Neutrals',
      path: '/collections/quiet-neutrals',
      tagline: 'Soft, restrained earth tones for serene spaces',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Botanical Studies',
      path: '/collections/botanical-studies',
      tagline: 'Abstracted flora & nature-dyed pigments',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Texture & Sculpture',
      path: '/collections/texture-sculpture',
      tagline: 'High-low carved pile and variable reliefs',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Heritage Reimagined',
      path: '/collections/heritage-reimagined',
      tagline: 'Centuries of Indian weaving reimagined',
      image: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Hand-Knotted Archive',
      path: '/collections/hand-knotted-collection',
      tagline: 'Generational heirloom master craft',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const studioLinks = [
    { title: 'The Atelier', path: '/the-atelier', desc: 'Our story, heritage, and Bhadohi coordinates' },
    { title: 'The Craft', path: '/craft', desc: 'Step-by-step hand-tufting and knotting traditions' },
    { title: 'Journal & Stories', path: '/journal', desc: 'Design philosophy, architecture & styling' },
    { title: 'Size & Styling Guide', path: '/size-guide', desc: 'Room layout proportions and dimensioning' },
    { title: 'Rug Care Guide', path: '/rug-care', desc: 'Preserving wool pile, cleaning and storage' },
  ];

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isTransparent
            ? 'bg-gradient-to-b from-black/85 via-black/45 to-transparent border-b border-white/15 py-4 sm:py-5'
            : isScrolled
            ? 'bg-[#FAF8F5] border-b border-[#E6E1D8] shadow-[0_4px_20px_rgba(26,25,24,0.06)] py-3 sm:py-3.5'
            : 'bg-[#FAF8F5] border-b border-[#E6E1D8] shadow-xs py-4 sm:py-4.5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
          {/* 3-Column Balanced Luxury Grid - Symmetrically Distributed */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 sm:h-16 gap-1 sm:gap-4">
            
            {/* COLUMN 1 (LEFT): Curated Desktop Navigation Links Shifted Left & Mobile Toggle */}
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 lg:-ml-2 xl:-ml-4">
              {/* Mobile Menu Button - Shown on all screens < lg (mobile & tablets) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-full transition-colors flex-shrink-0 ${
                  isTransparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-atelier-softblack hover:bg-atelier-cream'
                }`}
                aria-label="Open Navigation Menu"
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>

              {/* Desktop Left Navigation - Anchored to the left */}
              <div className="hidden lg:flex items-center space-x-3 xl:space-x-5.5 min-w-0">
                <Link
                  to="/shop"
                  className={`text-[10px] xl:text-[11px] font-semibold tracking-[0.14em] xl:tracking-[0.2em] uppercase transition-colors relative py-1 whitespace-nowrap group ${
                    isTransparent
                      ? 'text-white/95 hover:text-white'
                      : 'text-atelier-softblack hover:text-atelier-darkbrown'
                  }`}
                >
                  <span>Shop</span>
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full ${
                      isTransparent ? 'bg-white' : 'bg-atelier-softblack'
                    }`}
                  />
                </Link>

                {/* Collections Mega Menu Trigger */}
                <div
                  className="relative py-1"
                  onMouseEnter={handleCollectionsEnter}
                  onMouseLeave={handleCollectionsLeave}
                >
                  <Link
                    to="/collections"
                    className={`flex items-center text-[10px] xl:text-[11px] font-semibold tracking-[0.14em] xl:tracking-[0.2em] uppercase transition-colors whitespace-nowrap group ${
                      isTransparent
                        ? 'text-white/95 hover:text-white'
                        : 'text-atelier-softblack hover:text-atelier-darkbrown'
                    }`}
                  >
                    <span>Collections</span>
                    <ChevronDown
                      size={11}
                      className={`ml-1 transition-transform duration-300 ${
                        collectionsHovered ? 'rotate-180' : ''
                      }`}
                    />
                  </Link>

                  {/* Collections Dropdown Card */}
                  <div
                    className={`absolute top-full -left-4 pt-3 w-[580px] transition-all duration-300 ${
                      collectionsHovered
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="bg-atelier-ivory border border-atelier-parchment shadow-[0_20px_60px_-15px_rgba(26,25,24,0.15)] p-5 rounded-none">
                      <div className="flex items-center justify-between pb-3 border-b border-atelier-parchment mb-3.5">
                        <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-atelier-taupe font-medium">
                          Curated Collections
                        </span>
                        <Link
                          to="/collections"
                          className="text-[10px] tracking-wider uppercase text-atelier-darkbrown hover:text-black font-medium flex items-center group/all"
                        >
                          <span>View All</span>
                          <ArrowRight size={11} className="ml-1 group-hover/all:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {collections.map((c) => (
                          <Link
                            key={c.name}
                            to={c.path}
                            className="group/item flex items-center space-x-3 p-2 rounded hover:bg-atelier-cream/70 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-sm overflow-hidden bg-atelier-parchment flex-shrink-0 border border-atelier-parchment">
                              <img
                                src={c.image}
                                alt={c.name}
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-serif text-sm text-atelier-softblack group-hover/item:text-atelier-darkbrown font-normal transition-colors">
                                {c.name}
                              </div>
                              <p className="text-[10px] text-atelier-taupe font-light truncate mt-0.5">
                                {c.tagline}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bespoke Rugs */}
                <Link
                  to="/custom-rugs"
                  className={`text-[10px] xl:text-[11px] font-semibold tracking-[0.14em] xl:tracking-[0.2em] uppercase transition-colors relative py-1 whitespace-nowrap group ${
                    isTransparent
                      ? 'text-white/95 hover:text-white'
                      : 'text-atelier-softblack hover:text-atelier-darkbrown'
                  }`}
                >
                  <span>Bespoke</span>
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full ${
                      isTransparent ? 'bg-white' : 'bg-atelier-softblack'
                    }`}
                  />
                </Link>

                {/* Studio & Craft Dropdown */}
                <div
                  className="relative py-1"
                  onMouseEnter={handleStudioEnter}
                  onMouseLeave={handleStudioLeave}
                >
                  <button
                    className={`flex items-center text-[10px] xl:text-[11px] font-semibold tracking-[0.14em] xl:tracking-[0.2em] uppercase transition-colors whitespace-nowrap group ${
                      isTransparent
                        ? 'text-white/95 hover:text-white'
                        : 'text-atelier-softblack hover:text-atelier-darkbrown'
                    }`}
                  >
                    <span>Studio</span>
                    <ChevronDown
                      size={11}
                      className={`ml-1 transition-transform duration-300 ${
                        studioHovered ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute top-full -left-4 pt-3 w-64 transition-all duration-300 ${
                      studioHovered
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="bg-atelier-ivory border border-atelier-parchment shadow-[0_20px_60px_-15px_rgba(26,25,24,0.15)] p-3">
                      <div className="text-[9px] tracking-[0.25em] uppercase font-mono text-atelier-taupe px-3 py-1.5 border-b border-atelier-parchment/60 mb-1">
                        Atelier & Guides
                      </div>
                      {studioLinks.map((item) => (
                        <Link
                          key={item.title}
                          to={item.path}
                          className="block px-3 py-2 rounded hover:bg-atelier-cream/70 transition-colors group/item"
                        >
                          <div className="text-xs font-serif text-atelier-softblack group-hover/item:text-atelier-darkbrown">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-atelier-taupe font-light line-clamp-1 mt-0.5">
                            {item.desc}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <Link
                  to="/contact"
                  className={`text-[10px] xl:text-[11px] font-semibold tracking-[0.14em] xl:tracking-[0.2em] uppercase transition-colors relative py-1 whitespace-nowrap group ${
                    isTransparent
                      ? 'text-white/95 hover:text-white'
                      : 'text-atelier-softblack hover:text-atelier-darkbrown'
                  }`}
                >
                  <span>Contact</span>
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full ${
                      isTransparent ? 'bg-white' : 'bg-atelier-softblack'
                    }`}
                  />
                </Link>
              </div>
            </div>

            {/* COLUMN 2 (CENTER): Prominent Architectural Brand Identity (Enhanced Scale) */}
            <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4 flex-shrink-0">
              <Link to="/" className="inline-block group focus:outline-none text-center">
                <div className="flex flex-col items-center leading-tight">
                  <span
                    className={`font-serif text-[16px] xs:text-[17px] sm:text-[22px] md:text-[25px] lg:text-[28px] xl:text-[31px] tracking-[0.16em] sm:tracking-[0.22em] lg:tracking-[0.25em] font-medium transition-colors duration-300 whitespace-nowrap ${
                      isTransparent
                        ? 'text-white group-hover:text-atelier-parchment drop-shadow-md'
                        : 'text-atelier-softblack group-hover:text-atelier-darkbrown'
                    }`}
                  >
                    PRASRI RUGS
                  </span>
                  <span
                    className={`text-[7.5px] sm:text-[9px] lg:text-[10px] tracking-[0.28em] sm:tracking-[0.36em] font-sans font-semibold mt-0.5 sm:mt-1 transition-colors duration-300 whitespace-nowrap ${
                      isTransparent ? 'text-white/90 drop-shadow-sm' : 'text-[#5A544D]'
                    }`}
                    style={{ fontVariant: 'all-small-caps' }}
                  >
                    bhadohi, india
                  </span>
                </div>
              </Link>
            </div>

            {/* COLUMN 3 (RIGHT): Currency (md+ & desktop), Search, Wishlist, Account (xl+), Bag */}
            <div className="flex items-center justify-end space-x-1 sm:space-x-1.5 md:space-x-2.5 min-w-0">
              {/* Currency Selector Pill - Shown on tablets (md+) & desktop where there's zero overlap; kept in drawer on mobile */}
              <div className="relative hidden md:block flex-shrink-0" ref={currencyRef}>
                <button
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className={`flex items-center text-[10px] sm:text-[11px] font-mono tracking-widest py-1 px-2.5 rounded-full border transition-all duration-300 ${
                    isTransparent
                      ? 'text-white bg-black/35 hover:bg-black/50 border-white/25 shadow-sm'
                      : 'text-atelier-softblack bg-white hover:bg-atelier-cream border-atelier-parchment hover:border-atelier-taupe/60 shadow-xs'
                  }`}
                  aria-label="Select Currency"
                >
                  <Globe
                    size={11}
                    className={`mr-1 transition-colors ${
                      isTransparent ? 'text-white/80' : 'text-atelier-taupe'
                    }`}
                  />
                  <span className="font-semibold">{currency}</span>
                  <ChevronDown
                    size={10}
                    className={`ml-1 transition-transform duration-200 ${
                      currencyDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {currencyDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-atelier-ivory border border-atelier-parchment shadow-[0_15px_35px_rgba(26,25,24,0.12)] py-1.5 z-50 animate-fadeIn text-left">
                    <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-atelier-taupe font-mono border-b border-atelier-parchment">
                      Currency
                    </div>
                    {Object.values(rates || CURRENCY_RATES).map((rate) => (
                      <button
                        key={rate.code}
                        onClick={() => {
                          setCurrency(rate.code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-atelier-cream transition-colors ${
                          currency === rate.code
                            ? 'font-semibold text-atelier-softblack bg-atelier-cream/60'
                            : 'text-atelier-charcoal'
                        }`}
                      >
                        <span className="font-sans">{rate.name}</span>
                        <span className="font-mono text-[11px] text-atelier-taupe">
                          {rate.code} ({rate.symbol})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                  isTransparent
                    ? 'text-white hover:text-white hover:bg-white/15'
                    : 'text-atelier-softblack hover:text-black hover:bg-atelier-cream'
                }`}
                aria-label="Search Collection"
                title="Search (⌘K)"
              >
                <Search size={17} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
              </button>

              {/* Wishlist - Active & visible on mobile and tablets in place of currency converter */}
              <Link
                to="/account?tab=wishlist"
                className={`relative p-1.5 sm:p-2 rounded-full transition-all duration-300 inline-flex flex-shrink-0 ${
                  isTransparent
                    ? 'text-white hover:text-white hover:bg-white/15'
                    : 'text-atelier-softblack hover:text-black hover:bg-atelier-cream'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={17} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 bg-atelier-terracotta text-white rounded-full text-[8px] flex items-center justify-center font-mono font-medium animate-fadeIn">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Link - Shown on xl+ to preserve iPad and tablet breathing room */}
              <Link
                to="/account"
                className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hidden xl:inline-flex flex-shrink-0 ${
                  isTransparent
                    ? 'text-white hover:text-white hover:bg-white/15'
                    : 'text-atelier-softblack hover:text-black hover:bg-atelier-cream'
                }`}
                aria-label="Customer Account"
              >
                <User size={18} strokeWidth={1.5} />
              </Link>

              {/* Shopping Bag CTA */}
              <button
                onClick={toggleCart}
                className={`relative p-1 sm:p-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                  isTransparent
                    ? 'text-white hover:text-white hover:bg-white/15'
                    : 'text-atelier-softblack hover:text-black hover:bg-atelier-cream'
                }`}
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
                {totalItemCount > 0 && (
                  <span
                    className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full text-[8.5px] sm:text-[9px] flex items-center justify-center font-mono font-semibold transition-transform duration-300 ${
                      isTransparent
                        ? 'bg-white text-atelier-softblack'
                        : 'bg-atelier-softblack text-atelier-ivory'
                    }`}
                  >
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Sleek High-End Slide-In) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-atelier-ivory shadow-2xl flex flex-col z-10 animate-slideRight">
            {/* Drawer Header */}
            <div className="p-5 flex items-center justify-between border-b border-atelier-parchment bg-atelier-cream/50">
              <div>
                <span className="font-serif text-lg tracking-[0.25em] text-atelier-softblack font-medium">
                  PRASRI RUGS
                </span>
                <span className="block text-[9px] font-sans tracking-[0.3em] text-atelier-taupe uppercase mt-0.5">
                  BHADOHI, INDIA
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-atelier-charcoal hover:text-atelier-softblack rounded-full hover:bg-atelier-parchment/60 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Navigation Links Scroll Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-serif text-2xl tracking-wide text-atelier-softblack hover:text-atelier-brown transition-colors"
                >
                  Shop All Rugs
                </Link>

                {/* Collections Dropdown Accordion */}
                <div className="py-1">
                  <button
                    onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                    className="w-full flex items-center justify-between font-serif text-2xl tracking-wide text-atelier-softblack hover:text-atelier-brown transition-colors text-left py-1"
                    aria-expanded={mobileCollectionsOpen}
                  >
                    <span>Collections</span>
                    <ChevronDown
                      size={20}
                      className={`text-atelier-taupe transform transition-transform duration-300 ${
                        mobileCollectionsOpen ? 'rotate-180 text-atelier-softblack' : ''
                      }`}
                    />
                  </button>

                  {mobileCollectionsOpen && (
                    <div className="mt-2.5 pl-3 border-l-2 border-atelier-parchment space-y-2.5 animate-fadeIn">
                      {collections.map((c) => (
                        <Link
                          key={c.name}
                          to={c.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 py-1.5 group/mitem"
                        >
                          <div className="w-9 h-9 rounded-xs overflow-hidden bg-atelier-parchment flex-shrink-0 border border-atelier-parchment">
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-full h-full object-cover group-hover/mitem:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-serif text-atelier-softblack group-hover/mitem:text-atelier-darkbrown">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-atelier-taupe truncate">
                              {c.tagline}
                            </div>
                          </div>
                        </Link>
                      ))}

                      <Link
                        to="/collections"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-atelier-darkbrown hover:text-black pt-1.5"
                      >
                        <span>View All Collections</span>
                        <ArrowRight size={12} className="ml-1" />
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/custom-rugs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-serif text-2xl tracking-wide text-atelier-softblack hover:text-atelier-brown transition-colors"
                >
                  Bespoke Sizing & Looms
                </Link>

                <Link
                  to="/craft"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-serif text-2xl tracking-wide text-atelier-softblack hover:text-atelier-brown transition-colors"
                >
                  The Craft
                </Link>

                <Link
                  to="/the-atelier"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-serif text-2xl tracking-wide text-atelier-softblack hover:text-atelier-brown transition-colors"
                >
                  The Atelier
                </Link>

                <Link
                  to="/journal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-serif text-2xl tracking-wide text-atelier-softblack hover:text-atelier-brown transition-colors"
                >
                  Journal & Editorial
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-serif text-2xl tracking-wide text-atelier-softblack hover:text-atelier-brown transition-colors"
                >
                  Contact & Concierge
                </Link>
              </div>

              {/* Mobile Quick Account Links */}
              <div className="pt-4 border-t border-atelier-parchment space-y-2.5">
                <Link
                  to="/account?tab=wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-xs text-atelier-charcoal hover:text-atelier-softblack py-1"
                >
                  <div className="flex items-center">
                    <Heart size={15} className="mr-2 text-atelier-taupe" />
                    <span>Saved Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-atelier-terracotta text-white rounded-full text-[9px] px-2 py-0.5 font-mono">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-xs text-atelier-charcoal hover:text-atelier-softblack py-1"
                >
                  <User size={15} className="mr-2 text-atelier-taupe" />
                  <span>Customer Account & Orders</span>
                </Link>

                <Link
                  to="/order-tracking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-xs text-atelier-charcoal hover:text-atelier-softblack py-1"
                >
                  <Compass size={15} className="mr-2 text-atelier-taupe" />
                  <span>Track Express Shipment</span>
                </Link>
              </div>

              {/* Mobile Dedicated Currency Selector */}
              <div className="pt-4 border-t border-atelier-parchment">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-atelier-taupe font-medium flex items-center">
                    <Globe size={12} className="mr-1.5 text-atelier-taupe" />
                    <span>Currency</span>
                  </span>
                  <span className="text-[10px] font-mono text-atelier-darkbrown font-semibold">
                    {currency} ({rates?.[currency]?.symbol || '₹'})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(rates || CURRENCY_RATES).map((rate) => (
                    <button
                      key={rate.code}
                      onClick={() => setCurrency(rate.code)}
                      className={`py-1.5 px-1 rounded text-xs font-mono border text-center transition-all ${
                        currency === rate.code
                          ? 'bg-atelier-softblack text-white border-atelier-softblack font-semibold shadow-xs'
                          : 'bg-white text-atelier-charcoal border-atelier-parchment hover:border-atelier-taupe'
                      }`}
                    >
                      <div className="font-semibold">{rate.code}</div>
                      <div className="text-[10px] opacity-75">{rate.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Footer Drawer Strip */}
            <div className="p-5 bg-atelier-cream border-t border-atelier-parchment text-xs space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-atelier-taupe">
                Atelier Coordinates
              </div>
              <p className="text-atelier-charcoal text-[11px] leading-relaxed">
                G.T. Road, Gopiganj, Bhadohi, Uttar Pradesh 221303, India
              </p>
              <a
                href="https://wa.me/919839418038?text=Hello%2C%20I%20am%20inquiring%20about%20a%20handcrafted%20rug%20from%20Prasri%20Rugs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-800 hover:text-emerald-950 font-medium text-[11px] underline mt-1"
              >
                <span>Live WhatsApp Concierge →</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
