import { Routes, Route, Navigate, useLocation } from "react-router";
import { useEffect } from "react";
import { Nav, Hero, Ticker, CategoryGrid, ProductGrid, PromoBanner,
         CollectionsTabs, Benefits, InspirationGrid,
         Newsletter, Footer } from './components/sections';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoryPage } from './pages/CategoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionPage } from './pages/CollectionPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductPage } from './pages/ProductPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminNewsletter } from './pages/admin/AdminNewsletter';
import { AdminCollections } from './pages/admin/AdminCollections';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminRoute } from './components/auth/AdminRoute';
import { UserRoute } from './components/auth/UserRoute';
import { UserLayout } from './pages/user/UserLayout';
import { ProfileDashboard } from './pages/user/ProfileDashboard';
import { OrderHistory } from './pages/user/OrderHistory';
import { OrderDetail } from './pages/user/OrderDetail';
import { AddressesPage } from './pages/user/AddressesPage';
import { ChangePasswordPage } from './pages/user/ChangePasswordPage';
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
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="bg-[#080808] text-white min-h-screen">
      <Nav />
      <main className="pt-16 pb-16">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/colecciones" element={<CollectionsPage />} />
        <Route path="/coleccion/:slug" element={<CollectionPage />} />
        <Route path="/producto/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido/:id" element={<OrderConfirmationPage />} />

{/* Admin routes - protected by AdminRoute */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productos" element={<AdminProducts />} />
          <Route path="/admin/categorias" element={<AdminCategories />} />
          <Route path="/admin/colecciones" element={<AdminCollections />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
          <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        </Route>

{/* User routes - protected by UserRoute */}
        <Route element={<UserRoute><UserLayout /></UserRoute>}>
          <Route path="/perfil" element={<ProfileDashboard />} />
          <Route path="/perfil/pedidos" element={<OrderHistory />} />
          <Route path="/perfil/pedidos/:id" element={<OrderDetail />} />
          <Route path="/perfil/direcciones" element={<AddressesPage />} />
          <Route path="/cambiar-contrasena" element={<ChangePasswordPage />} />
        </Route>

        {/* Redirect after login based on role */}
        <Route path="/login-redirect" element={<LoginRedirect />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
