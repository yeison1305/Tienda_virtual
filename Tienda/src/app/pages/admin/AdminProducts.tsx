import { useEffect, useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown } from 'lucide-react';
import { api, ApiProduct, ApiCategory, ApiCollection } from '../../services/api';
import { ImageUpload } from '../../components/ui/ImageUpload';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

interface VariantForm {
  id?: string;
  size: string;
  color: string;
  stock: number;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number;
  categoryId: string;
  image: string;        // main image (uploaded via drag-drop)
  additionalImages: string;  // comma-separated URLs for additional images
  active: boolean;
  variants: VariantForm[];
  collectionIds: string[];
}

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'];

const emptyVariant: VariantForm = { size: STANDARD_SIZES[0], color: '', stock: 0 };
const emptyProduct: ProductForm = {
  name: '', description: '', price: 0, compareAtPrice: 0,
  categoryId: '', image: '', additionalImages: '', active: true,
  variants: [{ ...emptyVariant }], collectionIds: [],
};

export function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyProduct });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.adminGetProducts(), api.adminGetCategories(), api.getCollections()])
      .then(([p, c, col]) => { setProducts(p); setCategories(c); setCollections(col); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyProduct, categoryId: categories[0]?.id || '', collectionIds: [] });
    setShowForm(true);
  };

  const openEdit = (p: ApiProduct) => {
    setEditingId(p.id);
    const [mainImage, ...additionalImages] = p.images;
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      compareAtPrice: p.compareAtPrice || 0,
      categoryId: p.category.id,
      image: mainImage || '',
      additionalImages: additionalImages.join(', '),
      active: p.active,
      variants: p.variants.length > 0
        ? p.variants.map(v => ({ id: v.id, size: v.size, color: v.color || '', stock: v.stock }))
        : [{ ...emptyVariant }],
      collectionIds: p.collections?.map(c => c.id) || [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const additionalImages = form.additionalImages.split(',').map(s => s.trim()).filter(Boolean);
      const allImages = form.image ? [form.image, ...additionalImages] : additionalImages;
      
      const data = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        compareAtPrice: Number(form.compareAtPrice) || null,
        categoryId: form.categoryId,
        images: allImages,
        active: form.active,
        variants: form.variants.filter(v => v.size),
        collectionIds: form.collectionIds,
      };

      if (editingId) {
        await api.adminUpdateProduct(editingId, data);
      } else {
        await api.adminCreateProduct(data);
      }
      setShowForm(false);
      load();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas DESACTIVAR este producto? (Soft delete)')) return;
    try {
      await api.adminDeleteProduct(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm('⚠️ ELIMINACIÓN PERMANENTE: Se borrará el producto, sus variantes y sus imágenes de Supabase. ¿Continuar?')) return;
    if (!confirm('Última confirmación: ESTA ACCIÓN NO SE PUEDE DESHACER.')) return;
    try {
      await api.adminHardDeleteProduct(id);
      load();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar permanentemente');
    }
  };

  const addVariant = () => setForm(f => ({ ...f, variants: [...f.variants, { ...emptyVariant }] }));
  const removeVariant = (i: number) => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i: number, key: keyof VariantForm, value: any) =>
    setForm(f => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, [key]: value } : v) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase">Productos</h1>
          <p className="text-white/30 text-sm mt-1">Gestiona el catálogo de tu tienda</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black px-5 py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors rounded-lg cursor-pointer">
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      {/* Products table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Imagen</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Nombre</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Categoría</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Precio</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Stock</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Estado</th>
                <th className="text-right px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="px-6 py-5"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-white/20 text-sm">No hay productos</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-3">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-12 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-16 bg-white/5 rounded flex items-center justify-center text-white/10 text-xs">—</div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-sm text-white/50">{p.category?.name || '—'}</td>
                    <td className="px-6 py-3 text-sm font-semibold">{fmt(p.price)}</td>
                    <td className="px-6 py-3 text-sm text-white/60">
                      {p.variants.reduce((sum, v) => sum + v.stock, 0)} uds
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${p.active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer" title="Editar"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all cursor-pointer" title="Desactivar (soft delete)"><Trash2 size={15} /></button>
                        <button onClick={() => handleHardDelete(p.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer" title="Eliminar PERMANENTE (hard delete)"><Trash2 size={15} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-10">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-2xl mx-4 relative">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-lg font-bold uppercase tracking-wider">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" placeholder="Nombre del producto" required />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg resize-none h-24" placeholder="Descripción del producto" />
              </div>

              {/* Price + Compare */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Precio (COP)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 rounded-lg" required />
                </div>
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Precio anterior</label>
                  <input type="number" value={form.compareAtPrice} onChange={e => setForm(f => ({ ...f, compareAtPrice: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 rounded-lg" />
                </div>
              </div>

              {/* Category + Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Categoría</label>
                  <div className="relative">
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 rounded-lg appearance-none cursor-pointer" required>
                      <option value="" disabled>Seleccionar</option>
                      {categories.map(c => <option key={c.id} value={c.id} style={{ background: '#0e0e0e', color: 'white' }}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? 'bg-emerald-500' : 'bg-white/10'}`}
                      onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${form.active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm text-white/60">{form.active ? 'Activo' : 'Inactivo'}</span>
                  </label>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Imagen principal (drag & drop)</label>
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm(f => ({ ...f, image: url }))}
                  label="Imagen principal"
                  maxSizeMB={5}
                />
                <p className="text-xs text-white/20 mt-1">JPG, PNG, WebP · Máx 5MB</p>
              </div>

              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Imágenes adicionales (URLs separadas por coma)</label>
                <input type="text" value={form.additionalImages} onChange={e => setForm(f => ({ ...f, additionalImages: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" placeholder="https://..., https://..." />
                <p className="text-xs text-white/20 mt-1">Opcional: URLs de imágenes extra para la galería del producto</p>
              </div>

              {/* Collections */}
              {collections.length > 0 && (
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Colecciones</label>
                  <div className="flex flex-wrap gap-2">
                    {collections.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-3 py-2 rounded-lg hover:border-white/20 transition-colors">
                        <input
                          type="checkbox"
                          checked={form.collectionIds.includes(c.id)}
                          onChange={e => setForm(f => ({
                            ...f,
                            collectionIds: e.target.checked
                              ? [...f.collectionIds, c.id]
                              : f.collectionIds.filter(id => id !== c.id)
                          }))}
                          className="w-4 h-4 accent-violet-500 rounded border-white/20 bg-white/5" />
                        <span className="text-sm text-white/80">{c.name}</span>
                        {c.tag && <span className="text-[10px] text-white/30 uppercase px-1.5 py-0.5 bg-white/5 rounded">{c.tag}</span>}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-white/20 mt-1">El producto aparecerá en las colecciones seleccionadas</p>
                </div>
              )}

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-white/40 tracking-widest uppercase">Variantes</label>
                  <button type="button" onClick={addVariant} className="text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer">+ Agregar variante</button>
                </div>
                <div className="space-y-3">
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_80px_40px] gap-2 items-center">
                      <input type="hidden" value={v.id || ''} onChange={e => updateVariant(i, 'id', e.target.value)} />
                      <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}
                        className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 rounded-lg appearance-none cursor-pointer">
                        {STANDARD_SIZES.map(s => <option key={s} value={s} style={{ background: '#0e0e0e', color: 'white' }}>{s}</option>)}
                      </select>
                      <input type="text" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} placeholder="Color"
                        className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" />
                      <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} placeholder="Stock"
                        className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" />
                      {form.variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors cursor-pointer"><X size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 text-white py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/10 transition-colors rounded-lg cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-white text-black py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors disabled:opacity-50 rounded-lg cursor-pointer">
                  {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
