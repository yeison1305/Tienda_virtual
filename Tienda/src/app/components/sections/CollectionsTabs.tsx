import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useProducts } from "../../hooks/useProducts";
import { COLLECTIONS, COLL_IMGS } from "../../data";

export function CollectionsTabs() {
  const [activeCol, setActiveCol] = useState(0);
  const { products: apiProducts } = useProducts();

  const hasApi = apiProducts.length > 0;

  return (
    <section className="py-20 px-4 md:px-8 lg:px-10 bg-[#0F0F0F]">
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-3xl md:text-4xl font-black uppercase">Colecciones</h2>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {COLLECTIONS.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setActiveCol(i)}
            className={`whitespace-nowrap text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200 ${
              activeCol === i
                ? "bg-white text-black border-white"
                : "border-white/10 text-white/40 hover:border-white/30"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCol}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          {[0, 1, 2].map((idx) => {
            const mappedIdx = (idx + activeCol) % COLLECTIONS.length;

            if (hasApi) {
              const productIdx = (idx + activeCol * 3) % apiProducts.length;
              const product = apiProducts[productIdx];
              return (
                <motion.div
                  key={`${activeCol}-${idx}`}
                  whileHover={{ scale: 1.01 }}
                  className="group relative overflow-hidden bg-white/5 cursor-pointer"
                >
                  <div className="aspect-[4/5]">
                    <img
                      src={product.images[0] ?? ""}
                      alt={product.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black" />
                    <div className="absolute bottom-6 left-6">
                      <span className="text-[9px] tracking-[0.5em] uppercase text-white/30">
                        {COLLECTIONS[mappedIdx].tag}
                      </span>
                      <p className="text-xl font-bold uppercase mt-1">
                        {product.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={`${activeCol}-${idx}`}
                whileHover={{ scale: 1.01 }}
                className="group relative overflow-hidden bg-white/5 cursor-pointer"
              >
                <div className="aspect-[4/5]">
                  <img
                    src={COLL_IMGS[mappedIdx]}
                    alt={COLLECTIONS[mappedIdx].name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black" />
                  <div className="absolute bottom-6 left-6">
                    <span className="text-[9px] tracking-[0.5em] uppercase text-white/30">
                      {COLLECTIONS[mappedIdx].tag}
                    </span>
                    <p className="text-xl font-bold uppercase mt-1">
                      {COLLECTIONS[mappedIdx].name}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
