import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ShopProvider } from './context/ShopContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Bag = lazy(() => import('./pages/Bag'))
const Account = lazy(() => import('./pages/Account'))
const Story = lazy(() => import('./pages/Story'))
const Ethics = lazy(() => import('./pages/Ethics'))
const Admin = lazy(() => import('./pages/Admin'))
const Collections = lazy(() => import('./pages/Collections'))
const Magazine = lazy(() => import('./pages/Magazine'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const OTPVerification = lazy(() => import('./pages/OTPVerification'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Invoice = lazy(() => import('./pages/Invoice'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Policies = lazy(() => import('./pages/Policies'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const SizeGuide = lazy(() => import('./pages/SizeGuide'))
const NotFound = lazy(() => import('./pages/NotFound'))

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
