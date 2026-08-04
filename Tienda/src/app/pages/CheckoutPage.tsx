import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check, MapPin, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api, ApiAddress } from "../services/api";
import { fmt } from "../data";
import { isValidEmail, isValidPhone } from "../utils/validation";

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedAddresses, setSavedAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      api.getAddresses()
        .then(setSavedAddresses)
        .catch(console.error);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const applyAddress = (addr: ApiAddress) => {
    setName(addr.recipientName || "");
    setPhone(addr.phone);
    setAddress(addr.line1);
    setCity(addr.city);
    setDepartment(addr.department);
    setSelectedAddressId(addr.id);
    setShowAddressSelector(false);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/30 text-lg mb-6">No hay artículos para comprar</p>
          <Link to="/" className="bg-white text-black px-8 py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors inline-block cursor-pointer">
            Explorar productos
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if ((name || "").trim().length < 3) errors.name = "El nombre debe tener al menos 3 caracteres";
    if (!isValidPhone(phone)) errors.phone = "El teléfono debe tener entre 7 y 15 dígitos";
    if ((address || "").trim().length < 5) errors.address = "La dirección debe tener al menos 5 caracteres";
    if ((city || "").trim().length < 2) errors.city = "La ciudad es obligatoria";
    if ((department || "").trim().length < 2) errors.department = "El departamento es obligatorio";
    if (!user && !isValidEmail(email)) errors.email = "El email no tiene un formato válido";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Revisa los campos marcados");
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        variantId: item.variantId || item.productId,
        quantity: item.quantity,
      }));

      const fingerprint = orderItems
        .map((i) => `${i.variantId}:${i.quantity}`)
        .sort()
        .join("|");
      let requestKey = sessionStorage.getItem("void_checkout_key");
      if (!requestKey || sessionStorage.getItem("void_checkout_fingerprint") !== fingerprint) {
        requestKey = crypto.randomUUID();
        sessionStorage.setItem("void_checkout_key", requestKey);
        sessionStorage.setItem("void_checkout_fingerprint", fingerprint);
      }

      const data = await api.createOrder({
        items: orderItems,
        guestEmail: user ? undefined : email,
        shipping: { name, phone, address, city, department },
        shippingAddressId: selectedAddressId || undefined,
        requestKey,
      });

      sessionStorage.removeItem("void_checkout_key");
      sessionStorage.removeItem("void_checkout_fingerprint");
      sessionStorage.setItem("void_last_order", JSON.stringify(data));
      clearCart();
      navigate(`/pedido/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20">
      <Link to="/carrito" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-10 tracking-widest uppercase">
        <ArrowLeft size={14} />
        Volver al carrito
      </Link>

      <h1 className="text-4xl md:text-5xl font-black uppercase mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-black uppercase mb-4">Datos de envío</h2>

            {user && savedAddresses.length > 0 && (
              <div className="mb-4">
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Dirección guardada (opcional)</label>
                <button
                  type="button"
                  onClick={() => setShowAddressSelector(!showAddressSelector)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 flex items-center justify-between"
                >
                  <span>{selectedAddressId
                    ? savedAddresses.find(a => a.id === selectedAddressId)?.recipientName || savedAddresses.find(a => a.id === selectedAddressId)?.line1
                    : "Seleccionar dirección guardada"}</span>
                  <ChevronDown size={16} className={showAddressSelector ? "rotate-180" : ""} />
                </button>
                {showAddressSelector && (
                  <div className="mt-2 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    {savedAddresses.map(addr => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => applyAddress(addr)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
                          selectedAddressId === addr.id
                            ? "bg-violet-500/20 text-violet-400"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <MapPin size={14} className="flex-shrink-0" />
                        <div>
                          <p className="font-medium">{addr.recipientName || "Sin nombre"}</p>
                          <p className="text-xs text-white/40">{addr.line1}, {addr.city}, {addr.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Nombre completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 ${fieldErrors.name ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="Juan Pérez" required />
              {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Teléfono</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 ${fieldErrors.phone || (phone.length > 0 && !isValidPhone(phone)) ? 'border-red-500/50' : phone.length > 0 ? 'border-emerald-400/50' : 'border-white/10'}`}
                placeholder="300 123 4567" required />
              {fieldErrors.phone || (phone.length > 0 && !isValidPhone(phone)) ? (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.phone || 'Entre 7 y 15 dígitos, solo números'}</p>
              ) : phone.length > 0 ? (
                <p className="text-xs text-emerald-400 mt-1">✓ Formato correcto</p>
              ) : (
                <p className="text-xs text-white/30 mt-1">Entre 7 y 15 dígitos, solo números</p>
              )}
            </div>
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Dirección</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 ${fieldErrors.address ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="Calle 123 #45-67" required />
              {fieldErrors.address && <p className="text-xs text-red-400 mt-1">{fieldErrors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Ciudad</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 ${fieldErrors.city ? 'border-red-500/50' : 'border-white/10'}`}
                  placeholder="Bogotá" required />
                {fieldErrors.city && <p className="text-xs text-red-400 mt-1">{fieldErrors.city}</p>}
              </div>
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Departamento</label>
                <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                  className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 ${fieldErrors.department ? 'border-red-500/50' : 'border-white/10'}`}
                  placeholder="Cundinamarca" required />
                {fieldErrors.department && <p className="text-xs text-red-400 mt-1">{fieldErrors.department}</p>}
              </div>
</div>
        </div>

        {!user && (
          <div>
            <h2 className="text-lg font-black uppercase mb-4">Email (para recibir el confirmación)</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 ${fieldErrors.email ? 'border-red-500/50' : 'border-white/10'}`}
              placeholder="tucorreo@ejemplo.com" required />
            {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
          </div>
        )}

        <div className="bg-[#181818] border border-white/10 p-6">
          <h2 className="text-lg font-black uppercase mb-4">Método de pago</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={18} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase">Pago contra entrega</p>
              <p className="text-xs text-white/40 mt-0.5">Pagas en efectivo al recibir tu pedido en la dirección de entrega</p>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-white text-black py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer">
        {loading ? "Procesando..." : "Confirmar pedido"}
      </button>

        {!user && (
          <p className="text-xs text-white/20 text-center">
            ¿Quieres rastrear tu pedido? <Link to="/login" className="text-white/40 hover:text-white underline">Inicia sesión</Link>
          </p>
        )}
      </form>

      <div className="bg-[#181818] p-6 h-fit">
        <h2 className="text-lg font-black uppercase mb-6">Resumen del pedido</h2>
        <div className="space-y-4 mb-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <img src={item.image} alt={item.name} className="w-14 h-20 object-cover" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase">{item.name}</p>
                <p className="text-xs text-white/30">Cant: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold">{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Subtotal</span>
            <span>{fmt(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span>Envío</span>
            <span>Gratis</span>
          </div>
          <div className="flex justify-between text-lg font-black pt-2 border-t border-white/10">
            <span>Total</span>
            <span>{fmt(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
</main>
  );
}