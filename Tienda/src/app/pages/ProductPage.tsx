import { useState, FormEvent, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Check, Minus, Plus, Heart, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useProduct } from "../hooks/useProduct";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { fmt } from "../data";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id!);
  const { addItem } = useCart();
  const { user } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const availableColors = product?.variants
    ?.filter((v) => v.color && v.stock > 0 && (!selectedSize || v.size === selectedSize))
    .map((v) => v.color!)
    .filter((v, i, arr) => arr.indexOf(v) === i) ?? [];

  const availableSizes = product?.variants
    ?.filter((v) => v.size && v.stock > 0 && (!selectedColor || v.color === selectedColor))
    .map((v) => v.size)
    .filter((v, i, arr) => arr.indexOf(v) === i) ?? [];

  // Reset selection if no longer available
  const isColorValid = !selectedColor || availableColors.includes(selectedColor);
  const isSizeValid = !selectedSize || availableSizes.includes(selectedSize);

  const currentVariant = product?.variants.find(
    (v) =>
      (!selectedSize || v.size === selectedSize) &&
      (!selectedColor || v.color === selectedColor) &&
      v.stock > 0,
  );

  // Reset invalid selections when dependencies change
  useEffect(() => {
    if (selectedColor && !availableColors.includes(selectedColor)) {
      setSelectedColor(null);
    }
  }, [availableColors, selectedColor]);

  useEffect(() => {
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
  }, [availableSizes, selectedSize]);

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;
    addItem(product, { size: currentVariant.size, color: currentVariant.color ?? undefined, quantity });
    navigate("/carrito");
  };

  if (loading) {
    return (
      <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/30 text-lg mb-6">Producto no encontrado</p>
          <Link to="/" className="bg-white text-black px-8 py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors inline-block cursor-pointer">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20 bg-[#080808]">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-10 tracking-widest uppercase cursor-pointer"
      >
        <ArrowLeft size={14} />
        Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="sticky top-28">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#181818]">
            <motion.img
              src={product.images[0] ?? ""}
              alt={product.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full object-cover"
            />
            {discountPct && (
              <div className="absolute top-4 left-4 bg-white text-black text-[9px] font-black tracking-widest uppercase px-3 py-1">
                -{discountPct}%
              </div>
            )}
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm hover:bg-black/70 transition-colors z-10 rounded-full cursor-pointer"
            >
              <Heart
                size={20}
                className={`text-white ${wishlisted ? "fill-white" : ""}`}
              />
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.slice(0, 4).map((img, idx) => (
                <motion.img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-square object-cover cursor-pointer hover:opacity-80 transition-opacity rounded"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-white/30 tracking-[0.4em] text-xs uppercase mb-2">
              {product.category.name}
            </p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-2xl font-bold">{fmt(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-white/25 line-through">
                  {fmt(product.compareAtPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-white/60 text-sm leading-relaxed mb-6">{product.description}</p>
            )}
          </div>

          <div className="space-y-6">
            {availableColors.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-xs tracking-widest uppercase text-white/40">
                  Color
                </legend>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setSelectedColor(selectedColor === color ? null : color)
                      }
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-white scale-110"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      style={{ background: color }}
                      aria-pressed={selectedColor === color}
                    >
                      <AnimatePresence>
                        {selectedColor === color && (
                          <Check
                            className="absolute inset-0 flex items-center justify-center text-white"
                            size={14}
                          />
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {availableSizes.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-xs tracking-widest uppercase text-white/40">
                  Talla
                </legend>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSelectedSize(selectedSize === size ? null : size)
                      }
                      disabled={!product.variants.some((v) => v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10"
                      } ${
                        !product.variants.some(
                          (v) =>
                            v.size === size &&
                            (!selectedColor || v.color === selectedColor) &&
                            v.stock > 0
                        )
                          ? "opacity-30 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="flex items-center gap-4">
              <label className="text-xs tracking-widest uppercase text-white/40 mr-2">
                Cantidad
              </label>
              <div className="flex items-center border border-white/10 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-white/40 hover:text-white transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-white/40 hover:text-white transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {availableSizes.length > 0 && selectedSize === null && (
              <p className="text-xs text-yellow-400 mb-2">Selecciona una talla</p>
            )}
            {availableColors.length > 0 && selectedColor === null && (
              <p className="text-xs text-yellow-400 mb-2">Selecciona un color</p>
            )}

            <button
              onClick={handleAddToCart}
              disabled={
                !currentVariant ||
                currentVariant.stock < quantity ||
                (availableSizes.length > 0 && selectedSize === null) ||
                (availableColors.length > 0 && selectedColor === null)
              }
              className="w-full bg-white text-black py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              + Añadir al carrito
            </button>

            {!user && (
              <p className="text-center text-xs text-white/20">
                ¿Quieres rastrear tu pedido?{" "}
                <Link to="/login" className="text-white/40 hover:text-white underline">
                  Inicia sesión
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}