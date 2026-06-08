import React, { useState } from 'react';
import {
  SlidersHorizontal, ChevronDown, X, Check,
  Calendar, CalendarOff, Repeat, ListTree, CalendarCheck, FolderOpen,
} from 'lucide-react';

const DATE_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'overdue', label: 'Atrasadas' },
];

const TOGGLE_OPTIONS = [
  { key: 'withDate', label: 'Con fecha', icon: Calendar },
  { key: 'noDate', label: 'Sin fecha', icon: CalendarOff },
  { key: 'recurring', label: 'Recurrentes', icon: Repeat },
  { key: 'withSubtasks', label: 'Con subtareas', icon: ListTree },
  { key: 'inCalendar', label: 'En calendario', icon: CalendarCheck },
  { key: 'emptyFolders', label: 'Carpetas vacías', icon: FolderOpen },
];

export default function TaskFiltersBar({
  dateFilter,
  setDateFilter,
  taskFilters,
  toggleTaskFilter,
  hasActiveFilters,
  clearAllFilters,
  tareasCompletadas,
  clearCompletedTasks,
}) {
  const [expanded, setExpanded] = useState(false);

  const activeToggleCount = Object.values(taskFilters).filter(Boolean).length;
  const activeCount = (dateFilter !== 'all' ? 1 : 0) + activeToggleCount;

  const activeLabels = [
    ...(dateFilter !== 'all' ? [DATE_OPTIONS.find(d => d.id === dateFilter)?.label] : []),
    ...TOGGLE_OPTIONS.filter(o => taskFilters[o.key]).map(o => o.label),
  ];

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-zinc-800/20 transition-colors"
      >
        <SlidersHorizontal size={15} className="text-zinc-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-300">Filtros</span>
            {activeCount > 0 && (
              <span className="text-[10px] font-semibold bg-violet-950/60 text-violet-300 border border-violet-800/40 px-1.5 py-px rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          {!expanded && activeLabels.length > 0 && (
            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{activeLabels.join(' · ')}</p>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-zinc-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-800/60 space-y-4">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Plazo</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DATE_OPTIONS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDateFilter(f.id)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                    dateFilter === f.id
                      ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                      : 'bg-zinc-950/60 text-zinc-500 border border-zinc-800/80 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Propiedades</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {TOGGLE_OPTIONS.map(({ key, label, icon: Icon }) => {
                const active = taskFilters[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleTaskFilter(key)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
                      active
                        ? 'bg-violet-950/35 text-violet-200 border border-violet-800/50'
                        : 'text-zinc-500 border border-transparent hover:bg-zinc-800/40 hover:text-zinc-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      active ? 'bg-violet-500/20 border-violet-500/60' : 'border-zinc-700 bg-zinc-950/50'
                    }`}>
                      {active && <Check size={10} className="text-violet-300" strokeWidth={3} />}
                    </span>
                    <Icon size={13} className={active ? 'text-violet-400' : 'text-zinc-600'} />
                    <span className="font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/40">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={12} /> Limpiar filtros
              </button>
            ) : (
              <span className="text-[11px] text-zinc-600">Sin filtros activos</span>
            )}
            {tareasCompletadas.length > 0 && (
              <button
                type="button"
                onClick={clearCompletedTasks}
                className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors ml-auto"
              >
                Limpiar completadas
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
