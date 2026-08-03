import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api, ApiOrder } from '../../services/api';
import { Package, ChevronRight, Shield, Hash } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SHIPPED: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function getOrderNumber(id: string): string {
  const hex = id.replace(/-/g, '').slice(-6).toUpperCase();
  return `ORD-${hex}`;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export function OrderHistory() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase">Mis pedidos</h1>
        <p className="text-white/30 text-sm mt-1">Historial de compras</p>
      </div>

      {loading ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-16 text-center">
          <Package size={64} className="mx-auto text-white/10 mb-6" />
          <h2 className="text-xl font-bold mb-2">No tienes pedidos aún</h2>
          <p className="text-white/30 text-sm mb-6">Cuando realices tu primera compra aparecerá aquí</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors rounded-lg">
            <Shield size={14} />
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/perfil/pedidos/${order.id}`}
              className="flex items-center justify-between p-4 md:p-6 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-16 h-20 md:w-20 md:h-20 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {order.items[0]?.variant?.product?.images?.[0] ? (
                    <img src={order.items[0].variant.product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={28} className="text-white/20" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{getOrderNumber(order.id)}</p>
                  <p className="text-xs text-white/30 truncate">{new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm text-white/40 mt-1 truncate">{order.items.length} producto{order.items.length > 1 ? 's' : ''} · {fmt(order.total)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] px-3 py-1 rounded-full border font-medium ${statusColors[order.status] || 'bg-white/10 text-white/40 border-white/10'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
                <ChevronRight size={16} className="text-white/20" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}