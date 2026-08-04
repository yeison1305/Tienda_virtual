import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Eye, EyeOff, Shield, Lock, Save, Loader2 } from 'lucide-react';
import { passwordErrors, PASSWORD_RULES } from '../../utils/validation';

export function ChangePasswordPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return showMsg('error', 'Completa todos los campos');
    }
    if (form.newPassword !== form.confirmPassword) {
      return showMsg('error', 'Las contraseñas no coinciden');
    }
    if (passwordErrors(form.newPassword).length > 0) {
      return showMsg('error', 'La contraseña no cumple los requisitos');
    }
    setSaving(true);
    try {
      await api.updateProfile({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      showMsg('success', 'Contraseña actualizada correctamente');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showMsg('error', err.message || 'Error al actualizar contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black uppercase">Cambiar contraseña</h1>
        <p className="text-white/30 text-sm mt-1">Actualiza tu contraseña de acceso</p>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto text-white/30 hover:text-white">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Contraseña actual</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.re.test(form.newPassword);
              return (
                <li key={rule.label} className={`text-xs flex items-center gap-2 ${ok ? 'text-emerald-400' : 'text-white/30'}`}>
                  <span>{ok ? '✓' : '○'}</span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Confirmar nueva contraseña</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-white text-black py-3 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 disabled:opacity-50 transition-colors rounded-lg flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <> <Save size={16} /> Guardar cambios </>}
        </button>
      </form>
    </div>
  );
}