import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';

// Basename for GitHub Pages subpath hosting.
// - Local dev (localhost:5173)  -> basename "/" (pathname is "/")
// - GitHub Pages subpath        -> basename "/Consumer-Loyalty-Program-Web-Application"
// Vite injects import.meta.env.BASE_URL from the `base` config; strip trailing "/".
const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';

// Route-level code splitting: each page loads on demand, shrinking the
// initial bundle and speeding up first paint.
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const FreeSamplePage = lazy(() => import('./pages/FreeSamplePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const WomensHealthPage = lazy(() => import('./pages/WomensHealthPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const TopicDetailPage = lazy(() => import('./pages/TopicDetailPage'));
const WomensHealthProductPage = lazy(() => import('./pages/WomensHealthProductPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const EditorialPolicyPage = lazy(() => import('./pages/EditorialPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const MySubscriptionsPage = lazy(() => import('./pages/MySubscriptionsPage'));
const SubscriptionFAQsPage = lazy(() => import('./pages/SubscriptionFAQsPage'));
const SubscriptionTermsPage = lazy(() => import('./pages/SubscriptionTermsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage'));
const RedeemConfirmationPage = lazy(() => import('./pages/RedeemConfirmationPage'));
const StaffDashboardPage = lazy(() => import('./pages/StaffDashboardPage'));
const FulfillmentPage = lazy(() => import('./pages/FulfillmentPage'));
import ProtectedRoute from './components/ProtectedRoute';
import RouteErrorBoundary from './components/RouteErrorBoundary';

// Component to handle scroll to top on route changes.
// Fixes mobile bug: tapping a product after scrolling the homepage would open
// the product page already scrolled down (browser restores scroll position).
// - history.scrollRestoration = 'manual' stops the browser auto-restoring.
// - Scrolls immediately on navigation, then again after React commits
//   (rAF) and after images/content settle (setTimeout), so late-arriving
//   images cannot push the viewport back down.
const ScrollToTop: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const scrollTop = () => window.scrollTo(0, 0);
    scrollTop();
    const raf = requestAnimationFrame(scrollTop);
    const t = window.setTimeout(scrollTop, 100);
    const t2 = window.setTimeout(scrollTop, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router basename={BASENAME}>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carehub-teal"></div></div>}>
                <Routes>
                  <Route path="/" element={<RouteErrorBoundary><HomePage /></RouteErrorBoundary>} />
                  <Route path="/product/:id" element={<RouteErrorBoundary><ProductPage /></RouteErrorBoundary>} />
                  <Route path="/carehub-subscribe" element={<RouteErrorBoundary><ProductPage /></RouteErrorBoundary>} />
                  <Route path="/free-sample" element={<RouteErrorBoundary><FreeSamplePage /></RouteErrorBoundary>} />
                  <Route path="/about" element={<RouteErrorBoundary><AboutPage /></RouteErrorBoundary>} />
                  <Route path="/checkout" element={<RouteErrorBoundary><CheckoutPage /></RouteErrorBoundary>} />
                  <Route path="/womens-health" element={<RouteErrorBoundary><WomensHealthPage /></RouteErrorBoundary>} />
                  <Route path="/womens-health/article/:id" element={<RouteErrorBoundary><ArticleDetailPage /></RouteErrorBoundary>} />
                  <Route path="/womens-health/topic/:id" element={<RouteErrorBoundary><TopicDetailPage /></RouteErrorBoundary>} />
                  <Route path="/womens-health/product/:id" element={<RouteErrorBoundary><WomensHealthProductPage /></RouteErrorBoundary>} />
                  <Route path="/search" element={<RouteErrorBoundary><SearchResultsPage /></RouteErrorBoundary>} />
                  <Route path="/privacy-policy" element={<RouteErrorBoundary><PrivacyPolicyPage /></RouteErrorBoundary>} />
                  <Route path="/editorial-policy" element={<RouteErrorBoundary><EditorialPolicyPage /></RouteErrorBoundary>} />
                  <Route path="/terms-of-use" element={<RouteErrorBoundary><TermsOfUsePage /></RouteErrorBoundary>} />
                  <Route path="/cookies" element={<RouteErrorBoundary><CookiesPage /></RouteErrorBoundary>} />
                  <Route path="/profile" element={<RouteErrorBoundary><ProfilePage /></RouteErrorBoundary>} />
                  <Route path="/my-orders" element={<RouteErrorBoundary><MyOrdersPage /></RouteErrorBoundary>} />
                  <Route path="/my-subscriptions" element={<RouteErrorBoundary><MySubscriptionsPage /></RouteErrorBoundary>} />
                  <Route path="/subscription-faqs" element={<RouteErrorBoundary><SubscriptionFAQsPage /></RouteErrorBoundary>} />
                  <Route path="/subscription-terms" element={<RouteErrorBoundary><SubscriptionTermsPage /></RouteErrorBoundary>} />
                  <Route path="/wishlist" element={<RouteErrorBoundary><WishlistPage /></RouteErrorBoundary>} />
                  <Route path="/addresses" element={<RouteErrorBoundary><AddressesPage /></RouteErrorBoundary>} />
                  <Route path="/loyalty" element={<RouteErrorBoundary><LoyaltyPage /></RouteErrorBoundary>} />
                  <Route path="/loyalty/redeem/:giftId" element={<RouteErrorBoundary><RedeemConfirmationPage /></RouteErrorBoundary>} />
                  <Route path="/staff" element={<ProtectedRoute requiredRole="staff"><RouteErrorBoundary><StaffDashboardPage /></RouteErrorBoundary></ProtectedRoute>} />
                  <Route path="/fulfillment" element={<ProtectedRoute requiredRole="staff"><RouteErrorBoundary><FulfillmentPage /></RouteErrorBoundary></ProtectedRoute>} />
                </Routes>
              </Suspense>
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