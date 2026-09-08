import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ToastProvider } from './context/ToastContext';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

import HomePage from './pages/public/HomePage';
import ShopPage from './pages/public/ShopPage';
import ProductPage from './pages/public/ProductPage';
import PortfolioPage from './pages/public/PortfolioPage';
import PortfolioCaseStudyPage from './pages/public/PortfolioCaseStudyPage';
import ContactPage from './pages/public/ContactPage';
import CustomDesignPage from './pages/public/CustomDesignPage';
import AboutPage from './pages/public/AboutPage';
import FaqPage from './pages/public/FaqPage';
import OrderInformationPage from './pages/public/OrderInformationPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import RefundPolicyPage from './pages/public/RefundPolicyPage';
import ComingSoon from './pages/public/ComingSoon';

// Admin is a separate, code-split bundle — the vast majority of visitors
// never touch it, so it shouldn't cost them any download/parse time on
// the public site (spec §41: code splitting).
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const AdminPortfolioPage = lazy(() => import('./pages/admin/PortfolioPage'));
const PortfolioFormPage = lazy(() => import('./pages/admin/PortfolioFormPage'));
const InquiriesPage = lazy(() => import('./pages/admin/InquiriesPage'));
const CustomRequestsPage = lazy(() => import('./pages/admin/CustomRequestsPage'));

function AdminFallback() {
  return <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">Loading…</div>;
}

export default function App() {
  return (
    <ToastProvider>
      <SiteSettingsProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* ---- Public site ---- */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:slug" element={<ProductPage />} />

                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:slug" element={<PortfolioCaseStudyPage />} />

                <Route path="/about" element={<AboutPage />} />
                <Route path="/custom-design" element={<CustomDesignPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/order-information" element={<OrderInformationPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
              </Route>

              {/* ---- Admin (lazy-loaded) ---- */}
              <Route
                path="/admin/login"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<AdminFallback />}>
                      <AdminLayout />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id" element={<ProductFormPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="portfolio" element={<AdminPortfolioPage />} />
                <Route path="portfolio/new" element={<PortfolioFormPage />} />
                <Route path="portfolio/:id" element={<PortfolioFormPage />} />
                <Route path="inquiries" element={<InquiriesPage />} />
                <Route path="custom-requests" element={<CustomRequestsPage />} />
              </Route>

              <Route path="*" element={<ComingSoon title="Page not found" />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </SiteSettingsProvider>
    </ToastProvider>
  );
}
