const ACCOUNT_KEY = 'onyxsync_account';
const SESSION_KEY = 'onyxsync_session';

export type LocalAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type LocalSession = {
  userId: string;
  name: string;
  email: string;
  phase: 'lobby' | 'app';
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hasAccount(): boolean {
  return Boolean(localStorage.getItem(ACCOUNT_KEY));
}

export function getAccount(): LocalAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSession(): LocalSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: LocalSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function registerAccount(
  name: string,
  password: string,
  email: string,
): Promise<LocalAccount> {
  if (hasAccount()) {
    throw new Error('Ya existe una cuenta en este dispositivo');
  }
  const trimmed = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmed) throw new Error('El nombre es obligatorio');
  if (!trimmedEmail) throw new Error('El correo es obligatorio');
  if (!isValidEmail(trimmedEmail)) throw new Error('Introduce un correo válido');
  if (password.length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres');

  const account: LocalAccount = {
    id: crypto.randomUUID(),
    name: trimmed,
    email: trimmedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return account;
}

export async function loginAccount(name: string, password: string): Promise<LocalAccount> {
  const account = getAccount();
  if (!account) throw new Error('No hay cuenta. Crea una primero.');
  const trimmed = name.trim();
  if (account.name.toLowerCase() !== trimmed.toLowerCase()) {
    throw new Error('Nombre o contraseña incorrectos');
  }
  const hash = await hashPassword(password);
  if (hash !== account.passwordHash) {
    throw new Error('Nombre o contraseña incorrectos');
  }
  if (!account.email) {
    throw new Error('Tu cuenta no tiene correo. Borra los datos locales y regístrate de nuevo.');
  }
  return account;
}
