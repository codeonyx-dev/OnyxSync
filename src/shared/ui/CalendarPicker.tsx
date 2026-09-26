import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES, CAL_HEADERS } from '../constants';
import { toDateStr, getCalendarDays } from '../dateUtils';

export default function CalendarPicker({
  value,
  onChange,
  onPick,
  allowPast = false,
  markedDates = [],
}) {
  const initial = value ? new Date(`${value}T12:00`) : new Date();
  const now = new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const days = getCalendarDays(viewYear, viewMonth);
  const markedSet = new Set(markedDates);
  const canGoPrev = allowPast || viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const pickDate = (dateStr) => {
    onChange(dateStr);
    onPick?.();
  };

  return (
    <div className="mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={`p-1.5 rounded-lg transition-colors ${canGoPrev ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800' : 'text-zinc-800 cursor-not-allowed'}`}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-zinc-200">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {CAL_HEADERS.map(h => (
          <div key={h} className="text-center text-[10px] font-semibold text-zinc-600 py-1">{h}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const isSelected = value === dateStr;
          const isToday = todayStr === dateStr;
          const isPast = !allowPast && dateStr < todayStr;
          const hasEvents = markedSet.has(dateStr);
          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && pickDate(dateStr)}
              className={`relative aspect-square flex items-center justify-center text-xs rounded-lg transition-all ${
                isPast && !isSelected
                  ? 'text-zinc-800 cursor-not-allowed'
                  : isSelected
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : isToday
                      ? 'bg-zinc-800 text-zinc-200 font-medium ring-1 ring-zinc-600'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {day}
              {hasEvents && (
                <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  isSelected ? 'bg-zinc-700' : 'bg-sky-400'
                }`} />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800/60">
        <button type="button" onClick={() => pickDate(todayStr)} className="flex-1 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors">
          Hoy
        </button>
        {value && (
          <button type="button" onClick={() => { onChange(''); onPick?.(); }} className="flex-1 py-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
            Quitar fecha
          </button>
        )}
      </div>
    </div>
  );
}
