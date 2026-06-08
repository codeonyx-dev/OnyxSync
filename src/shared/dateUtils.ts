import { MONTH_NAMES, CAL_HEADERS } from './constants';

export const toDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const parseDateStr = (dateStr) => new Date(`${dateStr}T12:00:00`);

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'Seleccionar fecha';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
};

export const formatDisplayTime = (timeStr) => {
  if (!timeStr) return 'Seleccionar hora';
  const [h, min] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 || 12;
  return `${h12}:${String(min).padStart(2, '0')} ${ampm}`;
};

export const getTodayStr = () => {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
};

export const compareDateStr = (a, b) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
};

export const getWeekEndStr = () => {
  const t = new Date();
  const day = t.getDay();
  t.setDate(t.getDate() + (day === 0 ? 0 : 7 - day));
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
};

export const addDaysToDateStr = (dateStr, days) => {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
};

export const getCalendarDays = (year, month) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startPad = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay; d++) days.push(d);
  return days;
};

export const parseTime12 = (timeStr) => {
  if (!timeStr) return { h12: '', min: '', ampm: 'AM' };
  const [h, min] = timeStr.split(':').map(Number);
  return {
    h12: String(h % 12 || 12),
    min: String(min).padStart(2, '0'),
    ampm: h >= 12 ? 'PM' : 'AM',
  };
};

export const toTime24 = (h12, min, ampm) => {
  let h = parseInt(h12, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
};

export { MONTH_NAMES, CAL_HEADERS };
