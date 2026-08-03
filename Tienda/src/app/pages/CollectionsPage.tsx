import { Link } from "react-router";
import { motion } from "motion/react";
import { useCollections } from "../hooks/useCollections";
import { COLL_IMGS, COLLECTIONS } from "../data";

export function CollectionsPage() {
  const { collections: apiCollections, loading } = useCollections();

  const hasApi = apiCollections.length > 0;
  const display = hasApi
    ? apiCollections
    : COLLECTIONS.map((c, i) => ({ ...c, image: COLL_IMGS[i] }));

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20">
      <div className="mb-10">
        <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-2">Colecciones</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase">Nuestras Colecciones</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {display.map((c, i) => (
          <Link to={`/coleccion/${c.slug}`} key={c.slug ?? `collection-${i}`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden bg-white/5 cursor-pointer"
            >
              <div className="aspect-[4/5]">
                <img
                  src={c.image ?? COLL_IMGS[i % COLL_IMGS.length]}
                  alt={c.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-[9px] tracking-[0.5em] uppercase text-white/30">
                    {c.tag}
                  </span>
                  <p className="text-xl font-bold uppercase mt-1">{c.name}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </main>
  );
}