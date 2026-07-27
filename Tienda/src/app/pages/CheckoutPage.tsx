import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { fmt } from "../data";

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        variantId: item.variantId || item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user ? { Authorization: `Bearer ${localStorage.getItem("void_token")}` } : {}),
        },
        body: JSON.stringify({
          items: orderItems,
          total: totalPrice,
          guestEmail: user ? user.email : email,
          shipping: { name, phone, address, city, department },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear pedido");

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
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Nombre completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  placeholder="Juan Pérez" required />
              </div>
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Teléfono</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  placeholder="300 123 4567" required />
              </div>
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Dirección</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                  placeholder="Calle 123 #45-67" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Ciudad</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                    placeholder="Bogotá" required />
                </div>
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Departamento</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                    placeholder="Cundinamarca" required />
                </div>
              </div>
            </div>
          </div>

          {!user && (
            <div>
              <h2 className="text-lg font-black uppercase mb-4">Email (para recibir el confirmación)</h2>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                placeholder="tucorreo@ejemplo.com" required />
            </div>
          )}

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
