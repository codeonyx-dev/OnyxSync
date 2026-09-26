const STORAGE_PREFIX = 'onyxsync_v1';
const VERSION = 1;

function storageKey(userId?: string) {
  return userId ? `${STORAGE_PREFIX}_${userId}` : STORAGE_PREFIX;
}

export type PersistedAppState = {
  version: number;
  carpetas: Record<string, unknown>[];
  tareas: Record<string, unknown>[];
  actividades: Record<string, unknown>[];
  activeTab: 'tareas' | 'actividades';
};

export function loadPersistedState(userId?: string): PersistedAppState | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return {
      version: data.version ?? VERSION,
      carpetas: Array.isArray(data.carpetas) ? data.carpetas : [],
      tareas: Array.isArray(data.tareas) ? data.tareas : [],
      actividades: Array.isArray(data.actividades) ? data.actividades : [],
      activeTab: data.activeTab === 'actividades' ? 'actividades' : 'tareas',
    };
  } catch {
    return null;
  }
}

export function savePersistedState(
  state: {
    carpetas: Record<string, unknown>[];
    tareas: Record<string, unknown>[];
    actividades: Record<string, unknown>[];
    activeTab: string;
  },
  userId?: string,
) {
  try {
    const payload: PersistedAppState = {
      version: VERSION,
      carpetas: state.carpetas,
      tareas: state.tareas,
      actividades: state.actividades,
      activeTab: state.activeTab === 'actividades' ? 'actividades' : 'tareas',
    };
    localStorage.setItem(storageKey(userId), JSON.stringify(payload));
  } catch (err) {
    console.warn('No se pudo guardar en localStorage:', err);
  }
}
