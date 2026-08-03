import { Link } from "react-router";
import { ASSETS } from "../../data";

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden h-[50vh] md:h-[60vh] lg:h-[70vh]">
      <img src={ASSETS.promo} alt="Promo" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 flex items-center px-4 md:px-10 lg:px-20">
        <div className="max-w-xl">
          <p className="text-white/30 tracking-[0.5em] text-xs uppercase mb-4 md:mb-6">Drop Especial</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-none mb-6 md:mb-8 tracking-tight">Descubre la colección que define tu estilo</h2>
          <Link to="/coleccion/nueva-coleccion" className="bg-white text-black px-8 md:px-10 py-3 md:py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors inline-block">
            Ver colección
          </Link>
        </div>
      </div>
    </section>
  );
}
