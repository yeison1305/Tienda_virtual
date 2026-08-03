import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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

const tabs = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'PAID', label: 'Pagados' },
  { key: 'SHIPPED', label: 'Enviados' },
  { key: 'DELIVERED', label: 'Entregados' },
];

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.adminGetOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.adminUpdateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado');
    }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase">Pedidos</h1>
        <p className="text-white/30 text-sm mt-1">Gestiona los pedidos de tus clientes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-xl w-full lg:w-fit overflow-x-auto whitespace-nowrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 text-xs tracking-widest uppercase font-medium rounded-lg transition-all cursor-pointer ${
              filter === t.key
                ? 'bg-white text-black'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="w-10 px-4 py-3" />
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">ID</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Cliente</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Artículos</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Total</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Estado</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-6 py-5"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-white/20 text-sm">No hay pedidos</td></tr>
              ) : (
                filtered.map(order => (
                  <>
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-4">
                        <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className="p-1 text-white/20 hover:text-white/60 transition-colors cursor-pointer">
                          {expandedId === order.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-white/60">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/70">{order.user?.email || order.guestEmail || '—'}</p>
                        {order.shippingName && <p className="text-xs text-white/30 mt-0.5">{order.shippingName}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/50">{order.items?.length || 0} items</td>
                      <td className="px-6 py-4 text-sm font-semibold">{fmt(order.total)}</td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            className={`text-[11px] px-2.5 py-1.5 rounded-full border font-medium appearance-none cursor-pointer pr-6 bg-transparent ${statusColors[order.status] || ''}`}
                          >
                            {Object.entries(statusLabels).map(([k, v]) => (
                              <option key={k} value={k} className="bg-[#0e0e0e] text-white">{v}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                    </tr>
                    {/* Expanded details */}
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="border-b border-white/5">
                        <td colSpan={7} className="px-10 py-4 bg-white/[0.02]">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium uppercase tracking-wider">
                              Pago contra entrega
                            </span>
                            {order.paymentStatus && (
                              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium uppercase tracking-wider ${
                                order.paymentStatus === 'PAID'
                                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                  : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                              }`}>
                                {order.paymentStatus === 'PAID' ? 'Cobrado' : 'Cobro pendiente'}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-3">Artículos</p>
                              <div className="space-y-2">
                                {order.items?.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                    <div>
                                      <span className="text-white/70">{item.variant?.product?.name || '—'}</span>
                                      <span className="text-white/30 ml-2">({item.variant?.size})</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-white/40">{item.quantity}x</span>
                                      <span className="text-white/70 ml-2">{fmt(item.unitPrice)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Shipping */}
                            <div>
                              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-3">Envío</p>
                              <div className="text-sm space-y-1">
                                <p className="text-white/60">{order.shippingName || '—'}</p>
                                <p className="text-white/40">{order.shippingAddress}</p>
                                <p className="text-white/40">{order.shippingCity}, {order.shippingDepartment}</p>
                                <p className="text-white/40">Tel: {order.shippingPhone}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
