import { motion } from "motion/react";
import { Link } from "react-router";
import { ASSETS } from "../../data";

export function Hero() {
  return (
    <section className="h-svh relative overflow-hidden">
      <img src={ASSETS.heroC} alt="FIVE TO FIVE collection" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#080808]" />
      <div className="absolute inset-0 flex flex-col justify-end pb-24 px-4 md:px-8 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: "easeOut" }}>
          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-white/40 tracking-[0.5em] text-xs uppercase">Drop 001 — 2025</span>
          </div>
          <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[9rem] font-black uppercase leading-none tracking-tighter mb-6 text-white" style={{ lineHeight: 0.85 }}>
            FIVE TO FIVE
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10">
            <Link to="/categorias" className="bg-white text-black px-10 py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors">
              Comprar ahora
            </Link>
            <Link to="/colecciones" className="border border-white/30 text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-medium hover:border-white transition-colors">
              Nueva colección
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
