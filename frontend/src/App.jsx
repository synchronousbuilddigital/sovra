import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ShopProvider } from './context/ShopContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// Helper to handle ChunkLoadErrors after a new deployment
const lazyRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // If the module fails to load, it's likely because a new version was deployed
      // and the old chunk is gone. We force a hard reload to get the new assets.
      console.error('Module load failed, refreshing...', error);
      window.location.reload();
      return { default: () => null }; // Return a dummy while reloading
    }
  });
};

// Lazy load pages with retry logic
const Home = lazyRetry(() => import('./pages/Home'))
const Shop = lazyRetry(() => import('./pages/Shop'))
const ProductDetail = lazyRetry(() => import('./pages/ProductDetail'))
const Bag = lazyRetry(() => import('./pages/Bag'))
const Account = lazyRetry(() => import('./pages/Account'))
const Story = lazyRetry(() => import('./pages/Story'))
const Ethics = lazyRetry(() => import('./pages/Ethics'))
const Admin = lazyRetry(() => import('./pages/Admin'))
const Collections = lazyRetry(() => import('./pages/Collections'))
const Magazine = lazyRetry(() => import('./pages/Magazine'))
const Login = lazyRetry(() => import('./pages/Login'))
const Signup = lazyRetry(() => import('./pages/Signup'))
const OTPVerification = lazyRetry(() => import('./pages/OTPVerification'))
const ForgotPassword = lazyRetry(() => import('./pages/ForgotPassword'))
const Checkout = lazyRetry(() => import('./pages/Checkout'))
const OrderDetail = lazyRetry(() => import('./pages/OrderDetail'))
const Invoice = lazyRetry(() => import('./pages/Invoice'))
const Wishlist = lazyRetry(() => import('./pages/Wishlist'))
const Contact = lazyRetry(() => import('./pages/Contact'))
const FAQ = lazyRetry(() => import('./pages/FAQ'))
const Policies = lazyRetry(() => import('./pages/Policies'))
const PrivacyPolicy = lazyRetry(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazyRetry(() => import('./pages/TermsOfService'))
const SizeGuide = lazyRetry(() => import('./pages/SizeGuide'))
const NotFound = lazyRetry(() => import('./pages/NotFound'))

const PageLoader = () => (
  <div className="fixed inset-0 bg-surface z-[9999] flex flex-col items-center justify-center">
    <div className="w-16 h-16 relative">
      <div className="absolute inset-0 border-2 border-primary/10 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    <span className="mt-8 font-label text-[10px] kerning-widest uppercase text-primary animate-pulse">
      Loading the Archive...
    </span>
  </div>
)

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    // Fire GA4 page_view on every React Router navigation
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-SJPL5MB07G', {
        page_path: pathname,
      })
    }
  }, [pathname])
  return null
}

const AppBody = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Navbar />
      <main className="min-h-screen">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<Shop />} />
            <Route path="/magazine" element={<Magazine />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/bag" element={<Bag />} />
            <Route path="/story" element={<Story />} />

            <Route path="/ethics" element={<Ethics />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/shipping-policy" element={<Policies />} />
            <Route path="/returns-policy" element={<Policies />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/size-guide" element={<SizeGuide />} />

            {/* Admin Routes - Strict role check */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Private Routes - Auth check */}
            <Route element={<PrivateRoute />}>
              <Route path="/account" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/order/:id/invoice" element={<Invoice />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <ShopProvider>
        <AppBody />
      </ShopProvider>
    </Router>
  )
}

export default App
