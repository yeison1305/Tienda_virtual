import { useState } from "react";
import { Link } from "react-router";
import { Menu, Search, ShoppingBag, X, User, LogOut, Shield, Package, MapPin, Settings, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export function Nav() {
  const [nav, setNav] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 lg:px-10 py-5 bg-[#080808]/90 backdrop-blur-sm border-b border-white/5">
        <button onClick={() => setNav(!nav)} className="cursor-pointer">
          <Menu size={20} className="text-white/60 hover:text-white transition-colors" />
        </button>
        <Link to="/" className="tracking-[0.4em] text-sm font-black uppercase bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          VOID
        </Link>
        <div className="flex gap-4 items-center">
          <Search size={18} className="text-white/60 hover:text-white transition-colors cursor-pointer" />
          {isAdmin && (
            <Link to="/admin" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 text-violet-400 text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-violet-500/30 hover:text-violet-300 transition-all cursor-pointer">
              <Shield size={14} />
              Panel Admin
            </Link>
          )}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <User size={16} className="text-white/60" />
                <span className="text-xs text-white/60 hidden sm:block">{user.email.split('@')[0]}</span>
                {userMenu ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#0e0e0e] border border-white/10 rounded-xl shadow-xl py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs font-medium truncate">{user.email}</p>
                      <p className="text-[10px] text-violet-400 uppercase tracking-wider mt-0.5">Cliente</p>
                    </div>
                    <div className="py-2">
                      <Link to="/perfil" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Package size={16} />
                        Mi perfil
                      </Link>
                      <Link to="/perfil/pedidos" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Package size={16} />
                        Mis pedidos
                      </Link>
                      <Link to="/perfil/direcciones" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <MapPin size={16} />
                        Direcciones
                      </Link>
                      <Link to="/cambiar-contrasena" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Lock size={16} />
                        Cambiar contraseña
                      </Link>
                    </div>
                    <div className="border-t border-white/5 pt-2">
                      <button onClick={() => { logout(); setUserMenu(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="cursor-pointer">
              <User size={18} className="text-white/60 hover:text-white transition-colors" />
            </Link>
          )}
          <Link to="/carrito" className="relative cursor-pointer">
            <ShoppingBag size={18} className="text-white/60 hover:text-white transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white text-black text-[8px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {nav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="w-4/5 max-w-sm bg-[#080808] h-full border-r border-white/5 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="tracking-[0.4em] text-sm font-black uppercase text-white">VOID</span>
                <button onClick={() => setNav(false)} className="cursor-pointer">
                  <X size={24} className="text-white/60 hover:text-white" />
                </button>
              </div>
              <div className="flex flex-col gap-6 text-xl font-bold uppercase tracking-widest">
                <Link to="/" onClick={() => setNav(false)} className="hover:text-white/60 transition-colors">Inicio</Link>
                <Link to="/colecciones" onClick={() => setNav(false)} className="hover:text-white/60 transition-colors">Colecciones</Link>
                <Link to="/categorias" onClick={() => setNav(false)} className="hover:text-white/60 transition-colors">Categorías</Link>
              </div>
              {isAdmin && (
                <div className="my-6 border-t border-white/5 pt-6">
                  <Link to="/admin" onClick={() => setNav(false)} className="flex items-center gap-2 px-3 py-2 bg-violet-500/20 text-violet-400 text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-violet-500/30 hover:text-violet-300 transition-all">
                    <Shield size={14} />
                    Panel Admin
                  </Link>
                </div>
              )}
              <div className="mt-auto border-t border-white/5 pt-6">
                {user ? (
                  <div className="space-y-4">
                    <p className="text-xs text-white/30">{user.email}</p>
                    <Link to="/perfil" onClick={() => setNav(false)} className="block text-xs text-white/40 hover:text-white transition-colors">
                      Mi perfil
                    </Link>
                    <Link to="/perfil/pedidos" onClick={() => setNav(false)} className="block text-xs text-white/40 hover:text-white transition-colors">
                      Mis pedidos
                    </Link>
                    <Link to="/perfil/direcciones" onClick={() => setNav(false)} className="block text-xs text-white/40 hover:text-white transition-colors">
                      Direcciones
                    </Link>
                    <Link to="/cambiar-contrasena" onClick={() => setNav(false)} className="block text-xs text-white/40 hover:text-white transition-colors">
                      Cambiar contraseña
                    </Link>
                    <button onClick={() => { logout(); setNav(false); }} className="text-xs text-white/40 hover:text-red-400 transition-colors cursor-pointer">
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link to="/login" onClick={() => setNav(false)} className="block text-xs text-white/40 hover:text-white transition-colors">
                      Iniciar sesión
                    </Link>
                    <Link to="/registro" onClick={() => setNav(false)} className="block text-xs text-white/40 hover:text-white transition-colors">
                      Crear cuenta
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
