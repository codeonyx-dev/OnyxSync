import {
  closestCenter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';

export const taskDndId = (id) => `task-${id}`;
export const folderDndId = (folderId) =>
  folderId === 'sin-carpeta' || folderId === null || folderId === undefined
    ? 'folder-sin-carpeta'
    : `folder-${folderId}`;

export function taskFolderCollisionDetection(args) {
  const pointerHits = pointerWithin(args);
  const folderPointer = pointerHits.find((c) => String(c.id).startsWith('folder-'));
  if (folderPointer) return [folderPointer];

  const rectHits = rectIntersection(args);
  const folderRect = rectHits.find((c) => String(c.id).startsWith('folder-'));
  if (folderRect) return [folderRect];

  return closestCenter(args);
}
