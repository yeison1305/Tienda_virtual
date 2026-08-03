import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate('/login-redirect');
    } catch (err: any) {
      setError(err.message.includes('400') ? 'Este email ya está registrado' : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 md:px-8 lg:px-10 pt-28 pb-20 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-black uppercase mb-2">Crear cuenta</h1>
        <p className="text-white/30 text-sm mb-10">Regístrate para seguir tus pedidos</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 text-xs tracking-[0.3em] uppercase font-black hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? '...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-8">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-white/60 hover:text-white transition-colors underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
