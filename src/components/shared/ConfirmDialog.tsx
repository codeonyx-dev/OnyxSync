import React from 'react';
import { Trash2, ArrowUpRight } from 'lucide-react';

export default function ConfirmDialog({ confirmDialog, onClose, onAccept }) {
  if (!confirmDialog) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className={`p-2.5 rounded-xl shrink-0 ${confirmDialog.variant === 'danger' ? 'bg-red-950/50 border border-red-900/50' : 'bg-amber-950/50 border border-amber-900/50'}`}>
              {confirmDialog.variant === 'danger'
                ? <Trash2 size={18} className="text-red-400" />
                : <ArrowUpRight size={18} className="text-amber-400" />}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-zinc-100 text-sm">{confirmDialog.title}</h4>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{confirmDialog.message}</p>
              {confirmDialog.detail && (
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{confirmDialog.detail}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              {confirmDialog.cancelLabel}
            </button>
            <button
              type="button"
              onClick={onAccept}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${confirmDialog.variant === 'danger' ? 'bg-red-950/50 text-red-400 hover:bg-red-900/60 border border-red-900/50' : 'bg-amber-950/50 text-amber-400 hover:bg-amber-900/60 border border-amber-900/50'}`}
            >
              {confirmDialog.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
