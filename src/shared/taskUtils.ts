import { DEFAULT_RECURRENCE, WEEKDAY_NAMES } from './constants';
import {
  toDateStr, parseDateStr, getTodayStr, getWeekEndStr,
  compareDateStr, addDaysToDateStr,
} from './dateUtils';

export const getTaskEndDate = (t) => t?.endDate || t?.dueDate || '';
export const getTaskEndTime = (t) => t?.endTime || t?.dueTime || '';
export const getTaskDescription = (t) => t?.description ?? t?.notes ?? '';

export const formatTaskDeadline = (t) => {
  const date = getTaskEndDate(t);
  const time = getTaskEndTime(t);
  if (!date) return null;
  return time ? `${date} · ${time}` : date;
};

export const getDayFromEndDate = (endDate) => {
  if (!endDate) return 1;
  return new Date(`${endDate}T12:00`).getDay();
};

export const getMonthDayFromEndDate = (endDate) => {
  if (!endDate) return 1;
  return new Date(`${endDate}T12:00`).getDate();
};

export const normalizeRecurrence = (recurrence, endDate = '') => {
  if (!recurrence) return { ...DEFAULT_RECURRENCE, monthDay: getMonthDayFromEndDate(endDate) };
  const interval = Math.min(99, Math.max(1, recurrence.interval || 1));
  const weekDays = recurrence.weekDays?.length
    ? [...recurrence.weekDays]
    : [getDayFromEndDate(endDate)];
  return {
    type: recurrence.type || 'weekly',
    interval,
    weekDays,
    monthDay: recurrence.monthDay || getMonthDayFromEndDate(endDate),
  };
};

export const getIntervalUnitLabel = (type, interval) => {
  const plural = interval !== 1;
  const units = {
    daily: plural ? 'días' : 'día',
    weekly: plural ? 'semanas' : 'semana',
    monthly: plural ? 'meses' : 'mes',
    yearly: plural ? 'años' : 'año',
  };
  return units[type] || '';
};

export const formatRecurrenceLabel = (recurrence) => {
  if (!recurrence) return '';
  const { type, interval, weekDays, monthDay } = recurrence;
  switch (type) {
    case 'daily':
      return interval === 1 ? 'Todos los días' : `Cada ${interval} días`;
    case 'weekdays':
      return 'De lunes a viernes';
    case 'weekly': {
      const days = weekDays.map(id => WEEKDAY_NAMES[id]).join(', ');
      if (interval === 1) return days ? `Cada semana: ${days}` : 'Cada semana';
      return days ? `Cada ${interval} semanas: ${days}` : `Cada ${interval} semanas`;
    }
    case 'monthly': {
      const day = monthDay || 1;
      return interval === 1 ? `Día ${day} de cada mes` : `Día ${day} cada ${interval} meses`;
    }
    case 'yearly':
      return interval === 1 ? 'Cada año' : `Cada ${interval} años`;
    default:
      return '';
  }
};

export const getRecurrenceLabel = (task) => {
  if (!task?.isRecurring) return '';
  const r = task.recurrence || (task.recurrenceFreq
    ? normalizeRecurrence({ type: task.recurrenceFreq, interval: 1, weekDays: [1], monthDay: 1 }, getTaskEndDate(task))
    : null);
  return formatRecurrenceLabel(r);
};

export const getTaskDueStatus = (task) => {
  if (task?.completed) return 'none';
  const date = getTaskEndDate(task);
  if (!date) return 'none';
  const today = getTodayStr();
  if (date < today) return 'overdue';
  if (date === today) return 'today';
  if (date <= getWeekEndStr()) return 'week';
  return 'future';
};

export const getNextRecurrenceDate = (task) => {
  if (!task?.isRecurring) return null;
  const baseDate = getTaskEndDate(task) || getTodayStr();
  const rec = normalizeRecurrence(task.recurrence, baseDate);

  if (rec.type === 'daily') return addDaysToDateStr(baseDate, rec.interval);

  if (rec.type === 'weekdays') {
    let next = addDaysToDateStr(baseDate, 1);
    for (let i = 0; i < 14; i++) {
      const dow = parseDateStr(next).getDay();
      if (dow >= 1 && dow <= 5) return next;
      next = addDaysToDateStr(next, 1);
    }
    return next;
  }

  if (rec.type === 'weekly') {
    const currentDow = parseDateStr(baseDate).getDay();
    const order = [1, 2, 3, 4, 5, 6, 0];
    const days = [...rec.weekDays].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    for (const d of days) {
      if (d > currentDow) return addDaysToDateStr(baseDate, d - currentDow);
    }
    const firstDay = days[0];
    const daysUntil = (7 - currentDow + firstDay) % 7 || 7;
    return addDaysToDateStr(baseDate, daysUntil + (rec.interval - 1) * 7);
  }

  if (rec.type === 'monthly') {
    const [y, m] = baseDate.split('-').map(Number);
    const nd = new Date(y, m - 1 + rec.interval, rec.monthDay);
    const maxDay = new Date(nd.getFullYear(), nd.getMonth() + 1, 0).getDate();
    return toDateStr(nd.getFullYear(), nd.getMonth(), Math.min(rec.monthDay, maxDay));
  }

  if (rec.type === 'yearly') {
    const [y, mo, d] = baseDate.split('-').map(Number);
    return toDateStr(y + rec.interval, mo - 1, d);
  }
  return null;
};

export const createNextRecurringTask = (task) => {
  const nextDate = getNextRecurrenceDate(task);
  if (!nextDate) return null;
  return {
    ...task,
    id: Date.now() + Math.random(),
    endDate: nextDate,
    completed: false,
    inCalendar: false,
    order: Date.now(),
    subtasks: (task.subtasks || []).map(st => ({
      ...st,
      id: Date.now() + Math.random(),
      completed: false,
    })),
  };
};

export const sortTasksByDate = (list) =>
  [...list].sort((a, b) => {
    const da = getTaskEndDate(a);
    const db = getTaskEndDate(b);
    if (!da && !db) return (a.order ?? 0) - (b.order ?? 0);
    if (!da) return 1;
    if (!db) return -1;
    const cmp = compareDateStr(da, db);
    if (cmp !== 0) return cmp;
    return (getTaskEndTime(a) || '').localeCompare(getTaskEndTime(b) || '');
  });

export const sortTasksForDisplay = (list) =>
  [...list].sort((a, b) => {
    const oa = a.order ?? a.id ?? 0;
    const ob = b.order ?? b.id ?? 0;
    if (oa !== ob) return oa - ob;
    const da = getTaskEndDate(a);
    const db = getTaskEndDate(b);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    const cmp = compareDateStr(da, db);
    if (cmp !== 0) return cmp;
    return (getTaskEndTime(a) || '').localeCompare(getTaskEndTime(b) || '');
  });
