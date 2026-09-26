import React from 'react';
import { Calendar, Clock, Edit2, Eye, FileText, Repeat } from 'lucide-react';
import { formatDisplayDate } from '../../shared/dateUtils';
import {
  getActivityStartDate,
  getActivityEndDate,
  formatActivityTimeRange,
  getActivityDayStatus,
  getActivityRecurrenceLabel,
} from './activityUtils';

export default function EventCard({ actividad, onOpenDetails, onOpenEdit }) {
  const startDate = getActivityStartDate(actividad);
  const dayStatus = getActivityDayStatus(startDate);
  const timeRange = formatActivityTimeRange(actividad);

  return (
    <div
      className={`group bg-zinc-900/30 border hover:border-zinc-700 transition-colors rounded-lg px-2.5 py-2 relative ${
        dayStatus === 'today' ? 'border-orange-900/40 hover:border-orange-800/60' : 'border-zinc-800'
      }`}
    >
      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-sky-500/70" />
      <div className="flex items-start gap-2 pl-1.5">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenDetails(actividad)}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-medium text-sm text-zinc-100 leading-snug">{actividad.title}</h3>
            {dayStatus === 'today' && (
              <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-px rounded-full border bg-orange-950/50 text-orange-400 border-orange-900/50">
                Hoy
              </span>
            )}
            {actividad.isRecurring && (
              <span className="text-[9px] uppercase tracking-wide font-semibold bg-violet-950/50 text-violet-400 border border-violet-900/50 px-1.5 py-px rounded-full flex items-center gap-0.5 max-w-[140px] truncate">
                <Repeat size={9} className="shrink-0" />
                <span className="truncate">{getActivityRecurrenceLabel(actividad)}</span>
              </span>
            )}
            {actividad.googleEventId && (
              <span className="text-[9px] uppercase tracking-wide font-semibold bg-blue-950/50 text-blue-400 border border-blue-900/50 px-1.5 py-px rounded-full">
                Google
              </span>
            )}
            {actividad.description && (
              <span className="text-[9px] font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 px-1 py-px rounded-full" title="Tiene descripción">
                <FileText size={9} className="inline" />
              </span>
            )}
          </div>
          {(startDate || timeRange) && (
            <p className={`text-[10px] mt-px flex items-center gap-2 flex-wrap ${
              dayStatus === 'today' ? 'text-orange-400/80' : 'text-zinc-500'
            }`}>
              {getActivityEndDate(actividad) && getActivityEndDate(actividad) !== startDate && startDate && (
                <span className="flex items-center gap-0.5">
                  <Calendar size={9} /> {formatDisplayDate(startDate)} → {formatDisplayDate(getActivityEndDate(actividad))}
                </span>
              )}
              {timeRange && (
                <span className="flex items-center gap-0.5">
                  <Clock size={9} /> {timeRange}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => onOpenDetails(actividad)}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
            title="Ver detalles"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(actividad)}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
