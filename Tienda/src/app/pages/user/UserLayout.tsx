import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Package, MapPin, Settings, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/perfil', icon: LayoutDashboard, label: 'Resumen', end: true },
  { to: '/perfil/pedidos', icon: Package, label: 'Mis pedidos', end: false },
  { to: '/perfil/direcciones', icon: MapPin, label: 'Direcciones', end: false },
  { to: '/perfil/cuenta', icon: Settings, label: 'Configuración', end: false },
];

export function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-[#080808] text-white flex">
      <aside className="w-64 fixed top-0 left-0 bottom-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
        <div className="px-6 py-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h1 className="text-base font-black tracking-[0.2em] uppercase">VOID</h1>
              <p className="text-[10px] text-white/30 tracking-widest uppercase">Mi Cuenta</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 text-white border border-white/10'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xs font-bold uppercase">
              {user?.email?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-[10px] text-violet-400 uppercase tracking-wider">Cliente</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-red-400 transition-colors w-full cursor-pointer"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen pt-16">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}