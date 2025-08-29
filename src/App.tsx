import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import FreeSamplePage from './pages/FreeSamplePage';
import AboutPage from './pages/AboutPage';
import WomensHealthPage from './pages/WomensHealthPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import TopicDetailPage from './pages/TopicDetailPage';
import WomensHealthProductPage from './pages/WomensHealthProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import EditorialPolicyPage from './pages/EditorialPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import CookiesPage from './pages/CookiesPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import AddressesPage from './pages/AddressesPage';
import LoyaltyPage from './pages/LoyaltyPage';
import RedeemConfirmationPage from './pages/RedeemConfirmationPage';

// Component to handle scroll to top on route changes
const ScrollToTop: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/blackmores-subscribe" element={<ProductPage />} />
                <Route path="/free-sample" element={<FreeSamplePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/womens-health" element={<WomensHealthPage />} />
                <Route path="/womens-health/article/:id" element={<ArticleDetailPage />} />
                <Route path="/womens-health/topic/:id" element={<TopicDetailPage />} />
                <Route path="/womens-health/product/:id" element={<WomensHealthProductPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
                <Route path="/terms-of-use" element={<TermsOfUsePage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/loyalty" element={<LoyaltyPage />} />
                <Route path="/loyalty/redeem/:giftId" element={<RedeemConfirmationPage />} />
              </Routes>
            </main>
            <Footer />
            <CartSidebar />
            
            {/* Floating Free Sample Button */}
            <Link
              to="/free-sample"
              className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group animate-pulse lg:hidden"
              title="Nhận mẫu miễn phí"
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl group-hover:rotate-12 transition-transform">🎁</span>
                <span className="hidden sm:inline font-bold text-sm">Mẫu miễn phí</span>
              </div>
            </Link>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;