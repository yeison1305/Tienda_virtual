import { useEffect, useState } from 'react';
import { api, ApiAddress } from '../../services/api';
import { Plus, MapPin, Edit, Trash2, CheckCircle, Home, Star, Phone } from 'lucide-react';
import { isValidPhone } from '../../utils/validation';

interface AddressFormData {
  line1: string;
  city: string;
  department: string;
  phone: string;
  recipientName: string;
  isDefault: boolean;
}

export function AddressesPage() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiAddress | null>(null);
  const [form, setForm] = useState<AddressFormData>({
    line1: '', city: '', department: '', phone: '', recipientName: '', isDefault: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.getAddresses();
      setAddresses(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const errors: Record<string, string> = {};
    if ((form.line1 || '').trim().length < 5) errors.line1 = 'La dirección debe tener al menos 5 caracteres';
    if ((form.city || '').trim().length < 2) errors.city = 'La ciudad es obligatoria';
    if ((form.department || '').trim().length < 2) errors.department = 'El departamento es obligatorio';
    if (!isValidPhone(form.phone)) errors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setSubmitting(true);
    try {
      if (editing) {
        await api.updateAddress(editing.id, form);
      } else {
        await api.createAddress(form);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadAddresses();
    } catch (err) {
      console.error(err);
      alert('Error al guardar dirección');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (addr: ApiAddress) => {
    setEditing(addr);
    setForm({
      line1: addr.line1,
      city: addr.city,
      department: addr.department,
      phone: addr.phone,
      recipientName: addr.recipientName || '',
      isDefault: addr.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    try {
      await api.deleteAddress(id);
      loadAddresses();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultAddress(id);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => setForm({ line1: '', city: '', department: '', phone: '', recipientName: '', isDefault: false });

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setFormErrors({});
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase">Direcciones</h1>
          <p className="text-white/30 text-sm mt-1">Gestiona tus direcciones de envío</p>
        </div>
        <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors rounded-lg">
          <Plus size={16} /> Nueva dirección
        </button>
      </div>

      {loading ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white/5 rounded" />)}
          </div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-16 text-center">
          <MapPin size={64} className="mx-auto text-white/10 mb-4" />
          <h2 className="text-xl font-bold mb-2">No tienes direcciones guardadas</h2>
          <p className="text-white/30 text-sm mb-6">Agrega una dirección para agilizar tus compras</p>
          <button onClick={() => { setEditing(null); resetForm(); setFormErrors({}); setShowForm(true); }} className="bg-white text-black px-6 py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors rounded-lg">
            Agregar primera dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white/[0.03] border rounded-xl p-5 relative ${addr.isDefault ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10'}`}>
              {addr.isDefault && (
                <div className="absolute -top-2 -right-2 bg-violet-500/20 text-violet-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-violet-500/30 flex items-center gap-1">
                  <Star size={10} className="fill-current" /> Predeterminada
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {addr.recipientName && <span className="font-medium">{addr.recipientName}</span>}
                    {addr.isDefault && <Home size={14} className="text-violet-400" />}
                  </div>
                  <p className="text-white/60 text-sm">{addr.line1}</p>
                  <p className="text-white/60 text-sm">{addr.city}, {addr.department}</p>
                  <p className="text-white/60 text-sm mt-1 flex items-center gap-1">
                    <Phone size={12} /> {addr.phone}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 bg-white/5 px-3 py-2 rounded hover:bg-white/10 transition-colors">
                      <Star size={12} className="fill-current" /> Predeterminada
                    </button>
                  )}
                  <button onClick={() => handleEdit(addr)} className="text-xs text-white/40 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-2 rounded hover:bg-white/10 transition-colors">
                    <Edit size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-white/5 px-3 py-2 rounded hover:bg-white/10 transition-colors">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-lg font-bold uppercase tracking-wider">{editing ? 'Editar dirección' : 'Nueva dirección'}</h2>
              <button onClick={handleCancel} className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><MapPin size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Nombre para la dirección (opcional)</label>
                <input type="text" value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg" placeholder="Casa, Oficina, etc." />
              </div>
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Dirección *</label>
                <input type="text" value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} className={`w-full bg-white/5 border px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg ${formErrors.line1 ? 'border-red-500/50' : 'border-white/10'}`} placeholder="Calle, número, apartamento" required />
                {formErrors.line1 && <p className="text-xs text-red-400 mt-1">{formErrors.line1}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Ciudad *</label>
                  <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={`w-full bg-white/5 border px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg ${formErrors.city ? 'border-red-500/50' : 'border-white/10'}`} placeholder="Bogotá" required />
                  {formErrors.city && <p className="text-xs text-red-400 mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Departamento *</label>
                  <input type="text" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={`w-full bg-white/5 border px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg ${formErrors.department ? 'border-red-500/50' : 'border-white/10'}`} placeholder="Cundinamarca" required />
                  {formErrors.department && <p className="text-xs text-red-400 mt-1">{formErrors.department}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Teléfono *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={`w-full bg-white/5 border px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg ${formErrors.phone ? 'border-red-500/50' : 'border-white/10'}`} placeholder="300 123 4567" required />
                {formErrors.phone && <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>}
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-violet-500 rounded border-white/20 bg-white/5" />
                <span className="text-sm text-white/80">Establecer como dirección predeterminada</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCancel} className="flex-1 bg-white/5 text-white py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/10 transition-colors rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-white text-black py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 disabled:opacity-50 transition-colors rounded-lg flex items-center justify-center gap-2">
                  {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Guardar dirección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}