import { useState, FormEvent, useEffect } from 'react';
import { Send, Mail, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { api, ApiNewsletterSubscriber } from '../../services/api';

export function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<ApiNewsletterSubscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subject: '',
    title: '',
    message: '',
    ctaText: '',
    ctaLink: '',
    imageUrl: '',
  });

  const loadSubscribers = async () => {
    setLoadingSubs(true);
    try {
      const data = await api.adminGetNewsletterSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSending(true);

    try {
      const res = await api.adminSendNewsletter(form);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al enviar newsletter');
    } finally {
      setSending(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError('');
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase">Newsletter</h1>
          <p className="text-white/30 text-sm mt-1">Envía correos a tus suscriptores</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/50">
          <Mail size={16} />
          <span>{subscribers.length} suscriptores</span>
        </div>
      </div>

      {/* Subscribers count card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest">Total suscriptores</p>
              <p className="text-3xl font-black text-emerald-400">{subscribers.length}</p>
            </div>
          </div>
          {loadingSubs && <Loader2 size={20} className="animate-spin text-white/30" />}
        </div>
      </div>

      {/* Compose form */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-bold uppercase tracking-wider">Redactar newsletter</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Asunto *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg"
              placeholder="¡Nueva colección disponible!"
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Título principal *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg"
              placeholder="Nueva colección Otoño 2024"
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Mensaje *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              rows={6}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg resize-none"
              placeholder="Hola comunidad,<br/>Estamos emocionados de anunciar..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Texto del botón (CTA)</label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => setForm(f => ({ ...f, ctaText: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg"
                placeholder="Ver colección"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Enlace del botón</label>
              <input
                type="url"
                value={form.ctaLink}
                onChange={(e) => setForm(f => ({ ...f, ctaLink: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg"
                placeholder="https://tutienda.com/categoria/novedades"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">URL de imagen (opcional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 rounded-lg"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${result.failed > 0 ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}>
              {result.failed > 0 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>
                Enviado: <strong>{result.sent}</strong> | Fallidos: <strong>{result.failed}</strong>
              </span>
              <button
                type="button"
                onClick={clearResult}
                className="ml-auto text-xs text-white/50 hover:text-white"
              >
                Cerrar
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-white text-black py-4 text-xs tracking-[0.15em] uppercase font-bold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar newsletter a {subscribers.length} suscriptores
              </>
            )}
          </button>
        </form>
      </div>

      {/* Preview of recent subscribers */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Suscriptores recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Email</th>
                <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-widest font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loadingSubs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={2} className="px-6 py-5"><div className="h-4 bg-white/5 rounded animate-pulse w-48" /></td>
                  </tr>
                ))
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-white/20 text-sm">No hay suscriptores aún</td>
                </tr>
              ) : (
                subscribers.slice(0, 10).map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-3 text-sm text-white/70 font-mono">{sub.email}</td>
                    <td className="px-6 py-3 text-sm text-white/40">
                      {new Date(sub.createdAt).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {subscribers.length > 10 && (
          <div className="px-6 py-3 border-t border-white/5 text-center text-xs text-white/30">
            Mostrando 10 de {subscribers.length} suscriptores
          </div>
        )}
      </div>
    </div>
  );
}