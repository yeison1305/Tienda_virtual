import { motion } from "motion/react";

export function Ticker() {
  return (
    <div className="overflow-hidden bg-white text-black py-3 border-y border-white/10">
      <motion.div
        animate={{ x: "-50%" }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap w-max text-xs tracking-[0.3em] uppercase font-bold">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="flex items-center gap-8">
            NUEVA COLECCIÓN <span className="text-black/30">•</span> FW 2025 <span className="text-black/30">•</span> ENVÍOS NACIONALES <span className="text-black/30">•</span> LIMITED DROPS
          </span>
        ))}
      </motion.div>
    </div>
  );
}
