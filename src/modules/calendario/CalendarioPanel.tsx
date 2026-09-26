import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus, CalendarDays, ListTodo, ChevronLeft, ChevronRight, Calendar, ChevronDown,
} from 'lucide-react';
import {
  groupActivitiesByDate,
  getDateGroupLabel,
  getActivityDayStatus,
  getActivityDatesWithEvents,
  getActivityStartDate,
  expandRecurringActivities,
  resolveActivitySource,
} from './activityUtils';
import {
  getTodayStr,
  addDaysToDateStr,
  formatDisplayDate,
} from '../../shared/dateUtils';
import CalendarPicker from '../../shared/ui/CalendarPicker';
import EventCard from './EventCard';

function buildDateStrip(centerDate, before = 5, after = 14) {
  const dates = [];
  for (let i = -before; i <= after; i++) {
    dates.push(addDaysToDateStr(centerDate, i));
  }
  return dates;
}

export default function CalendarioPanel({
  actividades,
  quickActivityTitle,
  setQuickActivityTitle,
  handleQuickAddActivity,
  openCreateActivity,
  openModal,
}) {
  const [focusDate, setFocusDate] = useState(getTodayStr);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const stripRef = useRef(null);

  const displayActivities = useMemo(
    () => expandRecurringActivities(actividades),
    [actividades],
  );
  const groups = groupActivitiesByDate(displayActivities);
  const hasEvents = displayActivities.length > 0;
  const markedDates = useMemo(() => getActivityDatesWithEvents(displayActivities), [displayActivities]);
  const dateStrip = useMemo(() => buildDateStrip(focusDate), [focusDate]);

  const openActivityDetails = (act) =>
    openModal('detalles-actividad', resolveActivitySource(act, actividades));
  const openActivityEdit = (act) =>
    openModal('editar-actividad', resolveActivitySource(act, actividades));

  const visibleGroups = viewAll
    ? groups
    : groups.filter(g => g.dateKey === focusDate);

  const focusDayStatus = getActivityDayStatus(focusDate);

  useEffect(() => {
    if (viewAll) {
      sectionRefs.current[focusDate]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [focusDate, viewAll]);

  useEffect(() => {
    const el = stripRef.current?.querySelector(`[data-date="${focusDate}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [focusDate]);

  const goDay = (delta) => {
    setViewAll(false);
    setFocusDate(d => addDaysToDateStr(d, delta));
  };

  const pickDate = (dateStr) => {
    if (!dateStr) return;
    setViewAll(false);
    setFocusDate(dateStr);
    setShowCalendar(false);
  };

  const countOnDate = (dateStr) =>
    displayActivities.filter(a => getActivityStartDate(a) === dateStr).length;

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div className="shrink-0 flex-none space-y-3 pb-3 border-b border-zinc-900 bg-zinc-950 z-10">
        <form onSubmit={handleQuickAddActivity} className="flex gap-2">
          <input
            type="text"
            placeholder="Añadir evento… (Enter)"
            value={quickActivityTitle}
            onChange={(e) => setQuickActivityTitle(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors shrink-0"
            title="Añadir"
          >
            <Plus size={18} />
          </button>
        </form>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goDay(-1)}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors shrink-0"
            title="Día anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setShowCalendar(v => !v)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                showCalendar
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
              }`}
            >
              <Calendar size={14} className="text-zinc-400 shrink-0" />
              <span className="truncate">{getDateGroupLabel(focusDate)}</span>
              <ChevronDown size={14} className={`text-zinc-500 shrink-0 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
            </button>
            {showCalendar && (
              <>
                <div className="fixed inset-0 z-[150]" onClick={() => setShowCalendar(false)} aria-hidden />
                <div className="absolute left-0 right-0 top-full mt-1.5 z-[151]">
                  <CalendarPicker
                    value={focusDate}
                    onChange={pickDate}
                    onPick={() => setShowCalendar(false)}
                    allowPast
                    markedDates={markedDates}
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => goDay(1)}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors shrink-0"
            title="Día siguiente"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => { setFocusDate(getTodayStr()); setViewAll(false); }}
            className="px-2.5 py-2 rounded-lg text-[11px] font-medium border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors shrink-0"
          >
            Hoy
          </button>
        </div>

        <div
          ref={stripRef}
          className="flex gap-1.5 overflow-x-auto onyx-scroll pb-0.5 -mx-0.5 px-0.5"
        >
          {dateStrip.map(dateStr => {
            const isSelected = dateStr === focusDate && !viewAll;
            const status = getActivityDayStatus(dateStr);
            const count = countOnDate(dateStr);
            const isToday = dateStr === getTodayStr();
            return (
              <button
                key={dateStr}
                type="button"
                data-date={dateStr}
                onClick={() => { setFocusDate(dateStr); setViewAll(false); }}
                className={`shrink-0 flex flex-col items-center min-w-[3rem] px-2 py-1.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-950'
                    : isToday
                      ? 'bg-zinc-800/80 border-zinc-600 text-zinc-200'
                      : status === 'past'
                        ? 'bg-zinc-950 border-zinc-800/80 text-zinc-500 hover:border-zinc-700'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wide opacity-70">
                  {dateStr === getTodayStr() ? 'Hoy' : dateStr.slice(8, 10)}
                </span>
                <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-zinc-950' : ''}`}>
                  {formatDisplayDate(dateStr).split(' ')[0]}
                </span>
                {count > 0 && (
                  <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-zinc-600' : 'text-sky-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateActivity}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
          >
            <CalendarDays size={14} />
            Nuevo evento
          </button>
          {hasEvents && (
            <button
              type="button"
              onClick={() => setViewAll(v => !v)}
              className={`px-3 py-2 rounded-xl text-[11px] font-medium border transition-colors shrink-0 ${
                viewAll
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {viewAll ? 'Un día' : 'Todos'}
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto onyx-scroll min-h-0 pt-4">
        {!hasEvents ? (
          <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <ListTodo size={32} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400 mb-1">No hay eventos en el calendario</p>
            <p className="text-xs text-zinc-600 mb-4">Añade uno arriba o pulsa Nuevo evento</p>
            <button
              type="button"
              onClick={openCreateActivity}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
            >
              Nuevo evento
            </button>
          </div>
        ) : viewAll ? (
          <div className="space-y-8">
            {groups.map(group => (
              <section
                key={group.dateKey}
                ref={el => { sectionRefs.current[group.dateKey] = el; }}
              >
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-zinc-950/95 backdrop-blur-sm py-1 z-[1]">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    group.status === 'today' ? 'bg-orange-400' :
                    group.status === 'past' ? 'bg-zinc-600' : 'bg-sky-400'
                  }`} />
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                    group.status === 'today' ? 'text-orange-300' :
                    group.status === 'past' ? 'text-zinc-500' : 'text-zinc-300'
                  }`}>
                    {group.label}
                  </h3>
                  <span className="text-[11px] text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-md">
                    {group.items.length}
                  </span>
                </div>
                <div className="relative ml-1 pl-4 border-l border-zinc-800/80 space-y-2">
                  {group.items.map(actividad => (
                    <EventCard
                      key={actividad.id}
                      actividad={actividad}
                      onOpenDetails={openActivityDetails}
                      onOpenEdit={openActivityEdit}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : visibleGroups.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                focusDayStatus === 'today' ? 'bg-orange-400' :
                focusDayStatus === 'past' ? 'bg-zinc-600' : 'bg-sky-400'
              }`} />
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                focusDayStatus === 'today' ? 'text-orange-300' : 'text-zinc-300'
              }`}>
                {getDateGroupLabel(focusDate)}
              </h3>
            </div>
            {visibleGroups[0].items.map(actividad => (
              <EventCard
                key={actividad.id}
                actividad={actividad}
                onOpenDetails={openActivityDetails}
                onOpenEdit={openActivityEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <Calendar size={28} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400 mb-1">Sin eventos el {formatDisplayDate(focusDate)}</p>
            <p className="text-xs text-zinc-600 mb-4">Desplázate con las flechas o el calendario</p>
            <button
              type="button"
              onClick={openCreateActivity}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
            >
              Nuevo evento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
