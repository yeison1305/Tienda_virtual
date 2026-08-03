import { useState, FormEvent } from "react";
import { api } from "../../services/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await api.subscribeNewsletter(email);
      setStatus("success");
      setMessage(res.message);
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message.includes("400") ? "Ya estás suscrito" : "Error al suscribirse");
    }
  };

  return (
    <section className="py-20 px-4 md:px-8 lg:px-10 border-t border-white/5">
      <div className="max-w-2xl">
        <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-4">
          Comunidad
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase leading-none mb-8">
          Únete a nuestra comunidad
        </h2>
        <form className="flex flex-col sm:flex-row gap-4 sm:gap-0" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-white text-black px-8 py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Suscribirse"}
          </button>
        </form>
        {status === "success" && (
          <p className="mt-3 text-xs text-green-400">{message}</p>
        )}
        {status === "error" && (
          <p className="mt-3 text-xs text-red-400">{message}</p>
        )}
      </div>
    </section>
  );
}
