import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api, ApiOrder, ApiAddress } from '../../services/api';
import { Package, MapPin, Phone, Mail, ChevronLeft, Shield, CheckCircle, Clock, Truck, Home, Hash } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { color: string; label: string; icon: any; step: number }> = {
  PENDING: { color: 'text-yellow-400', label: 'Pendiente / En revisión', icon: Clock, step: 1 },
  PAID: { color: 'text-blue-400', label: 'Pagado / Confirmado', icon: CheckCircle, step: 2 },
  SHIPPED: { color: 'text-violet-400', label: 'Enviado / En camino', icon: Truck, step: 3 },
  DELIVERED: { color: 'text-emerald-400', label: 'Entregado', icon: Home, step: 4 },
  CANCELLED: { color: 'text-red-400', label: 'Cancelado', icon: Shield, step: 0 },
};

function getOrderNumber(id: string): string {
  const hex = id.replace(/-/g, '').slice(-6).toUpperCase();
  return `ORD-${hex}`;
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = id || '';
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    api.getOrderById(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/perfil/pedidos" className="p-2 text-white/30 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black uppercase">Detalle del pedido</h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-1/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/perfil/pedidos" className="p-2 text-white/30 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black uppercase">Detalle del pedido</h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-16 text-center">
          <Package size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30">Pedido no encontrado</p>
          <Link to="/perfil/pedidos" className="mt-4 inline-block text-violet-400 hover:text-violet-300">Volver a mis pedidos</Link>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || statusConfig.PENDING;
  const steps = [
    { key: 'PENDING', label: 'En revisión', icon: Clock },
    { key: 'PAID', label: 'Pagado', icon: CheckCircle },
    { key: 'SHIPPED', label: 'Enviado', icon: Truck },
    { key: 'DELIVERED', label: 'Entregado', icon: Home },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const completedSteps = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/perfil/pedidos" className="p-2 text-white/30 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase">Detalle del pedido</h1>
          <p className="text-white/30 text-sm">{getOrderNumber(order.id)} · {new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-6">Estado del envío</h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
          {steps.map((step, index) => {
            const isCompleted = index < completedSteps;
            const isCurrent = index === currentStepIndex && currentStepIndex >= 0;
            return (
              <div key={step.key} className="relative flex items-start gap-4">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                  isCompleted ? 'bg-emerald-500' : isCurrent ? `bg-${currentStatus.color.replace('text-', 'bg-')}` : 'bg-white/5 border border-white/10'
                }`}>
                  <step.icon size={isCompleted || isCurrent ? 20 : 18} className={isCompleted ? 'text-black' : isCurrent ? 'text-white' : 'text-white/30'} />
                  {!isCompleted && !isCurrent && <div className="absolute -left-2 -top-2 w-16 h-16 border border-white/10 rounded-full" />}
                </div>
                <div className="pt-2 flex-1">
                  <p className={`font-medium ${isCompleted || isCurrent ? 'text-white' : 'text-white/40'}`}>{step.label}</p>
                  {isCurrent && <p className="text-xs text-white/30 mt-1">{currentStatus.label}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-bold uppercase tracking-wider">Productos ({order.items.length})</h3>
          </div>
          <div className="divide-y divide-white/5">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.variant?.product?.images?.[0] ? (
                    <img src={item.variant.product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={28} className="text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.variant?.product?.name || 'Producto'}</p>
                  <p className="text-xs text-white/30">
                    Talla: {item.variant?.size} {item.variant?.color ? `· Color: ${item.variant.color}` : ''}
                  </p>
                  <p className="text-sm text-white/40">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{fmt(item.unitPrice)} c/u</p>
                  <p className="text-sm text-white/40">{fmt(item.unitPrice * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-3">Resumen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Subtotal ({order.items.length} items)</span>
                <span className="text-white">{fmt(order.total)}</span>
              </div>
              <div className="flex justify-between text-white/60 border-t border-white/5 pt-3">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">{fmt(order.total)}</span>
              </div>
              <p className="text-xs text-white/20">Incluye impuestos y envío</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-violet-400" />
              Dirección de envío
            </h3>
            {order.address ? (
              <>
                <p className="font-medium">{order.address.recipientName || order.shippingName || '—'}</p>
                <p className="text-white/60">{order.address.line1}</p>
                <p className="text-white/60">{order.address.city}, {order.address.department}</p>
                {order.address.phone && (
                  <div className="flex items-center gap-2 text-white/60 mt-2">
                    <Phone size={14} />
                    <span>{order.address.phone}</span>
                  </div>
                )}
                <p className="text-xs text-violet-400 mt-2">Dirección guardada vinculada al pedido</p>
              </>
            ) : (
              <>
                <p className="font-medium">{order.shippingName || '—'}</p>
                {order.shippingAddress && <p className="text-white/60">{order.shippingAddress}</p>}
                {order.shippingCity && <p className="text-white/60">{order.shippingCity}, {order.shippingDepartment || ''}</p>}
                {order.shippingPhone && (
                  <div className="flex items-center gap-2 text-white/60 mt-2">
                    <Phone size={14} />
                    <span>{order.shippingPhone}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}