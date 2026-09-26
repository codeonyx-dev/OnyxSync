import React, { useCallback } from 'react';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import LoginPage from './components/auth/LoginPage';
import LobbyPage from './components/auth/LobbyPage';
import App from './App';
import { GoogleAuthProvider } from './modules/google/GoogleAuthContext';
import { mergeGoogleTasks, mergeGoogleEvents } from './modules/google/googleSyncMerge';
import { loadPersistedState, savePersistedState } from './shared/persistence';

function AuthenticatedRoutes() {
  const { isLobby, isApp, session, backToLobby } = useAuth();

  const onTasksSynced = useCallback((imported) => {
    if (!session?.userId) return;
    const current = loadPersistedState(session.userId);
    const tareas = mergeGoogleTasks(current?.tareas ?? [], imported as never);
    savePersistedState({
      carpetas: current?.carpetas ?? [],
      tareas,
      actividades: current?.actividades ?? [],
      activeTab: current?.activeTab ?? 'tareas',
    }, session.userId);
  }, [session?.userId]);

  const onEventsSynced = useCallback((imported) => {
    if (!session?.userId) return;
    const current = loadPersistedState(session.userId);
    const actividades = mergeGoogleEvents(current?.actividades ?? [], imported as never);
    savePersistedState({
      carpetas: current?.carpetas ?? [],
      tareas: current?.tareas ?? [],
      actividades,
      activeTab: current?.activeTab ?? 'tareas',
    }, session.userId);
  }, [session?.userId]);

  if (!session) return null;

  return (
    <GoogleAuthProvider
      expectedEmail={session.email || null}
      onTasksSynced={onTasksSynced}
      onEventsSynced={onEventsSynced}
    >
      {isLobby && <LobbyPage />}
      {isApp && <App userId={session.userId} onBackToLobby={backToLobby} />}
    </GoogleAuthProvider>
  );
}

function AuthGate() {
  const { isLogin } = useAuth();

  if (isLogin) return <LoginPage />;
  return <AuthenticatedRoutes />;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
