import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { fetchGoogleTasks, fetchGoogleCalendarEvents, mapGoogleTaskToLocal, mapGoogleEventToLocal } from './googleApi';
import {
  redirectToGoogleLogin,
  parseRedirectToken,
  getStoredToken,
  getStoredProfile,
  storeProfile,
  clearStoredAuth,
} from './googleOAuth';

const SYNC_INTERVAL_MS = 4 * 60 * 1000;
const MIN_SYNC_GAP_MS = 45 * 1000;

type GoogleProfile = { name?: string; email?: string; picture?: string };

type GoogleAuthContextValue = {
  isConfigured: boolean;
  isSignedIn: boolean;
  profile: GoogleProfile | null;
  isSyncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
  signIn: (loginHint?: string) => void;
  expectedEmail: string | null;
  emailMismatch: boolean;
  signOut: () => void;
  syncNow: () => Promise<void>;
};

const stubValue: GoogleAuthContextValue = {
  isConfigured: false,
  isSignedIn: false,
  profile: null,
  isSyncing: false,
  lastSync: null,
  syncError: null,
  signIn: () => {},
  signOut: () => {},
  syncNow: async () => {},
  expectedEmail: null,
  emailMismatch: false,
};

const GoogleAuthContext = createContext<GoogleAuthContextValue>(stubValue);

export function useGoogleAuth() {
  return useContext(GoogleAuthContext);
}

export function GoogleAuthProvider({
  children,
  onTasksSynced,
  onEventsSynced,
  expectedEmail = null,
}: {
  children: React.ReactNode;
  onTasksSynced: (tasks: ReturnType<typeof mapGoogleTaskToLocal>[]) => void;
  onEventsSynced: (events: ReturnType<typeof mapGoogleEventToLocal>[]) => void;
  expectedEmail?: string | null;
}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const isConfigured = Boolean(clientId);

  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
  const [profile, setProfile] = useState<GoogleProfile | null>(() => getStoredProfile());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isSyncingRef = useRef(false);
  const lastSyncAtRef = useRef(0);
  const onTasksSyncedRef = useRef(onTasksSynced);
  const onEventsSyncedRef = useRef(onEventsSynced);
  onTasksSyncedRef.current = onTasksSynced;
  onEventsSyncedRef.current = onEventsSynced;

  const runSync = useCallback(async (token: string, force = false) => {
    if (isSyncingRef.current) return;
    const now = Date.now();
    if (!force && now - lastSyncAtRef.current < MIN_SYNC_GAP_MS) return;

    isSyncingRef.current = true;
    lastSyncAtRef.current = now;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const [gTasks, gEvents] = await Promise.all([
        fetchGoogleTasks(token),
        fetchGoogleCalendarEvents(token),
      ]);
      onTasksSyncedRef.current(gTasks.map((t, i) => mapGoogleTaskToLocal(t, i)));
      onEventsSyncedRef.current(gEvents.map((e, i) => mapGoogleEventToLocal(e, i)));
      setLastSync(new Date());
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Error al sincronizar');
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  const autoSync = useCallback(async (force = false) => {
    const token = getStoredToken();
    if (!token) return;
    setAccessToken(token);
    await runSync(token, force);
  }, [runSync]);

  const loadProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        const p = { name: user.name, email: user.email, picture: user.picture };
        setProfile(p);
        storeProfile(p);
      }
    } catch {
      /* perfil opcional */
    }
  }, []);

  const completeLogin = useCallback(async (token: string) => {
    setAccessToken(token);
    await loadProfile(token);
    await runSync(token, true);
  }, [loadProfile, runSync]);

  useEffect(() => {
    if (!isConfigured) return;
    const { accessToken: fromRedirect, error } = parseRedirectToken();
    if (error) setSyncError(error);
    else if (fromRedirect) completeLogin(fromRedirect);
  }, [isConfigured, completeLogin]);

  useEffect(() => {
    if (!isConfigured) return;
    const token = getStoredToken();
    if (!token) return;
    setAccessToken(token);
    loadProfile(token);
    autoSync(true);
  }, [isConfigured, loadProfile, autoSync]);

  useEffect(() => {
    if (!accessToken && !getStoredToken()) return;

    const intervalId = setInterval(() => autoSync(), SYNC_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') autoSync();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [accessToken, autoSync]);

  const signIn = useCallback((loginHint?: string) => {
    if (!clientId) {
      setSyncError('Falta VITE_GOOGLE_CLIENT_ID en el archivo .env');
      return;
    }
    setSyncError(null);
    const hint = loginHint?.trim() || expectedEmail?.trim() || undefined;
    redirectToGoogleLogin(clientId, hint);
  }, [clientId, expectedEmail]);

  const emailMismatch = Boolean(
    expectedEmail
    && profile?.email
    && profile.email.toLowerCase() !== expectedEmail.toLowerCase(),
  );

  const signOut = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setProfile(null);
    setLastSync(null);
    setSyncError(null);
  }, []);

  const syncNow = useCallback(async () => {
    const token = accessToken || getStoredToken();
    if (!token) {
      signIn();
      return;
    }
    await runSync(token, true);
  }, [accessToken, runSync, signIn]);

  const value: GoogleAuthContextValue = {
    isConfigured,
    isSignedIn: Boolean(accessToken || getStoredToken()),
    profile,
    isSyncing,
    lastSync,
    syncError,
    signIn,
    signOut,
    syncNow,
    expectedEmail,
    emailMismatch,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
}
