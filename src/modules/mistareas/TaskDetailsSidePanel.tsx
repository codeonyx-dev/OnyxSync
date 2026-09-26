import React from 'react';
import { X, ListTodo } from 'lucide-react';
import TaskDetailsContent from './TaskDetailsContent';

export default function TaskDetailsSidePanel({
  tarea,
  carpetas,
  onClose,
  onEdit,
  onConversion,
  onToggleComplete,
  onDelete,
  onToggleSubtask,
  onPromoteSubtask,
}) {
  if (!tarea) return null;

  return (
    <aside className="hidden xl:flex flex-col w-[min(400px,36vw)] shrink-0 h-full min-h-0 border border-zinc-800 rounded-2xl bg-zinc-900/50 overflow-hidden shadow-xl shadow-black/20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 bg-zinc-950/60 shrink-0">
        <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
          <ListTodo size={16} className="text-zinc-400" />
          Detalles
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
          title="Cerrar panel"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto onyx-scroll p-4">
        <TaskDetailsContent
          tarea={tarea}
          carpetas={carpetas}
          onEdit={onEdit}
          onConversion={onConversion}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onToggleSubtask={onToggleSubtask}
          onPromoteSubtask={onPromoteSubtask}
        />
      </div>
    </aside>
  );
}
