import React, { useEffect, useMemo, useRef } from 'react';
import {
  CalendarCheck, LogOut, ArrowRight, CheckSquare, Calendar, Folder,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../modules/auth/AuthContext';
import { useGoogleAuth } from '../../modules/google/GoogleAuthContext';
import { loadPersistedState } from '../../shared/persistence';

export default function LobbyPage() {
  const { session, enterApp, logout } = useAuth();
  const {
    isConfigured,
    isSignedIn,
    isSyncing,
    syncError,
    profile,
    signIn,
    signOut,
    emailMismatch,
    lastSync,
  } = useGoogleAuth();

  const autoConnectAttempted = useRef(false);

  useEffect(() => {
    if (!isConfigured || isSignedIn || autoConnectAttempted.current || !session?.email) return;
    autoConnectAttempted.current = true;
    signIn(session.email);
  }, [isConfigured, isSignedIn, signIn, session?.email]);

  const stats = useMemo(() => {
    if (!session?.userId) return { tareas: 0, eventos: 0, carpetas: 0 };
    const data = loadPersistedState(session.userId);
    const tareas = data?.tareas?.filter(t => !t.completed).length ?? 0;
    const eventos = data?.actividades?.length ?? 0;
    const carpetas = data?.carpetas?.length ?? 0;
    return { tareas, eventos, carpetas };
  }, [session?.userId, lastSync]);

  const initial = session?.name?.charAt(0)?.toUpperCase() || '?';
  const googleReady = !isConfigured || (isSignedIn && !emailMismatch);
  const waitingForGoogle = isConfigured && !isSignedIn && !syncError;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border-2 border-zinc-700 text-xl font-bold mb-4 shadow-xl">
            {initial}
          </div>
          <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Bienvenido</p>
          <h1 className="text-3xl font-bold">{session?.name}</h1>
          {session?.email && (
            <p className="text-zinc-400 text-sm mt-1">{session.email}</p>
          )}
          <p className="text-zinc-500 text-sm mt-2">Tu espacio de trabajo te espera</p>
        </div>

        {isConfigured && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            emailMismatch
              ? 'bg-amber-950/30 border-amber-900/50 text-amber-200'
              : isSignedIn
                ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
          }`}>
            {waitingForGoogle && (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span>Conectando con Google Tasks y Calendar…</span>
              </div>
            )}
            {isSyncing && isSignedIn && (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span>Sincronizando tareas y eventos…</span>
              </div>
            )}
            {isSignedIn && !isSyncing && !emailMismatch && (
              <p>
                Google conectado
                {profile?.email ? ` (${profile.email})` : ''}
                {lastSync ? ` · última sync ${lastSync.toLocaleTimeString()}` : ''}
              </p>
            )}
            {emailMismatch && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>
                    La cuenta de Google ({profile?.email}) no coincide con tu correo registrado
                    ({session?.email}). Usa la misma cuenta para sincronizar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { signOut(); signIn(session?.email); }}
                  className="flex items-center gap-1.5 text-xs font-medium underline underline-offset-2"
                >
                  <RefreshCw size={12} />
                  Conectar con {session?.email}
                </button>
              </div>
            )}
            {syncError && (
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-red-300">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{syncError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => signIn(session?.email)}
                  className="flex items-center gap-1.5 text-xs font-medium underline underline-offset-2"
                >
                  <RefreshCw size={12} />
                  Reintentar conexión con Google
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <CheckSquare size={18} className="mx-auto text-orange-400 mb-2" />
            <p className="text-2xl font-bold">{stats.tareas}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Tareas</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <Calendar size={18} className="mx-auto text-sky-400 mb-2" />
            <p className="text-2xl font-bold">{stats.eventos}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Eventos</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <Folder size={18} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-2xl font-bold">{stats.carpetas}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Carpetas</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={enterApp}
            disabled={!googleReady || isSyncing}
            className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 rounded-2xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-white/5"
          >
            <CalendarCheck size={20} />
            Abrir OnyxSync
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 rounded-xl text-sm transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-8 leading-relaxed">
          {isConfigured
            ? 'Al iniciar sesión se solicita acceso a Google Tasks y Calendar con el correo de tu cuenta.'
            : 'Configura VITE_GOOGLE_CLIENT_ID en .env para sincronizar con Google.'}
        </p>
      </div>
    </div>
  );
}
