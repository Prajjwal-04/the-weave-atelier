import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Providers
import { CurrencyProvider } from './context/CurrencyContext';
import { InventoryProvider } from './context/InventoryContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Common Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { CartDrawer } from './components/common/CartDrawer';
import { WhatsAppFloating } from './components/common/WhatsAppFloating';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CustomRugsPage } from './pages/CustomRugsPage';
import { TheAtelierPage } from './pages/TheAtelierPage';
import { AboutPage } from './pages/AboutPage';
import { CraftPage } from './pages/CraftPage';
import { JournalPage } from './pages/JournalPage';
import { SizeGuidePage } from './pages/SizeGuidePage';
import { RugCarePage } from './pages/RugCarePage';
import { ShippingReturnsPage } from './pages/ShippingReturnsPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-atelier-ivory text-atelier-softblack">
      <ScrollToTop />
      
      {/* Global Header (hidden on admin portal) */}
      {!isAdmin && <Header onOpenSearch={() => setSearchOpen(true)} />}

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<CollectionsPage />} />
          <Route path="/custom-rugs" element={<CustomRugsPage />} />
          <Route path="/the-atelier" element={<TheAtelierPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/craft" element={<CraftPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/rug-care" element={<RugCarePage />} />
          <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/track-order" element={<OrderTrackingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Modals & Overlays (hidden on admin portal) */}
      {!isAdmin && (
        <>
          <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          <CartDrawer />
          <WhatsAppFloating />
          <Footer />
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <CurrencyProvider>
        <InventoryProvider>
          <WishlistProvider>
            <CartProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </CartProvider>
          </WishlistProvider>
        </InventoryProvider>
      </CurrencyProvider>
    </Router>
  );
};

export default App;
