import {
  formatDisplayDate,
  formatDisplayTime,
  getTodayStr,
  addDaysToDateStr,
  compareDateStr,
  parseDateStr,
} from '../../shared/dateUtils';
import {
  normalizeRecurrence,
  formatRecurrenceLabel,
  getNextRecurrenceDate,
} from '../../shared/taskUtils';

export function getActivityStartDate(a) {
  if (a?.startDate) return a.startDate;
  if (a?.start) return a.start.slice(0, 10);
  return '';
}

export function getActivityStartTime(a) {
  if (a?.startTime) return a.startTime;
  if (a?.start?.includes('T')) return a.start.slice(11, 16);
  return '';
}

export function getActivityEndDate(a) {
  if (a?.endDate) return a.endDate;
  if (a?.end) return a.end.slice(0, 10);
  return '';
}

export function getActivityEndTime(a) {
  if (a?.endTime) return a.endTime;
  if (a?.end?.includes('T')) return a.end.slice(11, 16);
  return '';
}

export function buildActivityDatetime(date, time) {
  if (!date) return '';
  return time ? `${date}T${time}` : `${date}T09:00`;
}

function daysBetweenDates(startDate, endDate) {
  if (!startDate || !endDate || endDate === startDate) return 0;
  const ms = parseDateStr(endDate).getTime() - parseDateStr(startDate).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export function normalizeActivity(activity) {
  const startDate = getActivityStartDate(activity);
  const startTime = getActivityStartTime(activity);
  const endDate = getActivityEndDate(activity) || startDate;
  const endTime = getActivityEndTime(activity);
  const isRecurring = Boolean(activity?.isRecurring);
  const recurrence = isRecurring
    ? normalizeRecurrence(activity.recurrence, startDate)
    : null;
  return {
    ...activity,
    startDate,
    startTime,
    endDate,
    endTime,
    isRecurring,
    recurrence,
    start: buildActivityDatetime(startDate, startTime),
    end: buildActivityDatetime(endDate, endTime),
  };
}

export function getActivityRecurrenceLabel(activity) {
  if (!activity?.isRecurring) return '';
  return formatRecurrenceLabel(
    normalizeRecurrence(activity.recurrence, getActivityStartDate(activity)),
  );
}

export function resolveActivitySource(actividad, actividades) {
  const parentId = actividad.parentActivityId ?? actividad.id;
  return actividades.find(a => a.id === parentId) || actividad;
}

export function expandRecurringActivities(actividades, pastDays = 30, futureDays = 120) {
  const rangeStart = addDaysToDateStr(getTodayStr(), -pastDays);
  const rangeEnd = addDaysToDateStr(getTodayStr(), futureDays);
  const expanded = [];

  for (const raw of actividades) {
    const base = normalizeActivity(raw);
    if (!base.isRecurring || !base.recurrence || !base.startDate) {
      expanded.push(base);
      continue;
    }

    const daySpan = daysBetweenDates(base.startDate, base.endDate);
    let iterDate = base.startDate;
    let guard = 0;

    while (compareDateStr(iterDate, rangeStart) < 0 && guard < 366) {
      const next = getNextRecurrenceDate({
        isRecurring: true,
        recurrence: base.recurrence,
        endDate: iterDate,
      });
      if (!next || next === iterDate) break;
      iterDate = next;
      guard++;
    }

    while (iterDate && compareDateStr(iterDate, rangeEnd) <= 0 && guard < 500) {
      if (compareDateStr(iterDate, rangeStart) >= 0) {
        const occurrenceEnd = daySpan > 0 ? addDaysToDateStr(iterDate, daySpan) : iterDate;
        expanded.push(normalizeActivity({
          ...base,
          id: `${base.id}__${iterDate}`,
          parentActivityId: base.id,
          startDate: iterDate,
          endDate: occurrenceEnd,
        }));
      }
      const next = getNextRecurrenceDate({
        isRecurring: true,
        recurrence: base.recurrence,
        endDate: iterDate,
      });
      if (!next || next === iterDate) break;
      iterDate = next;
      guard++;
    }
  }

  return expanded;
}

export function getDateGroupLabel(dateStr) {
  if (!dateStr || dateStr === 'sin-fecha') return 'Sin fecha';
  const today = getTodayStr();
  if (dateStr === today) return 'Hoy';
  if (dateStr === addDaysToDateStr(today, 1)) return 'Mañana';
  if (dateStr === addDaysToDateStr(today, -1)) return 'Ayer';
  return formatDisplayDate(dateStr);
}

export function getActivityDayStatus(dateStr) {
  if (!dateStr) return null;
  const today = getTodayStr();
  if (dateStr === today) return 'today';
  if (compareDateStr(dateStr, today) < 0) return 'past';
  return 'upcoming';
}

export function groupActivitiesByDate(actividades) {
  const sorted = [...actividades]
    .map(a => normalizeActivity(a))
    .sort((a, b) => {
      const aKey = getActivityStartDate(a) || '9999-99-99';
      const bKey = getActivityStartDate(b) || '9999-99-99';
      const dateCmp = compareDateStr(aKey, bKey);
      if (dateCmp !== 0) return dateCmp;
      const aTime = getActivityStartTime(a) || '99:99';
      const bTime = getActivityStartTime(b) || '99:99';
      return aTime.localeCompare(bTime);
    });

  const groups = new Map();
  for (const act of sorted) {
    const dateKey = getActivityStartDate(act) || 'sin-fecha';
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey).push(act);
  }

  return Array.from(groups.entries()).map(([dateKey, items]) => ({
    dateKey,
    label: getDateGroupLabel(dateKey),
    status: getActivityDayStatus(dateKey === 'sin-fecha' ? '' : dateKey),
    items,
  }));
}

export function getActivityDatesWithEvents(actividades) {
  const dates = new Set();
  for (const act of actividades) {
    const d = getActivityStartDate(act);
    if (d) dates.add(d);
  }
  return [...dates];
}

export function formatActivityTimeRange(activity) {
  const startDate = getActivityStartDate(activity);
  const startTime = getActivityStartTime(activity);
  const endDate = getActivityEndDate(activity);
  const endTime = getActivityEndTime(activity);

  if (!startDate) return null;

  const sameDay = !endDate || endDate === startDate;
  const parts = [];

  if (!sameDay && endDate) {
    parts.push(formatDisplayDate(startDate));
    if (startTime) parts.push(formatDisplayTime(startTime));
    parts.push('→');
    parts.push(formatDisplayDate(endDate));
    if (endTime) parts.push(formatDisplayTime(endTime));
    return parts.join(' · ');
  }

  if (startTime && endTime && startTime !== endTime) {
    return `${formatDisplayTime(startTime)} – ${formatDisplayTime(endTime)}`;
  }
  if (startTime) return formatDisplayTime(startTime);
  return null;
}
