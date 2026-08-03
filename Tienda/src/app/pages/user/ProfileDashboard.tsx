import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, MapPin, Calendar, CreditCard, Shield } from 'lucide-react';
import { api, ApiOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SHIPPED: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function getOrderNumber(id: string): string {
  const hex = id.replace(/-/g, '').slice(-6).toUpperCase();
  return `ORD-${hex}`;
}

export function ProfileDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders()
      .then(setRecentOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Bienvenido, {user?.email?.split('@')[0]}</h1>
        <p className="text-white/30 text-sm mt-1">Desde aquí puedes gestionar tu cuenta, ver tus pedidos y direcciones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/perfil/pedidos" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Package size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Pedidos recientes</p>
              <p className="text-2xl font-bold">{recentOrders.length}</p>
            </div>
          </div>
        </Link>

        <Link to="/perfil/direcciones" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MapPin size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Direcciones guardadas</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </div>
        </Link>

        <Link to="/cambiar-contrasena" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <Shield size={22} className="text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Seguridad</p>
              <p className="text-2xl font-bold">Cambiar contraseña</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold uppercase tracking-wider">Últimos pedidos</h2>
          <Link to="/perfil/pedidos" className="text-xs text-violet-400 hover:text-violet-300 font-medium">Ver todos →</Link>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 text-sm">No tienes pedidos aún</p>
            <Link to="/" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm font-medium">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map(order => (
              <Link key={order.id} to={`/perfil/pedidos/${order.id}`} className="px-4 md:px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {order.items[0]?.variant?.product?.images?.[0] ? (
                      <img src={order.items[0].variant.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-white/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{getOrderNumber(order.id)}</p>
                    <p className="text-xs text-white/30 truncate">{new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                    <p className="text-sm text-white/40 mt-1 truncate">{order.items.length} producto{order.items.length > 1 ? 's' : ''} · {fmt(order.total)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-bold">{fmt(order.total)}</p>
                  <span className={`text-[11px] px-2 py-1 rounded-full border font-medium ${statusColors[order.status] || 'bg-white/10 text-white/40 border-white/10'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}