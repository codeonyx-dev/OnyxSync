import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar, Clock, Circle, CheckCircle2, Edit2, Eye, ArrowUpRight,
  Folder, CalendarCheck, Paperclip, FileText, Repeat, GripVertical,
} from 'lucide-react';
import { FOLDER_COLORS, DUE_STATUS_STYLES } from '../../shared/constants';
import {
  getTaskEndDate, getTaskEndTime, getTaskDescription, formatTaskDeadline,
  getTaskDueStatus, getRecurrenceLabel,
} from '../../shared/taskUtils';
import { formatDisplayDate, formatDisplayTime } from '../../shared/dateUtils';
import { taskDndId } from './dnd';

export default function TareaCard({
  tarea,
  sortListId,
  activeFolderId,
  movePickerOpen,
  carpeta,
  folderPathLabel,
  onToggleComplete,
  onOpenDetails,
  onOpenEdit,
  onToggleMovePicker,
  onConversion,
  onToggleSubtask,
  onPromoteSubtask,
  folderPicker,
  isSelected = false,
}) {
  const color = carpeta ? FOLDER_COLORS[carpeta.colorIdx] : null;
  const dueStatus = getTaskDueStatus(tarea);
  const subtasks = tarea.subtasks || [];
  const completedSubs = subtasks.filter(st => st.completed).length;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskDndId(tarea.id),
    data: { type: 'task', taskId: tarea.id, sortListId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-zinc-900/30 border hover:border-zinc-700 transition-colors rounded-lg px-2.5 py-2 relative ${
        isSelected ? 'border-blue-500/60 bg-blue-950/20 ring-1 ring-blue-500/30' : 'border-zinc-800'
      } ${isDragging ? 'opacity-40 border-zinc-600' : ''} ${dueStatus === 'overdue' && !isSelected ? 'border-red-900/40 hover:border-red-800/60' : ''}`}
    >
      {color && (
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl ${color.dot}`} style={{ opacity: 0.8 }} />
      )}
      <div className="flex items-start gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="mt-1 p-1 -ml-0.5 text-zinc-500 hover:text-zinc-200 cursor-grab active:cursor-grabbing shrink-0 touch-none select-none rounded hover:bg-zinc-800/80"
          title="Arrastrar para mover o reordenar"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={15} />
        </button>
        <button onClick={() => onToggleComplete(tarea.id)} className="mt-px text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
          <Circle size={16} strokeWidth={1.5} />
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenDetails(tarea)}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-medium text-sm text-zinc-100 leading-snug">{tarea.title}</h3>
            {(dueStatus === 'overdue' || dueStatus === 'today') && (
              <span className={`text-[9px] uppercase tracking-wide font-semibold px-1.5 py-px rounded-full border ${DUE_STATUS_STYLES[dueStatus]}`}>
                {dueStatus === 'overdue' ? 'Atrasada' : 'Hoy'}
              </span>
            )}
            {tarea.inCalendar && (
              <span className="text-[9px] uppercase tracking-wide font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 px-1.5 py-px rounded-full">Calendario</span>
            )}
            {tarea.isRecurring && (
              <span className="text-[9px] uppercase tracking-wide font-semibold bg-violet-950/50 text-violet-400 border border-violet-900/50 px-1.5 py-px rounded-full flex items-center gap-0.5 max-w-[140px] truncate">
                <Repeat size={9} className="shrink-0" /> <span className="truncate">{getRecurrenceLabel(tarea)}</span>
              </span>
            )}
            {getTaskDescription(tarea) && (
              <span className="text-[9px] font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 px-1 py-px rounded-full" title="Tiene descripción">
                <FileText size={9} className="inline" />
              </span>
            )}
            {tarea.attachments?.length > 0 && (
              <span className="text-[9px] font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 px-1.5 py-px rounded-full flex items-center gap-0.5">
                <Paperclip size={9} /> {tarea.attachments.length}
              </span>
            )}
            {activeFolderId === null && carpeta && folderPathLabel && (
              <span className={`text-[9px] uppercase tracking-wide font-semibold px-1.5 py-px rounded-full border truncate max-w-[120px] ${color.bg} ${color.text} ${color.border}`}>
                {folderPathLabel}
              </span>
            )}
          </div>
          {formatTaskDeadline(tarea) && (
            <p className={`text-[10px] mt-px flex items-center gap-2 flex-wrap ${dueStatus === 'overdue' ? 'text-red-400/80' : dueStatus === 'today' ? 'text-orange-400/80' : 'text-zinc-500'}`}>
              <span className="flex items-center gap-0.5"><Calendar size={9} /> {formatDisplayDate(getTaskEndDate(tarea))}</span>
              {getTaskEndTime(tarea) && <span className="flex items-center gap-0.5"><Clock size={9} /> {formatDisplayTime(getTaskEndTime(tarea))}</span>}
            </p>
          )}
          {subtasks.length > 0 && (
            <>
              <div className="mt-1 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/50 rounded-full transition-all" style={{ width: `${(completedSubs / subtasks.length) * 100}%` }} />
              </div>
              <div className="mt-1 flex flex-col gap-px pl-1 border-l border-zinc-800">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-1.5 group/st min-h-[20px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={(e) => onToggleSubtask(tarea.id, st.id, e)} className={`shrink-0 transition-colors ${st.completed ? 'text-emerald-500/80 hover:text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}`}>
                      {st.completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                    </button>
                    <span className={`text-[11px] leading-tight truncate flex-1 ${st.completed ? 'text-zinc-500 line-through' : 'text-zinc-400'}`}>{st.title}</span>
                    <button onClick={(e) => onPromoteSubtask(tarea.id, st.id, e)} className="ml-auto shrink-0 p-1 rounded-md bg-amber-950/50 border border-amber-800/50 text-amber-400 hover:bg-amber-900/60 hover:text-amber-300 transition-colors" title="Convertir en tarea principal">
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleMovePicker(tarea.id)}
            className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Mover a carpeta"
          >
            <Folder size={14} />
          </button>
          {!tarea.inCalendar && (
            <button onClick={() => onConversion(tarea)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors" title="Fijar en Calendario">
              <CalendarCheck size={14} />
            </button>
          )}
          <button onClick={() => onOpenEdit(tarea)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors" title="Editar">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onOpenDetails(tarea)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors" title="Ver Detalles">
            <Eye size={14} />
          </button>
        </div>
      </div>
      {movePickerOpen && folderPicker && (
        <div className="mt-2 pt-2 border-t border-zinc-800/60" onClick={(e) => e.stopPropagation()}>
          <p className="text-[10px] text-zinc-500 mb-1.5 ml-1">Mover a carpeta</p>
          {folderPicker}
        </div>
      )}
    </div>
  );
}
