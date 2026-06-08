import React from 'react';
import { Repeat } from 'lucide-react';
import { WEEKDAYS, WEEKDAY_NAMES, RECURRENCE_TYPES, DEFAULT_RECURRENCE } from '../constants';
import {
  getDayFromEndDate, getMonthDayFromEndDate, normalizeRecurrence,
  getIntervalUnitLabel, formatRecurrenceLabel,
} from '../taskUtils';

export default function RecurrencePicker({ value, endDate, onChange }) {
  const { isRecurring, recurrence } = value;
  const rec = normalizeRecurrence(recurrence, endDate);

  const toggleRecurring = () => {
    if (!isRecurring) {
      onChange({
        isRecurring: true,
        recurrence: normalizeRecurrence({
          ...DEFAULT_RECURRENCE,
          weekDays: [getDayFromEndDate(endDate)],
          monthDay: getMonthDayFromEndDate(endDate),
        }, endDate),
      });
    } else {
      onChange({ isRecurring: false });
    }
  };

  const setRec = (patch) => onChange({ recurrence: { ...rec, ...patch } });

  const setType = (type) => {
    const base = { type, interval: 1 };
    if (type === 'weekdays') {
      setRec({ ...base, weekDays: [1, 2, 3, 4, 5] });
    } else if (type === 'weekly') {
      setRec({ ...base, weekDays: rec.weekDays.length ? rec.weekDays : [getDayFromEndDate(endDate)] });
    } else if (type === 'monthly') {
      setRec({ ...base, monthDay: getMonthDayFromEndDate(endDate) });
    } else {
      setRec(base);
    }
  };

  const toggleWeekDay = (dayId) => {
    const days = rec.weekDays.includes(dayId)
      ? rec.weekDays.filter(d => d !== dayId)
      : [...rec.weekDays, dayId].sort((a, b) => {
          const order = [1, 2, 3, 4, 5, 6, 0];
          return order.indexOf(a) - order.indexOf(b);
        });
    setRec({ weekDays: days.length ? days : [dayId] });
  };

  const showInterval = ['daily', 'weekly', 'monthly', 'yearly'].includes(rec.type);
  const showWeekDays = rec.type === 'weekly';

  return (
    <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
      <button
        type="button"
        onClick={toggleRecurring}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl border transition-all ${isRecurring ? 'bg-violet-950/30 border-violet-800/60' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
      >
        <span className="flex items-center gap-2 text-sm text-zinc-300">
          <Repeat size={16} className={isRecurring ? 'text-violet-400' : 'text-zinc-500'} />
          Se repite con frecuencia
        </span>
        <span className={`w-10 h-6 rounded-full relative transition-colors ${isRecurring ? 'bg-violet-600' : 'bg-zinc-700'}`}>
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isRecurring ? 'left-5' : 'left-1'}`} />
        </span>
      </button>

      {isRecurring && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] text-zinc-500 mb-2 uppercase tracking-wider">Repetir cada</label>
            <div className="flex flex-wrap gap-1.5">
              {RECURRENCE_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${rec.type === t.id ? 'bg-violet-900/50 text-violet-300 border-violet-700/60' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {showInterval && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 shrink-0">Cada</span>
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setRec({ interval: Math.max(1, rec.interval - 1) })}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium text-zinc-200">{rec.interval}</span>
                <button
                  type="button"
                  onClick={() => setRec({ interval: Math.min(99, rec.interval + 1) })}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-zinc-400">{getIntervalUnitLabel(rec.type, rec.interval)}</span>
            </div>
          )}

          {showWeekDays && (
            <div>
              <label className="block text-[11px] text-zinc-500 mb-2 uppercase tracking-wider">Días de la semana</label>
              <div className="flex justify-between gap-1">
                {WEEKDAYS.map(d => {
                  const selected = rec.weekDays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleWeekDay(d.id)}
                      className={`w-9 h-9 rounded-full text-xs font-semibold border transition-all ${selected ? 'bg-violet-600 text-white border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.35)]' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}
                      title={WEEKDAY_NAMES[d.id]}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {rec.type === 'monthly' && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 shrink-0">El día</span>
              <input
                type="number"
                min={1}
                max={31}
                value={rec.monthDay}
                onChange={(e) => setRec({ monthDay: Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)) })}
                className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 text-center focus:outline-none focus:border-zinc-600"
              />
              <span className="text-xs text-zinc-400">del mes</span>
            </div>
          )}

          {rec.type === 'weekdays' && (
            <p className="text-xs text-zinc-500">Se repetirá de lunes a viernes, excluyendo fines de semana.</p>
          )}

          <div className="px-3 py-2.5 rounded-lg bg-violet-950/20 border border-violet-900/30">
            <p className="text-xs text-violet-300 leading-relaxed">
              <Repeat size={12} className="inline mr-1.5 -mt-0.5" />
              {formatRecurrenceLabel(rec)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
