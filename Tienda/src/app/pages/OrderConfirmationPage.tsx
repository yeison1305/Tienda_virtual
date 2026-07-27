import { useParams, Link } from "react-router";
import { Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-black" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase mb-4">Pedido confirmado</h1>
        <p className="text-white/30 text-sm mb-2">Tu pedido ha sido registrado exitosamente</p>
        <p className="text-xs text-white/20 mb-8">ID: {id}</p>

        <div className="bg-[#181818] p-6 mb-8 text-left">
          <p className="text-xs text-white/40 tracking-widest uppercase mb-3">¿Qué sigue?</p>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex gap-3">
              <span className="text-white/20">1.</span>
              Recibirás un email de confirmación con los detalles de tu pedido
            </li>
            <li className="flex gap-3">
              <span className="text-white/20">2.</span>
              Prepararemos tu pedido en 1-2 días hábiles
            </li>
            <li className="flex gap-3">
              <span className="text-white/20">3.</span>
              Te notificaremos cuando esté en camino
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="bg-white text-black px-8 py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors cursor-pointer">
            Seguir comprando
          </Link>
          {!user && (
            <Link to="/login" className="border border-white/20 text-white/60 px-8 py-4 text-xs tracking-[0.3em] uppercase hover:border-white/40 transition-colors cursor-pointer">
              Iniciar sesión para rastrear
            </Link>
          )}
          {user && (
            <Link to="/cuenta" className="border border-white/20 text-white/60 px-8 py-4 text-xs tracking-[0.3em] uppercase hover:border-white/40 transition-colors cursor-pointer">
              Ver mis pedidos
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
