const SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar.events',
  'openid',
  'email',
  'profile',
].join(' ');

const TOKEN_KEY = 'onyx_google_token';
const TOKEN_EXPIRY_KEY = 'onyx_google_token_expiry';
const PROFILE_KEY = 'onyx_google_profile';
const STATE_KEY = 'onyx_google_oauth_state';

export function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

export function redirectToGoogleLogin(clientId: string, loginHint?: string) {
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'token',
    scope: SCOPES,
    include_granted_scopes: 'true',
    state,
    prompt: 'consent',
  });
  if (loginHint?.trim()) {
    params.set('login_hint', loginHint.trim());
  }
  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

export function parseRedirectToken(): { accessToken: string | null; error: string | null } {
  const hash = window.location.hash;
  const query = window.location.search;

  const hashError = hash && hash.includes('error=');
  const queryError = query && query.includes('error=');
  if (hashError || queryError) {
    const params = new URLSearchParams((hashError ? hash : query).substring(1));
    return {
      accessToken: null,
      error: params.get('error_description') || params.get('error') || 'Error de autenticación con Google',
    };
  }

  if (!hash || !hash.includes('access_token')) {
    return { accessToken: null, error: null };
  }

  const params = new URLSearchParams(hash.substring(1));
  const state = params.get('state');
  const savedState = sessionStorage.getItem(STATE_KEY);
  if (state && savedState && state !== savedState) {
    return { accessToken: null, error: 'Sesión OAuth inválida. Intenta de nuevo.' };
  }
  sessionStorage.removeItem(STATE_KEY);

  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  if (accessToken && expiresIn) {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + Number(expiresIn) * 1000));
  }

  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return { accessToken, error: accessToken ? null : 'No se recibió el token de acceso' };
}

export function getStoredToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!token || !expiry || Date.now() > Number(expiry)) {
    clearStoredAuth();
    return null;
  }
  return token;
}

export function storeProfile(profile: { name?: string; email?: string; picture?: string }) {
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getStoredProfile(): { name?: string; email?: string; picture?: string } | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(STATE_KEY);
}
