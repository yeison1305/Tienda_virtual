import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Shield, Mail, Layers, Tag, Menu, X, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/productos', icon: Package, label: 'Productos', end: false },
  { to: '/admin/colecciones', icon: Layers, label: 'Colecciones', end: false },
  { to: '/admin/categorias', icon: Tag, label: 'Categorías', end: false },
  { to: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos', end: false },
  { to: '/admin/newsletter', icon: Mail, label: 'Newsletter', end: false },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
      isActive
        ? 'bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 text-white border border-white/10'
        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
    }`;

  const nav = (
    <nav className="flex-1 px-3 py-6 space-y-1">
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={navLinkClass}>
          <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  const userBlock = (
    <div className="px-4 py-5 border-t border-white/5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xs font-bold uppercase">
          {user.email[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{user.email}</p>
          <p className="text-[10px] text-violet-400 uppercase tracking-wider">Admin</p>
        </div>
      </div>
      <button
        onClick={() => { logout(); navigate('/'); }}
        className="flex items-center gap-2 text-xs text-white/30 hover:text-red-400 transition-colors w-full cursor-pointer py-1"
      >
        <LogOut size={14} />
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-[#080808] text-white flex">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 py-3 bg-[#080808]/90 backdrop-blur-sm border-b border-white/5">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2 cursor-pointer" aria-label="Abrir menú">
          <Menu size={22} className="text-white/70" />
        </button>
        <span className="tracking-[0.4em] text-xs font-black uppercase text-white/80">VOID</span>
        <Link to="/" className="p-2 -mr-2 cursor-pointer" aria-label="Volver a la tienda">
          <ArrowLeft size={20} className="text-white/70" />
        </Link>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 fixed top-0 left-0 bottom-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 flex-col z-50">
        <div className="px-6 py-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h1 className="text-base font-black tracking-[0.2em] uppercase">VOID</h1>
              <p className="text-[10px] text-white/30 tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
        </div>
        {nav}
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="w-4/5 max-w-sm bg-[#0a0a0a] h-full border-r border-white/5 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <span className="text-base font-black tracking-[0.2em] uppercase">VOID</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 cursor-pointer" aria-label="Cerrar menú">
                  <X size={22} className="text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{nav}</div>
              {userBlock}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 min-h-screen pt-16 lg:pt-0 lg:ml-64">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
