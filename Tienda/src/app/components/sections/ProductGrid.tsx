import { useState } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { PRODUCTS, fmt } from "../../data";
import type { ApiProduct } from "../../services/api";
import { Link } from "react-router";

function productImg(p: ApiProduct) {
  return p.images[0] ?? "";
}

function productPrice(p: ApiProduct) {
  return fmt(p.price);
}

function productOriginal(p: ApiProduct) {
  return p.compareAtPrice ? fmt(p.compareAtPrice) : null;
}

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

export function ProductGrid() {
  const { products: apiProducts, loading } = useProducts({ collection: 'best-sellers', limit: 4 });
  const [wishlist, setWishlist] = useState<string[]>([]);

  const hasApiProducts = apiProducts.length > 0;
  const displayProducts = hasApiProducts ? apiProducts : null;

  return (
    <section className="py-8 px-4 md:px-8 lg:px-10 bg-[#0F0F0F]">
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Productos
        </h2>
        <Link to="/categorias" className="text-xs tracking-widest uppercase text-white/40 hover:text-white transition-colors border-b border-white/20 pb-1">
          Ver todos
        </Link>
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

      {!loading && displayProducts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayProducts.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="group bg-[#181818] overflow-hidden"
            >
              <Link to={`/producto/${p.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={productImg(p)}
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setWishlist((w) =>
                        w.includes(p.id)
                          ? w.filter((x) => x !== p.id)
                          : [...w, p.id],
                      )
                    }}
                    className="absolute top-3 right-3 p-2.5 bg-black/40 backdrop-blur-sm hover:bg-black/70 transition-colors z-10 rounded-full"
                  >
                    <Heart
                      size={13}
                      className={`text-white ${wishlist.includes(p.id) ? "fill-white" : ""}`}
                    />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                    <span className="w-full py-3 bg-white text-black text-xs tracking-[0.2em] uppercase font-black cursor-pointer text-center block">
                      Ver detalle
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/producto/${p.id}`} className="block">
                  <p className="text-xs font-bold uppercase tracking-wide mb-2">
                    {p.name}
                  </p>
                </Link>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-bold">{productPrice(p)}</span>
                    {productOriginal(p) && (
                      <span className="text-xs text-white/25 line-through">
                        {productOriginal(p)}
                      </span>
                    )}
                  </div>
                  {variantColors(p).length > 0 && (
                    <div className="flex gap-1">
                      {variantColors(p).map((c) => (
                        <div
                          key={c}
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !displayProducts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRODUCTS.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="group bg-[#181818] overflow-hidden"
            >
              <Link to={`/producto/${p.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                  <div className="absolute top-3 left-3 bg-white text-black text-[9px] font-black tracking-widest uppercase px-2 py-1">
                    -{Math.round((1 - p.price / p.original) * 100)}%
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setWishlist((w) =>
                        w.includes(String(p.id))
                          ? w.filter((x) => x !== String(p.id))
                          : [...w, String(p.id)],
                      )
                    }}
                    className="absolute top-3 right-3 p-2.5 bg-black/40 backdrop-blur-sm hover:bg-black/70 transition-colors z-10 rounded-full"
                  >
                    <Heart
                      size={13}
                      className={`text-white ${wishlist.includes(String(p.id)) ? "fill-white" : ""}`}
                    />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                    <span className="w-full py-3 bg-white text-black text-xs tracking-[0.2em] uppercase font-black cursor-pointer text-center block">
                      Ver detalle
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/producto/${p.id}`} className="block">
                  <p className="text-xs font-bold uppercase tracking-wide mb-2">
                    {p.name}
                  </p>
                </Link>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-bold">{fmt(p.price)}</span>
                    <span className="text-xs text-white/25 line-through">
                      {fmt(p.original)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {p.colors.map((c) => (
                      <div
                        key={c}
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
