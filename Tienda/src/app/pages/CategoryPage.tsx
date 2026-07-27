import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { useCategories } from "../hooks/useCategories";
import { fmt } from "../data";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { ApiProduct } from "../services/api";

function discountPct(p: ApiProduct) {
  if (!p.compareAtPrice || p.compareAtPrice === 0) return null;
  return Math.round((1 - p.price / p.compareAtPrice) * 100);
}

function variantColors(p: ApiProduct): string[] {
  const seen = new Set<string>();
  return p.variants
    .filter((v) => {
      if (!v.color || seen.has(v.color)) return false;
      seen.add(v.color);
      return true;
    })
    .map((v) => v.color!);
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { categories } = useCategories();
  const { products, loading } = useProducts({ category: slug });
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<string[]>([]);

  const category = categories.find((c) => c.slug === slug);
  const categoryName = category?.name ?? slug;

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-10 tracking-widest uppercase">
        <ArrowLeft size={14} />
        Volver
      </Link>

      <div className="mb-10">
        <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-2">Categoría</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase">{categoryName}</h1>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#181818] animate-pulse">
              <div className="aspect-[3/4] bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-4 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/30 text-lg mb-6">No hay productos en esta categoría</p>
          <Link to="/" className="bg-white text-black px-8 py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors inline-block cursor-pointer">
            Explorar otros productos
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="group bg-[#181818] overflow-hidden"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                {discountPct(p) && (
                  <div className="absolute top-3 left-3 bg-white text-black text-[9px] font-black tracking-widest uppercase px-2 py-1">
                    -{discountPct(p)}%
                  </div>
                )}
                <button
                  onClick={() =>
                    setWishlist((w) =>
                      w.includes(p.id) ? w.filter((x) => x !== p.id) : [...w, p.id],
                    )
                  }
                  className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm hover:bg-black/70 transition-colors z-10 rounded-full cursor-pointer"
                >
                  <Heart
                    size={13}
                    className={`text-white ${wishlist.includes(p.id) ? "fill-white" : ""}`}
                  />
                </button>
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                  <button
                    onClick={() => addItem(p)}
                    className="w-full py-3 bg-white text-black text-xs tracking-[0.2em] uppercase font-black cursor-pointer"
                  >
                    + Carrito
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide mb-2">{p.name}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-bold">{fmt(p.price)}</span>
                    {p.compareAtPrice && (
                      <span className="text-xs text-white/25 line-through">{fmt(p.compareAtPrice)}</span>
                    )}
                  </div>
                  {variantColors(p).length > 0 && (
                    <div className="flex gap-1">
                      {variantColors(p).map((c) => (
                        <div key={c} className="w-3 h-3 rounded-full border border-white/20" style={{ background: c }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
