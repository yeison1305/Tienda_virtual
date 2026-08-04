import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { passwordErrors, isValidEmail, PASSWORD_RULES } from '../utils/validation';
import { Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pwErrors = passwordErrors(password);
  const emailInvalid = email.length > 0 && !isValidEmail(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (emailInvalid) {
      setError('El email no tiene un formato válido');
      return;
    }

    if (pwErrors.length > 0) {
      setError('La contraseña no cumple los requisitos');
      return;
    }

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
              className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 ${emailInvalid ? 'border-red-500/50' : 'border-white/10'}`}
              placeholder="tucorreo@ejemplo.com"
              required
            />
            {emailInvalid && <p className="text-xs text-red-400 mt-1">El email no tiene un formato válido</p>}
          </div>
          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.re.test(password);
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
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-2">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full bg-white/5 border px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 pr-12 ${confirm.length > 0 && confirm !== password ? 'border-red-500/50' : 'border-white/10'}`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirm.length > 0 && confirm !== password && (
              <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
            )}
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
