import React from 'react';
import { Undo2, X } from 'lucide-react';

export default function UndoToast({ undoToast, onUndo, onDismiss }) {
  if (!undoToast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[55] flex items-center gap-3 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm text-zinc-300">{undoToast.message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
      >
        <Undo2 size={13} /> Deshacer
      </button>
      <button type="button" onClick={onDismiss} className="p-0.5 text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
    </div>
  );
}
