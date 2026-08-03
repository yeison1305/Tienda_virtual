import { useEffect, useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api, ApiCategory } from '../../services/api';
import { ImageUpload } from '../../components/ui/ImageUpload';

interface CategoryForm {
  name: string;
  slug: string;
  image: string;
}

const emptyCategory: CategoryForm = { name: '', slug: '', image: '' };

export function AdminCategories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>({ ...emptyCategory });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.adminGetCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyCategory });
    setShowForm(true);
  };

  const openEdit = (c: ApiCategory) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, image: c.image || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const data = { name: form.name, slug: form.slug, image: form.image || null };
      if (editingId) {
        await api.adminUpdateCategory(editingId, data);
      } else {
        await api.adminCreateCategory(data);
      }
      setShowForm(false);
      load();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    try {
      await api.adminDeleteCategory(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase">Categorías</h1>
          <p className="text-white/30 text-sm mt-1">Gestiona las categorías de la tienda</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black px-5 py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors rounded-lg cursor-pointer">
          <Plus size={16} />
          Nueva categoría
        </button>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">#</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Nombre</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Slug</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Productos</th>
                <th className="text-right px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={5} className="px-6 py-5"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-white/20 text-sm">No hay categorías</td></tr>
              ) : (
                categories.map((c, idx) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-3 text-sm text-white/50">{idx + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium">{c.name}</td>
                    <td className="px-6 py-3 text-sm text-white/50 font-mono">{c.slug}</td>
                    <td className="px-6 py-3 text-sm text-white/60">
                      {c._count?.products ?? 0} productos
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-10">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl w-full max-w-md mx-4 relative">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-lg font-bold uppercase tracking-wider">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" placeholder="Ej: Camisetas" required />
              </div>

              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" placeholder="Ej: camisetas" required />
                <p className="text-xs text-white/20 mt-1">Solo minúsculas, números y guiones. Se usará en la URL.</p>
              </div>

              <div>
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm(f => ({ ...f, image: url }))}
                  label="Imagen de la categoría"
                  maxSizeMB={5}
                />
                <p className="text-xs text-white/20 mt-1">Se usará en la home y página de categoría. JPG, PNG, WebP · Máx 5MB</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 text-white py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/10 transition-colors rounded-lg cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-white text-black py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors disabled:opacity-50 rounded-lg cursor-pointer">
                  {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}