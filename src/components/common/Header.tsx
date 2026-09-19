import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, Globe, ChevronDown } from 'lucide-react';
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
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  
  const { toggleCart, totalItemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { currency, setCurrency, rates } = useCurrency();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionsDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'SHOP', path: '/shop' },
    { label: 'COLLECTIONS', path: '/collections', hasDropdown: true },
    { label: 'THE ATELIER', path: '/the-atelier' },
    { label: 'CRAFT', path: '/craft' },
    { label: 'CUSTOM RUGS', path: '/custom-rugs' },
    { label: 'JOURNAL', path: '/journal' },
    { label: 'ABOUT', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
  ];

  const collections = [
    { name: 'Modern Forms', path: '/collections/modern-forms', desc: 'Abstract and contemporary designs' },
    { name: 'Quiet Neutrals', path: '/collections/quiet-neutrals', desc: 'Soft, restrained rugs for calm interiors' },
    { name: 'Botanical Studies', path: '/collections/botanical-studies', desc: 'Abstracted nature-inspired motifs' },
    { name: 'Heritage Reimagined', path: '/collections/heritage-reimagined', desc: 'Traditional roots through a modern lens' },
    { name: 'Texture & Sculpture', path: '/collections/texture-sculpture', desc: 'High-low carved dimensional surfaces' },
    { name: 'Hand-Knotted Collection', path: '/collections/hand-knotted-collection', desc: 'Generational loom-woven master craft' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Announcement Bar */}
      <div className="bg-atelier-softblack text-atelier-parchment text-[11px] tracking-widest uppercase py-2 px-4 text-center font-medium border-b border-atelier-charcoal/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline-block text-[10px] text-atelier-taupe tracking-wider">
            BHADOHI, INDIA · DIRECT FROM THE ATELIER
          </span>
          <span className="mx-auto sm:mx-0">
            Complimentary Worldwide Express Delivery on Orders Over $1,500 USD
          </span>
          <span className="hidden md:inline-block text-[10px] text-atelier-taupe tracking-wider">
            BESPOKE SIZING AVAILABLE
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-atelier-ivory/95 backdrop-blur-md shadow-subtle border-b border-atelier-parchment/60 py-3'
            : 'bg-atelier-ivory/80 backdrop-blur-sm border-b border-atelier-parchment/40 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile menu button & Desktop primary links */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 text-atelier-softblack hover:text-atelier-brown transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-initial text-center lg:text-left">
              <Link to="/" className="inline-block group">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-serif text-xl sm:text-2xl tracking-[0.24em] sm:tracking-[0.28em] text-atelier-softblack font-normal transition-colors group-hover:text-atelier-darkbrown">
                    THE WEAVE ATELIER
                  </span>
                  <span className="text-[8px] tracking-[0.35em] text-atelier-taupe uppercase font-sans mt-0.5">
                    BHADOHI · INDIA
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group">
                  <Link
                    to={link.path}
                    className={`text-[12px] tracking-[0.2em] font-medium transition-colors duration-200 py-1 inline-block ${
                      location.pathname === link.path
                        ? 'text-atelier-softblack border-b border-atelier-softblack'
                        : 'text-atelier-charcoal/80 hover:text-atelier-softblack'
                    }`}
                  >
                    {link.label}
                  </Link>

                  {/* Mega dropdown for Collections */}
                  {link.hasDropdown && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="bg-atelier-ivory border border-atelier-parchment shadow-luxury p-4 space-y-1">
                        <div className="text-[10px] tracking-widest text-atelier-taupe uppercase pb-2 border-b border-atelier-parchment font-medium">
                          Curated Rug Collections
                        </div>
                        {collections.map((c) => (
                          <Link
                            key={c.name}
                            to={c.path}
                            className="block px-2 py-2 hover:bg-atelier-cream/70 transition-colors"
                          >
                            <div className="text-xs font-serif tracking-wider text-atelier-softblack font-medium">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-atelier-taupe line-clamp-1">
                              {c.desc}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Currency, Search, Wishlist, Account, Cart */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Currency Selector */}
              <div className="relative">
                <button
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="flex items-center text-[11px] tracking-widest text-atelier-charcoal hover:text-atelier-softblack transition-colors py-1 px-1.5 border border-transparent hover:border-atelier-parchment rounded"
                  aria-label="Change currency"
                >
                  <Globe size={13} className="mr-1 text-atelier-taupe" strokeWidth={1.5} />
                  <span>{currency}</span>
                  <ChevronDown size={11} className="ml-0.5 text-atelier-taupe" />
                </button>

                {currencyDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-atelier-ivory border border-atelier-parchment shadow-luxury py-1 z-50">
                    <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-atelier-taupe font-medium border-b border-atelier-parchment">
                      Select Currency
                    </div>
                    {Object.values(rates || CURRENCY_RATES).map((rate) => (
                      <button
                        key={rate.code}
                        onClick={() => {
                          setCurrency(rate.code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-atelier-cream/80 transition-colors ${
                          currency === rate.code ? 'font-semibold text-atelier-softblack bg-atelier-cream/50' : 'text-atelier-charcoal'
                        }`}
                      >
                        <span>{rate.name}</span>
                        <span className="font-mono text-atelier-taupe text-[11px]">{rate.code} ({rate.symbol})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Icon */}
              <button
                onClick={onOpenSearch}
                className="p-1.5 text-atelier-charcoal hover:text-atelier-softblack transition-colors"
                aria-label="Search rugs"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <Link
                to="/account?tab=wishlist"
                className="relative p-1.5 text-atelier-charcoal hover:text-atelier-softblack transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-atelier-terracotta text-white rounded-full text-[9px] flex items-center justify-center font-mono">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to="/account"
                className="p-1.5 text-atelier-charcoal hover:text-atelier-softblack transition-colors hidden sm:inline-block"
                aria-label="Customer Account"
              >
                <User size={18} strokeWidth={1.5} />
              </Link>

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative p-1.5 text-atelier-charcoal hover:text-atelier-softblack transition-colors"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {totalItemCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-atelier-darkbrown text-white rounded-full text-[9px] flex items-center justify-center font-mono">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Full-Screen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-atelier-ivory flex flex-col overflow-y-auto animate-fadeIn">
          {/* Mobile Header Top */}
          <div className="p-4 flex items-center justify-between border-b border-atelier-parchment">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className="font-serif text-lg tracking-[0.24em] text-atelier-softblack">
                THE WEAVE ATELIER
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-atelier-charcoal hover:text-atelier-softblack"
              aria-label="Close menu"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation Links List */}
          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-4">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                Shop All Rugs
              </Link>

              <div>
                <button
                  onClick={() => setCollectionsDropdownOpen(!collectionsDropdownOpen)}
                  className="w-full flex items-center justify-between font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
                >
                  <span>Collections</span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 ${
                      collectionsDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {collectionsDropdownOpen && (
                  <div className="pl-4 mt-3 space-y-2.5 border-l-2 border-atelier-parchment">
                    {collections.map((c) => (
                      <Link
                        key={c.name}
                        to={c.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-atelier-charcoal hover:text-atelier-softblack"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/custom-rugs"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                Custom Rugs
              </Link>
              <Link
                to="/craft"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                The Craft
              </Link>
              <Link
                to="/the-atelier"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                The Atelier
              </Link>
              <Link
                to="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                Journal
              </Link>
              <Link
                to="/size-guide"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                Rug Size Guide
              </Link>
              <Link
                to="/rug-care"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                Rug Care
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-serif text-2xl tracking-wider text-atelier-softblack hover:text-atelier-brown"
              >
                Contact & Studio
              </Link>
            </div>

            {/* Divider */}
            <hr className="border-atelier-parchment my-6" />

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center text-sm text-atelier-charcoal hover:text-atelier-softblack"
              >
                <User size={16} className="mr-2 text-atelier-taupe" />
                Customer Account / Sign In
              </Link>
              <Link
                to="/order-tracking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center text-sm text-atelier-charcoal hover:text-atelier-softblack"
              >
                <span className="w-4 h-4 mr-2 border border-atelier-taupe flex items-center justify-center text-[10px]">✓</span>
                Track An Order
              </Link>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="p-6 bg-atelier-cream border-t border-atelier-parchment">
            <div className="text-xs text-atelier-taupe mb-2">Bhadohi Studio Coordinates</div>
            <div className="text-xs text-atelier-charcoal">
              Bhadohi, Uttar Pradesh 221401, India
            </div>
            <div className="text-xs text-atelier-taupe mt-1">
              WhatsApp Concierge: +91 94500 00000
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
