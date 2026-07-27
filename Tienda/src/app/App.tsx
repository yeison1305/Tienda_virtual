import { Routes, Route, Navigate } from "react-router";
import { Nav, Hero, Ticker, CategoryGrid, ProductGrid, PromoBanner,
         CollectionsTabs, Benefits, InspirationGrid, Reviews,
         Newsletter, Footer } from './components/sections';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoryPage } from './pages/CategoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminNewsletter } from './pages/admin/AdminNewsletter';
import { AdminRoute } from './components/auth/AdminRoute';
import { useAuth } from './context/AuthContext';

function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <CategoryGrid />
      <ProductGrid />
      <PromoBanner />
      <CollectionsTabs />
      <Benefits />
      <InspirationGrid />
      <Reviews />
      <Newsletter />
    </>
  );
}

function LoginRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#080808] flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="bg-[#080808] text-white min-h-screen">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido/:id" element={<OrderConfirmationPage />} />

        {/* Admin routes - protected by AdminRoute */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productos" element={<AdminProducts />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        </Route>

        {/* Redirect after login based on role */}
        <Route path="/login-redirect" element={<LoginRedirect />} />
      </Routes>
      <Footer />
    </div>
  );
}
