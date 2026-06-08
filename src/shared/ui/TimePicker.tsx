import React, { useState } from 'react';
import { parseTime12, toTime24 } from '../dateUtils';
import DropdownSelect from './DropdownSelect';

export default function TimePicker({ value, onChange, onComplete }) {
  const parsed = parseTime12(value);
  const [h12, setH12] = useState(parsed.h12);
  const [min, setMin] = useState(parsed.min);
  const [ampm, setAmpm] = useState(parsed.ampm);

  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const v = String(i + 1);
    return { value: v, label: v };
  });
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const v = String(i).padStart(2, '0');
    return { value: v, label: v };
  });

  const applyTime = (nextH12, nextMin, nextAmpm) => {
    setH12(nextH12);
    setMin(nextMin);
    setAmpm(nextAmpm);
    if (nextH12 && nextMin && nextAmpm) {
      onChange(toTime24(nextH12, nextMin, nextAmpm));
      onComplete?.();
    }
  };

  return (
    <div className="mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
      <div className="flex items-end gap-2">
        <DropdownSelect
          label="Hora"
          value={h12}
          displayValue={h12}
          options={hourOptions}
          onChange={(v) => applyTime(v, min, ampm)}
        />
        <span className="text-zinc-600 font-bold pb-2.5">:</span>
        <DropdownSelect
          label="Minutos"
          value={min}
          displayValue={min}
          options={minuteOptions}
          onChange={(v) => applyTime(h12, v, ampm)}
        />
        <div className="shrink-0">
          <label className="block text-[10px] text-zinc-600 mb-1 uppercase tracking-wider">Periodo</label>
          <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
            {['AM', 'PM'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => applyTime(h12, min, p)}
                className={`px-3 py-2.5 text-xs font-semibold transition-colors ${ampm === p ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      {value && (
        <button type="button" onClick={() => { onChange(''); setH12(''); setMin(''); setAmpm('AM'); onComplete?.(); }} className="w-full py-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
          Quitar hora
        </button>
      )}
    </div>
  );
}
