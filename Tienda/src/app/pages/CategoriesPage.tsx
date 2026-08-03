import { Link } from "react-router";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { CATEGORIES } from "../data";

export function CategoriesPage() {
  const { categories: apiCategories, loading } = useCategories();

  const hasApi = apiCategories.length > 0;
  const display = hasApi
    ? apiCategories.map((c) => ({
        name: c.name,
        slug: c.slug,
        img: c.image || '',
      }))
    : CATEGORIES.map((c) => ({
        name: c.name,
        slug: c.name.toLowerCase(),
        img: c.img,
      }));

  return (
    <section className="py-20 px-4 md:px-8 lg:px-10 bg-[#0F0F0F]">
      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-10">Categorías</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {(loading ? CATEGORIES.map((c) => ({ ...c, slug: c.name.toLowerCase() })) : display).map((c, i) => (
          <Link to={`/categoria/${c.slug}`} key={c.name}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className="group relative cursor-pointer overflow-hidden bg-white/5"
            >
              <div className="aspect-[3/4]">
                {c.img ? (
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-400"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Plus size={32} className="text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs text-white/40 tracking-widest uppercase mb-1">
                    0{i + 1}
                  </p>
                  <p className="text-sm font-bold uppercase tracking-wide">{c.name}</p>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} className="text-white" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}