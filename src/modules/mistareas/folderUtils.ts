export const getCarpeta = (carpetas, id) => carpetas.find(c => c.id === id) || null;

export const getChildFolders = (carpetas, parentId) =>
  carpetas.filter(c => (c.parentId ?? null) === parentId);

export const getRootFolders = (carpetas) => getChildFolders(carpetas, null);

export const getDescendantIds = (carpetas, id) => {
  const children = getChildFolders(carpetas, id);
  return [id, ...children.flatMap(c => getDescendantIds(carpetas, c.id))];
};

export const getFolderPath = (carpetas, id) => {
  const path = [];
  let current = getCarpeta(carpetas, id);
  while (current) {
    path.unshift(current);
    current = current.parentId ? getCarpeta(carpetas, current.parentId) : null;
  }
  return path;
};

export const flattenFolders = (carpetas, parentId = null, depth = 0) =>
  getChildFolders(carpetas, parentId).flatMap(c => [{ carpeta: c, depth }, ...flattenFolders(carpetas, c.id, depth + 1)]);

export const countPendingTasksInFolder = (carpetas, tareas, folderId) => {
  const folderIds = getDescendantIds(carpetas, folderId);
  return tareas.filter(t => !t.completed && folderIds.includes(t.folderId)).length;
};

export const isFolderEmpty = (carpetas, tareas, folderId) =>
  countPendingTasksInFolder(carpetas, tareas, folderId) === 0;
