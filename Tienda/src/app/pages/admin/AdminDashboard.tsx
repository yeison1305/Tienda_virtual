import { useEffect, useState } from 'react';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { api } from '../../services/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SHIPPED: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black uppercase">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Ventas', value: fmt(stats?.totalRevenue || 0), icon: DollarSign, gradient: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Pedidos', value: stats?.totalOrders || 0, icon: ShoppingCart, gradient: 'from-violet-500/20 to-violet-500/5' },
    { label: 'Productos', value: stats?.totalProducts || 0, icon: Package, gradient: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Clientes', value: stats?.totalUsers || 0, icon: Users, gradient: 'from-fuchsia-500/20 to-fuchsia-500/5' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase">Dashboard</h1>
        <p className="text-white/30 text-sm mt-1">Resumen general de tu tienda</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} border border-white/10 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/40 tracking-widest uppercase">{label}</span>
              <Icon size={18} className="text-white/20" />
            </div>
            <p className="text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Pedidos recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">ID</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Cliente</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Total</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Estado</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white/60">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-white/70">{order.user?.email || order.guestEmail || '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{fmt(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${statusColors[order.status] || ''}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40">
                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-white/20 text-sm">No hay pedidos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
