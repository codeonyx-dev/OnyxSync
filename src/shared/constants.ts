export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

export const WEEKDAYS = [
  { id: 1, label: 'L' },
  { id: 2, label: 'M' },
  { id: 3, label: 'X' },
  { id: 4, label: 'J' },
  { id: 5, label: 'V' },
  { id: 6, label: 'S' },
  { id: 0, label: 'D' },
];

export const WEEKDAY_NAMES = {
  0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miércoles',
  4: 'jueves', 5: 'viernes', 6: 'sábado',
};

export const RECURRENCE_TYPES = [
  { id: 'daily', label: 'Día' },
  { id: 'weekdays', label: 'Laborables' },
  { id: 'weekly', label: 'Semana' },
  { id: 'monthly', label: 'Mes' },
  { id: 'yearly', label: 'Año' },
];

export const DEFAULT_RECURRENCE = {
  type: 'weekly',
  interval: 1,
  weekDays: [1, 2, 3, 4, 5],
  monthDay: 1,
};

export const DUE_STATUS_STYLES = {
  overdue: 'bg-red-950/50 text-red-400 border-red-900/50',
  today: 'bg-orange-950/50 text-orange-400 border-orange-900/50',
};

export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const CAL_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const EMPTY_TAREA = {
  title: '',
  endDate: '',
  endTime: '',
  description: '',
  folderId: null,
  isRecurring: false,
  recurrence: null,
};

export const EMPTY_ACTIVIDAD = {
  title: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  description: '',
  isRecurring: false,
  recurrence: null,
};

export const FOLDER_COLORS = [
  { name: 'Zinc',    bg: 'bg-zinc-700',    text: 'text-zinc-300',    border: 'border-zinc-600',    dot: 'bg-zinc-400'    },
  { name: 'Azul',    bg: 'bg-blue-900/60', text: 'text-blue-300',    border: 'border-blue-800/60', dot: 'bg-blue-400'    },
  { name: 'Verde',   bg: 'bg-emerald-900/60', text: 'text-emerald-300', border: 'border-emerald-800/60', dot: 'bg-emerald-400' },
  { name: 'Violeta', bg: 'bg-violet-900/60', text: 'text-violet-300', border: 'border-violet-800/60', dot: 'bg-violet-400' },
  { name: 'Naranja', bg: 'bg-orange-900/60', text: 'text-orange-300', border: 'border-orange-800/60', dot: 'bg-orange-400' },
  { name: 'Rosa',    bg: 'bg-pink-900/60',  text: 'text-pink-300',   border: 'border-pink-800/60',  dot: 'bg-pink-400'   },
  { name: 'Rojo',    bg: 'bg-red-900/60',   text: 'text-red-300',    border: 'border-red-800/60',   dot: 'bg-red-400'    },
  { name: 'Amarillo',bg: 'bg-yellow-900/60',text: 'text-yellow-300', border: 'border-yellow-800/60',dot: 'bg-yellow-400' },
];
