import { Link } from "react-router";
import { Trash2, Plus, Minus, ArrowLeft, LogIn } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { fmt } from "../data";

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-10 tracking-widest uppercase">
        <ArrowLeft size={14} />
        Seguir comprando
      </Link>

      <h1 className="text-4xl md:text-5xl font-black uppercase mb-10">Carrito</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-lg mb-6">Tu carrito está vacío</p>
          <Link to="/" className="bg-white text-black px-8 py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors inline-block cursor-pointer">
            Explorar productos
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-10">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 bg-[#181818] p-4">
                <img src={item.image} alt={item.name} className="w-20 h-28 object-cover" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide">{item.name}</p>
                    {item.size && <p className="text-xs text-white/40 mt-1">Talla: {item.size}</p>}
                    {item.color && <p className="text-xs text-white/40">Color: {item.color}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="text-white/40 hover:text-white cursor-pointer">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="text-white/40 hover:text-white cursor-pointer">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold">{fmt(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(idx)} className="text-white/20 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <p className="text-xs text-white/30 tracking-widest uppercase mb-1">{totalItems} artículos</p>
                <p className="text-2xl font-black">Total: {fmt(totalPrice)}</p>
              </div>
              <button onClick={clearCart} className="border border-white/20 text-white/60 px-6 py-3 text-xs tracking-widest uppercase hover:border-white/40 transition-colors cursor-pointer">
                Vaciar
              </button>
            </div>

            {!user && (
              <div className="bg-[#181818] p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <LogIn size={18} className="text-white/40" />
                  <div>
                    <p className="text-sm font-bold">¿Quieres seguir tu pedido?</p>
                    <p className="text-xs text-white/30">Inicia sesión para rastrear el estado de tu compra</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/login" className="border border-white/20 text-white/60 px-5 py-2 text-xs tracking-widest uppercase hover:border-white/40 transition-colors cursor-pointer">
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" className="bg-white/10 text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-white/20 transition-colors cursor-pointer">
                    Crear cuenta
                  </Link>
                </div>
              </div>
            )}

            <Link to="/checkout" className="block w-full bg-white text-black py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors text-center cursor-pointer">
              {user ? 'Finalizar compra' : 'Continuar sin sesión'}
            </Link>

            {!user && (
              <p className="text-center text-xs text-white/20 mt-3">
                Podrás completar tu compra, pero no podrás rastrear tu pedido sin iniciar sesión
              </p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
