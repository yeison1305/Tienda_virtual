import { useEffect, useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown } from 'lucide-react';
import { api, ApiProduct, ApiCategory } from '../../services/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

interface VariantForm {
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number;
  categoryId: string;
  images: string;
  active: boolean;
  variants: VariantForm[];
}

const emptyVariant: VariantForm = { size: '', color: '', stock: 0, sku: '' };
const emptyProduct: ProductForm = {
  name: '', description: '', price: 0, compareAtPrice: 0,
  categoryId: '', images: '', active: true, variants: [{ ...emptyVariant }],
};

export function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyProduct });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.adminGetProducts(), api.adminGetCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyProduct, categoryId: categories[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (p: ApiProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      compareAtPrice: p.compareAtPrice || 0,
      categoryId: p.category.id,
      images: p.images.join(', '),
      active: p.active,
      variants: p.variants.length > 0
        ? p.variants.map(v => ({ size: v.size, color: v.color || '', stock: v.stock, sku: v.sku }))
        : [{ ...emptyVariant }],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        compareAtPrice: Number(form.compareAtPrice) || null,
        categoryId: form.categoryId,
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        active: form.active,
        variants: form.variants.filter(v => v.size && v.sku),
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
    if (!confirm('¿Estás seguro de que deseas desactivar este producto?')) return;
    try {
      await api.adminDeleteProduct(id);
      load();
    } catch (err) {
      console.error(err);
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
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"><Trash2 size={15} /></button>
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
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 rounded-lg appearance-none cursor-pointer" required>
                      <option value="" disabled>Seleccionar</option>
                      {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0e0e0e]">{c.name}</option>)}
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
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Imágenes (URLs separadas por coma)</label>
                <input type="text" value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" placeholder="https://..." />
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-white/40 tracking-widest uppercase">Variantes</label>
                  <button type="button" onClick={addVariant} className="text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer">+ Agregar variante</button>
                </div>
                <div className="space-y-3">
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_80px_1fr_40px] gap-2 items-center">
                      <input type="text" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} placeholder="Talla"
                        className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" />
                      <input type="text" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} placeholder="Color"
                        className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" />
                      <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} placeholder="Stock"
                        className="bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" />
                      <input type="text" value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="SKU"
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
