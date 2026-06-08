import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function DropdownSelect({ label, value, displayValue, options, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      {label && <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wider">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 hover:border-zinc-600 transition-colors"
      >
        <span>{displayValue || '--'}</span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 py-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-36 overflow-y-auto onyx-scroll">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-3 py-2 text-sm text-left transition-colors ${value === opt.value ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
