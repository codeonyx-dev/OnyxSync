import React from 'react';
import {
  Circle, CheckCircle2, Edit2, Trash2, ArrowUpRight,
  Folder, CalendarCheck, Calendar, Clock, Repeat,
} from 'lucide-react';
import { FOLDER_COLORS, WEEKDAYS, WEEKDAY_NAMES } from '../../shared/constants';
import {
  getTaskEndDate, getTaskEndTime, getTaskDescription, normalizeRecurrence, formatRecurrenceLabel,
} from '../../shared/taskUtils';
import { formatDisplayDate, formatDisplayTime } from '../../shared/dateUtils';
import AttachmentList from './AttachmentList';
import { getCarpeta, getFolderPath } from './folderUtils';

export default function TaskDetailsContent({
  tarea,
  carpetas,
  onEdit,
  onConversion,
  onToggleComplete,
  onDelete,
  onToggleSubtask,
  onPromoteSubtask,
}) {
  const carpeta = getCarpeta(carpetas, tarea.folderId);
  const color = carpeta ? FOLDER_COLORS[carpeta.colorIdx] : null;
  const endDate = getTaskEndDate(tarea);
  const endTime = getTaskEndTime(tarea);
  const description = getTaskDescription(tarea);
  const subtasks = tarea.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const rec = tarea.isRecurring ? normalizeRecurrence(tarea.recurrence, endDate) : null;

  return (
    <div className="space-y-4">
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
        <h2 className="text-base font-medium text-zinc-100 leading-snug">{tarea.title}</h2>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tarea.completed && (
            <span className="text-[10px] uppercase tracking-wide font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={10} /> Completada
            </span>
          )}
          {tarea.inCalendar && (
            <span className="text-[10px] uppercase tracking-wide font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CalendarCheck size={10} /> En calendario
            </span>
          )}
          {tarea.googleTaskId && (
            <span className="text-[10px] uppercase tracking-wide font-semibold bg-blue-950/50 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded-full">
              Google Tasks
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {subtasks.length > 0 ? (
          <>
            <div className="flex items-center justify-between ml-1">
              <span className="text-xs text-zinc-500">Subtareas</span>
              <span className="text-[11px] text-zinc-600">{completedSubtasks}/{subtasks.length}</span>
            </div>
            {subtasks.length > 1 && (
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mx-1">
                <div className="h-full bg-emerald-500/60 rounded-full transition-all" style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }} />
              </div>
            )}
            <ul className="space-y-1.5 pl-1">
              {subtasks.map((st) => (
                <li key={st.id} className="text-sm flex items-center justify-between bg-zinc-900/60 px-3 py-2 rounded-lg border border-zinc-800/50">
                  <span className="flex items-center gap-2 min-w-0 flex-1">
                    <button onClick={() => onToggleSubtask(tarea.id, st.id, null)} className={`shrink-0 transition-colors ${st.completed ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                      {st.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </button>
                    <span className={`truncate ${st.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{st.title}</span>
                  </span>
                  <button onClick={() => onPromoteSubtask(tarea.id, st.id, null)} className="shrink-0 p-1.5 rounded-md bg-amber-950/50 border border-amber-800/50 text-amber-400 hover:bg-amber-900/60 hover:text-amber-300 transition-colors" title="Convertir en tarea principal">
                    <ArrowUpRight size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-zinc-600 italic pl-1">Sin subtareas</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Fecha de finalización</label>
          <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${endDate ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
            <Calendar size={16} className={endDate ? 'text-zinc-300' : 'text-zinc-600'} />
            <span>{endDate ? formatDisplayDate(endDate) : 'Sin fecha'}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Hora</label>
          <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${endTime ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
            <Clock size={16} className={endTime ? 'text-zinc-300' : 'text-zinc-600'} />
            <span>{endTime ? formatDisplayTime(endTime) : 'Sin hora'}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Descripción</label>
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm min-h-[80px]">
          {description ? (
            <p className="text-zinc-300 whitespace-pre-line leading-relaxed">{description}</p>
          ) : (
            <p className="text-zinc-600 italic">Sin descripción</p>
          )}
        </div>
      </div>

      <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
        <label className="block text-xs text-zinc-500 mb-2">Repetición</label>
        {tarea.isRecurring && rec ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl border bg-violet-950/30 border-violet-800/60 text-sm text-violet-300">
              <Repeat size={16} className="text-violet-400 shrink-0" />
              <span>{formatRecurrenceLabel(rec)}</span>
            </div>
            {rec.type === 'weekly' && (
              <div>
                <span className="block text-[11px] text-zinc-500 mb-2 uppercase tracking-wider">Días de la semana</span>
                <div className="flex justify-between gap-1">
                  {WEEKDAYS.map(d => {
                    const selected = rec.weekDays.includes(d.id);
                    return (
                      <span
                        key={d.id}
                        className={`w-9 h-9 rounded-full text-xs font-semibold border flex items-center justify-center ${selected ? 'bg-violet-600/80 text-white border-violet-500/60' : 'bg-zinc-900/50 text-zinc-600 border-zinc-800'}`}
                        title={WEEKDAY_NAMES[d.id]}
                      >
                        {d.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {rec.type === 'monthly' && (
              <p className="text-xs text-zinc-500">Se repite el día <span className="text-zinc-300 font-medium">{rec.monthDay}</span> de cada mes</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-3 rounded-xl border bg-zinc-900 border-zinc-800 text-sm text-zinc-500">
            <Repeat size={16} className="text-zinc-600 shrink-0" />
            <span>No se repite</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Carpeta</label>
        {carpeta ? (
          <div className={`rounded-xl border overflow-hidden ${color.border} ${color.bg}`}>
            <div className="flex items-center gap-2.5 px-4 py-3">
              <Folder size={16} className={color.text} />
              <span className={`text-sm font-medium ${color.text}`}>{getFolderPath(carpetas, carpeta.id).map(c => c.name).join(' › ')}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-500">
            <Folder size={16} className="text-zinc-600" />
            <span>Sin carpeta</span>
          </div>
        )}
      </div>

      <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
        <label className="block text-xs text-zinc-500 mb-2">Archivos adjuntos</label>
        {tarea.attachments?.length > 0 ? (
          <AttachmentList attachments={tarea.attachments} readOnly />
        ) : (
          <p className="text-sm text-zinc-600 italic">Sin archivos adjuntos</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-800/50">
        <button onClick={() => onEdit(tarea)} className="px-2.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
          <Edit2 size={13}/> Editar
        </button>
        {!tarea.inCalendar && (
          <button onClick={() => onConversion(tarea)} className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors text-zinc-300">
            <CalendarCheck size={13}/> Calendario
          </button>
        )}
        <button onClick={() => onToggleComplete(tarea.id)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${tarea.completed ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/40'}`}>
          {tarea.completed ? <><Circle size={13}/> Pendiente</> : <><CheckCircle2 size={13}/> Completar</>}
        </button>
        <button onClick={() => onDelete(tarea.id)} className="p-1.5 bg-red-950/30 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors ml-auto" title="Eliminar">
          <Trash2 size={14}/>
        </button>
      </div>
    </div>
  );
}
