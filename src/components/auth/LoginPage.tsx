import React, { useState } from 'react';
import { CalendarCheck, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../modules/auth/AuthContext';

export default function LoginPage() {
  const { hasRegisteredAccount, login, register, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(hasRegisteredAccount ? 'login' : 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearAuthError();
    try {
      if (mode === 'register') await register(name, password, email);
      else await login(name, password);
    } catch {
      /* authError en contexto */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-800 shadow-xl mb-4">
            <CalendarCheck size={28} className="text-zinc-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            Onyx<span className="text-zinc-500">Sync</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {mode === 'register'
              ? 'Crea tu cuenta con el mismo correo de Google'
              : 'Inicia sesión para sincronizar con Google'}
          </p>
        </div>

        <div className="flex p-1 mb-6 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'login' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LogIn size={15} /> Entrar
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'register' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <UserPlus size={15} /> Registro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="username"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Correo de Google</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@gmail.com"
                autoComplete="email"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
                required
              />
              <p className="text-[10px] text-zinc-600 mt-1.5 ml-1">
                Debe coincidir con la cuenta de Google para Tasks y Calendar
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-zinc-600"
                required
                minLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {authError && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? 'Un momento…' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>

          <p className="text-[11px] text-zinc-600 text-center leading-relaxed">
            La cuenta se guarda solo en este navegador. Tras entrar, se pedirá acceso a Google Tasks y Calendar.
          </p>
        </form>
      </div>
    </div>
  );
}
