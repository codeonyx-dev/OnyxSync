import React from 'react';
import { Folder, FolderOpen, CheckCircle2 } from 'lucide-react';
import { FOLDER_COLORS } from '../../shared/constants';
import { flattenFolders, getCarpeta, getFolderPath } from './folderUtils';

export default function FolderPicker({ carpetas, value, onChange, rootLabel = 'Sin carpeta' }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
      <div className="max-h-44 overflow-y-auto onyx-scroll">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors border-b border-zinc-800/40 ${value === null ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
        >
          <Folder size={15} className={value === null ? 'text-zinc-300' : 'text-zinc-600'} />
          <span className="flex-1">{rootLabel}</span>
          {value === null && <CheckCircle2 size={15} className="text-zinc-300 shrink-0" />}
        </button>
        {flattenFolders(carpetas).map(({ carpeta: c, depth }) => {
          const color = FOLDER_COLORS[c.colorIdx];
          const isSelected = value === c.id;
          const isRoot = depth === 0;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={`w-full flex items-center gap-2.5 py-2.5 pr-3 text-left transition-colors border-b border-zinc-800/30 last:border-b-0 ${isSelected ? `${color.bg} ${color.text}` : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'} ${isRoot ? 'text-sm font-medium' : 'text-xs font-normal'}`}
              style={{ paddingLeft: `${14 + depth * 18}px` }}
            >
              {isRoot ? (
                <Folder size={15} className={isSelected ? color.text : 'text-zinc-500'} />
              ) : (
                <FolderOpen size={13} className={isSelected ? color.text : 'text-zinc-600'} />
              )}
              {!isRoot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 opacity-60 ${color.dot}`} />}
              <span className="flex-1 truncate">{c.name}</span>
              {isSelected && <CheckCircle2 size={15} className={`shrink-0 ${color.text}`} />}
            </button>
          );
        })}
      </div>
      {value !== null && getCarpeta(carpetas, value) && (
        <div className="px-3 py-2 border-t border-zinc-800/50 bg-zinc-900/40">
          <p className="text-[11px] text-zinc-500 truncate">
            {getFolderPath(carpetas, value).map(c => c.name).join(' › ')}
          </p>
        </div>
      )}
    </div>
  );
}
