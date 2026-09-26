type ImportedTask = { googleTaskId?: string; id: string; [key: string]: unknown };
type ImportedEvent = { googleEventId?: string; id: string; [key: string]: unknown };

export function mergeGoogleTasks<T extends { id: string; googleTaskId?: string }>(
  prev: T[],
  imported: ImportedTask[],
): T[] {
  const next = [...prev] as T[];
  for (const task of imported) {
    const idx = next.findIndex(t => t.googleTaskId === task.googleTaskId);
    if (idx >= 0) next[idx] = { ...next[idx], ...task, id: next[idx].id };
    else next.push(task as T);
  }
  return next;
}

export function mergeGoogleEvents<T extends { id: string; googleEventId?: string }>(
  prev: T[],
  imported: ImportedEvent[],
): T[] {
  const next = [...prev] as T[];
  for (const ev of imported) {
    const idx = next.findIndex(a => a.googleEventId === ev.googleEventId);
    if (idx >= 0) next[idx] = { ...next[idx], ...ev, id: next[idx].id };
    else next.push(ev as T);
  }
  return next;
}
