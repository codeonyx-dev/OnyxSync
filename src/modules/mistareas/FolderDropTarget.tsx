import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { folderDndId } from './dnd';

export default function FolderDropTarget({ folderId, className = '', children }) {
  const id = folderDndId(folderId);
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type: 'folder', folderId: folderId === 'sin-carpeta' ? null : folderId },
  });
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all duration-150 ${
        isOver
          ? 'ring-2 ring-blue-400/90 bg-blue-950/40 scale-[1.02] shadow-lg shadow-blue-950/50 rounded-xl z-10'
          : ''
      }`}
    >
      {children}
    </div>
  );
}
