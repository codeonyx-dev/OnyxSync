import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getSession,
  saveSession,
  clearSession,
  hasAccount,
  getAccount,
  registerAccount,
  loginAccount,
  type LocalSession,
} from './localAuth';
import { clearStoredAuth } from '../google/googleOAuth';

type AuthContextValue = {
  session: LocalSession | null;
  hasRegisteredAccount: boolean;
  isLogin: boolean;
  isLobby: boolean;
  isApp: boolean;
  authError: string | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string, email: string) => Promise<void>;
  enterApp: () => void;
  backToLobby: () => void;
  logout: () => void;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(() => getSession());
  const [hasRegisteredAccount, setHasRegisteredAccount] = useState(hasAccount);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setHasRegisteredAccount(hasAccount());
  }, [session]);

  const login = useCallback(async (name: string, password: string) => {
    setAuthError(null);
    try {
      const account = await loginAccount(name, password);
      const next: LocalSession = {
        userId: account.id,
        name: account.name,
        email: account.email,
        phase: 'lobby',
      };
      saveSession(next);
      setSession(next);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, password: string, email: string) => {
    setAuthError(null);
    try {
      const account = await registerAccount(name, password, email);
      const next: LocalSession = {
        userId: account.id,
        name: account.name,
        email: account.email,
        phase: 'lobby',
      };
      saveSession(next);
      setSession(next);
      setHasRegisteredAccount(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error al registrarse');
      throw err;
    }
  }, []);

  const enterApp = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const next = { ...prev, phase: 'app' as const };
      saveSession(next);
      return next;
    });
  }, []);

  const backToLobby = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const next = { ...prev, phase: 'lobby' as const };
      saveSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    clearStoredAuth();
    setSession(null);
    setAuthError(null);
  }, []);

  useEffect(() => {
    if (!session) return;
    const account = getAccount();
    if (account && !session.email && account.email) {
      const next = { ...session, email: account.email };
      saveSession(next);
      setSession(next);
    }
  }, [session]);

  const value: AuthContextValue = {
    session,
    hasRegisteredAccount,
    isLogin: !session,
    isLobby: session?.phase === 'lobby',
    isApp: session?.phase === 'app',
    authError,
    login,
    register,
    enterApp,
    backToLobby,
    logout,
    clearAuthError: () => setAuthError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
