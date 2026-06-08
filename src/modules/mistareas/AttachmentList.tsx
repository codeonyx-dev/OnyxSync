import React from 'react';
import { X, FileText } from 'lucide-react';
import { formatFileSize } from '../../shared/fileUtils';

export default function AttachmentList({ attachments, onRemove = null, readOnly = false }) {
  if (!attachments?.length) return null;
  return (
    <ul className="space-y-2 mt-2">
      {attachments.map(att => (
        <li key={att.id} className="flex items-center gap-2.5 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
          {att.type?.startsWith('image/') ? (
            <img src={att.dataUrl} alt={att.name} className="w-9 h-9 rounded-md object-cover shrink-0 border border-zinc-700" />
          ) : (
            <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-zinc-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <a href={att.dataUrl} download={att.name} target="_blank" rel="noreferrer" className="text-sm text-zinc-300 truncate block hover:text-white transition-colors">{att.name}</a>
            <span className="text-[10px] text-zinc-600">{formatFileSize(att.size)}</span>
          </div>
          {!readOnly && onRemove && (
            <button type="button" onClick={() => onRemove(att.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
              <X size={14} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
