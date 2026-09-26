import React, { useState, useRef, useLayoutEffect } from 'react';
import { LogIn, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { useGoogleAuth } from '../../modules/google/GoogleAuthContext';

export default function GoogleSyncButton() {
  const auth = useGoogleAuth();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 16 });

  const updateMenuPos = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPos();
    window.addEventListener('resize', updateMenuPos);
    window.addEventListener('scroll', updateMenuPos, true);
    return () => {
      window.removeEventListener('resize', updateMenuPos);
      window.removeEventListener('scroll', updateMenuPos, true);
    };
  }, [open]);

  if (!auth) return null;

  const { isConfigured, isSignedIn, profile, isSyncing, lastSync, syncError, signIn, signOut, syncNow } = auth;

  const handleMainClick = () => {
    if (!isConfigured) {
      if (!open) updateMenuPos();
      setOpen(v => !v);
      return;
    }
    if (!isSignedIn) {
      signIn();
      return;
    }
    if (!open) updateMenuPos();
    setOpen(v => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleMainClick}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          !isConfigured
            ? 'bg-zinc-900/80 text-zinc-500 border-zinc-800 border-dashed hover:text-zinc-300'
            : isSignedIn
              ? 'bg-blue-950/40 text-blue-300 border-blue-800/50 hover:bg-blue-900/40'
              : 'bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-200'
        }`}
        title={
          !isConfigured
            ? 'Configura VITE_GOOGLE_CLIENT_ID en .env'
            : isSignedIn
              ? 'Cuenta de Google conectada'
              : 'Iniciar sesión con Google'
        }
      >
        {profile?.picture ? (
          <img src={profile.picture} alt="" className="w-5 h-5 rounded-full" />
        ) : (
          <LogIn size={14} />
        )}
        <span className="hidden sm:inline max-w-[120px] truncate">
          {!isConfigured
            ? 'Google'
            : isSignedIn
              ? (profile?.name?.split(' ')[0] || 'Google')
              : 'Iniciar sesión'}
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[200]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="fixed z-[201] w-72 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 p-3 text-xs"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {!isConfigured ? (
              <>
                <p className="text-zinc-300 font-medium mb-2">Google no configurado</p>
                <p className="text-zinc-500 mb-2 leading-relaxed">
                  Crea un archivo <code className="text-zinc-400">.env</code> en la raíz del proyecto con tu Client ID de Google Cloud:
                </p>
                <pre className="text-[10px] text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-lg p-2 mb-2 overflow-x-auto">
                  VITE_GOOGLE_CLIENT_ID=tu-id.apps.googleusercontent.com
                </pre>
                <p className="text-zinc-600 leading-relaxed">
                  Reinicia el servidor de desarrollo después de guardar. Copia <code className="text-zinc-500">.env.example</code> como base.
                </p>
              </>
            ) : (
              <>
                {isSignedIn && profile?.email && (
                  <p className="text-zinc-400 mb-2 truncate">{profile.email}</p>
                )}
                <p className="text-zinc-500 mb-3 leading-relaxed">
                  {isSignedIn
                    ? 'La sincronización es automática: los cambios se envían a Google al guardar y se actualizan cada pocos minutos.'
                    : 'Serás redirigido a Google para autorizar Tasks y Calendar.'}
                </p>
                {syncError && (
                  <p className="flex items-start gap-1.5 text-red-400 mb-2">
                    <AlertCircle size={13} className="shrink-0 mt-px" />
                    <span>{syncError}</span>
                  </p>
                )}
                {isSignedIn && (
                  <p className="flex items-center gap-1.5 text-emerald-400/90 mb-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
                    {isSyncing ? 'Sincronizando…' : 'Sincronización automática activa'}
                  </p>
                )}
                {lastSync && (
                  <p className="text-zinc-600 mb-2">
                    Última actualización: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  {!isSignedIn ? (
                    <button
                      type="button"
                      onClick={() => { signIn(); setOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Iniciar sesión con Google
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={() => syncNow()}
                        className="flex items-center justify-center gap-2 w-full py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg text-xs transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                        Forzar actualización
                      </button>
                      <button
                        type="button"
                        onClick={() => { signOut(); setOpen(false); }}
                        className="flex items-center justify-center gap-2 w-full py-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg transition-colors"
                      >
                        <LogOut size={14} /> Cerrar sesión
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
