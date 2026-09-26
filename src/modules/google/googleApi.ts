import { getTaskEndDate, getTaskEndTime, getTaskDescription } from '../../shared/taskUtils';
import { addDaysToDateStr } from '../../shared/dateUtils';
import {
  getActivityStartDate,
  getActivityStartTime,
  getActivityEndDate,
  getActivityEndTime,
} from '../calendario/activityUtils';

const GOOGLE_TASKS_BASE = 'https://tasks.googleapis.com/tasks/v1';
const GOOGLE_CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';
const DEFAULT_TASK_LIST = '@default';

type LocalTaskLike = {
  title: string;
  endDate?: string;
  endTime?: string;
  dueDate?: string;
  dueTime?: string;
  description?: string;
  notes?: string;
  completed?: boolean;
  googleTaskId?: string;
  googleListId?: string;
  googleEventId?: string;
};

async function googleFetch(url: string, accessToken: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error Google API (${res.status})`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function buildTaskDueIso(task: LocalTaskLike): string | undefined {
  const date = getTaskEndDate(task);
  if (!date) return undefined;
  const time = getTaskEndTime(task);
  const local = time ? `${date}T${time}:00` : `${date}T12:00:00`;
  return new Date(local).toISOString();
}

function buildCalendarTimes(task: LocalTaskLike) {
  const date = getTaskEndDate(task);
  if (!date) return null;
  const time = getTaskEndTime(task);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (time) {
    const [h, m] = time.split(':').map(Number);
    const start = `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
    const endDate = new Date(`${date}T12:00:00`);
    endDate.setHours(h, m, 0, 0);
    endDate.setHours(endDate.getHours() + 1);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;
    return {
      start: { dateTime: start, timeZone: tz },
      end: { dateTime: end, timeZone: tz },
    };
  }
  return {
    start: { date: date },
    end: { date: addDaysToDateStr(date, 1) },
  };
}

function mapLocalTaskToGoogleBody(task: LocalTaskLike) {
  const body: Record<string, string> = { title: task.title || 'Sin título' };
  const notes = getTaskDescription(task);
  if (notes) body.notes = notes;
  const due = buildTaskDueIso(task);
  if (due) body.due = due;
  if (task.completed) body.status = 'completed';
  return body;
}

type LocalActivityLike = {
  title: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  description?: string;
};

function mapLocalTaskToCalendarBody(task: LocalTaskLike) {
  const times = buildCalendarTimes(task);
  if (!times) return null;
  return {
    summary: task.title || 'Sin título',
    description: getTaskDescription(task) || '',
    ...times,
  };
}

function mapLocalActivityToCalendarBody(activity: LocalActivityLike) {
  const startDate = getActivityStartDate(activity);
  if (!startDate) return null;
  const startTime = getActivityStartTime(activity);
  const endDate = getActivityEndDate(activity) || startDate;
  const endTime = getActivityEndTime(activity);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (startTime) {
    const start = `${startDate}T${startTime}:00`;
    let end: string;
    if (endTime) {
      end = `${endDate}T${endTime}:00`;
    } else {
      const endDt = new Date(`${startDate}T12:00:00`);
      const [h, m] = startTime.split(':').map(Number);
      endDt.setHours(h + 1, m, 0, 0);
      end = `${endDt.getFullYear()}-${String(endDt.getMonth() + 1).padStart(2, '0')}-${String(endDt.getDate()).padStart(2, '0')}T${String(endDt.getHours()).padStart(2, '0')}:${String(endDt.getMinutes()).padStart(2, '0')}:00`;
    }
    return {
      summary: activity.title || 'Sin título',
      description: activity.description || '',
      start: { dateTime: start, timeZone: tz },
      end: { dateTime: end, timeZone: tz },
    };
  }

  const endExclusive = endDate !== startDate
    ? addDaysToDateStr(endDate, 1)
    : addDaysToDateStr(startDate, 1);
  return {
    summary: activity.title || 'Sin título',
    description: activity.description || '',
    start: { date: startDate },
    end: { date: endExclusive },
  };
}

export function mapCalendarEventToLocalActivity(gEvent: Record<string, unknown>, taskTitle: string) {
  const start = gEvent.start as { dateTime?: string; date?: string };
  const end = gEvent.end as { dateTime?: string; date?: string };
  return {
    id: `google-event-${gEvent.id}`,
    googleEventId: gEvent.id as string,
    title: (gEvent.summary as string) || taskTitle,
    start: start?.dateTime || (start?.date ? `${start.date}T09:00` : ''),
    end: end?.dateTime || (end?.date ? `${end.date}T10:00` : ''),
    description: (gEvent.description as string) || '',
  };
}

export async function fetchGoogleTasks(accessToken: string) {
  const listsData = await googleFetch(`${GOOGLE_TASKS_BASE}/users/@me/lists`, accessToken);
  const lists = listsData.items || [];
  const allTasks = [];

  for (const list of lists) {
    let pageToken: string | undefined;
    do {
      const qs = new URLSearchParams({ maxResults: '100', showCompleted: 'false' });
      if (pageToken) qs.set('pageToken', pageToken);
      const data = await googleFetch(
        `${GOOGLE_TASKS_BASE}/lists/${list.id}/tasks?${qs}`,
        accessToken
      );
      for (const task of data.items || []) {
        allTasks.push({ ...task, _listId: list.id, _listTitle: list.title });
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
  }
  return allTasks;
}

export async function fetchGoogleCalendarEvents(accessToken: string) {
  const now = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  const qs = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    maxResults: '100',
    singleEvents: 'true',
    orderBy: 'startTime',
  });
  const data = await googleFetch(
    `${GOOGLE_CALENDAR_BASE}/calendars/primary/events?${qs}`,
    accessToken
  );
  return data.items || [];
}

export function mapGoogleTaskToLocal(gTask: Record<string, unknown>, index: number) {
  const due = gTask.due as string | undefined;
  let endDate = '';
  let endTime = '';
  if (due) {
    const d = new Date(due);
    endDate = d.toISOString().slice(0, 10);
    endTime = d.toISOString().slice(11, 16);
  }
  return {
    id: `google-task-${gTask.id}`,
    googleTaskId: gTask.id,
    googleListId: gTask._listId,
    title: (gTask.title as string) || 'Sin título',
    endDate,
    endTime,
    description: (gTask.notes as string) || '',
    folderId: null,
    isRecurring: false,
    recurrence: null,
    subtasks: [],
    attachments: [],
    inCalendar: false,
    completed: gTask.status === 'completed',
    order: Date.now() + index,
  };
}

export async function createGoogleTask(accessToken: string, task: LocalTaskLike, listId = DEFAULT_TASK_LIST) {
  const data = await googleFetch(
    `${GOOGLE_TASKS_BASE}/lists/${listId}/tasks`,
    accessToken,
    { method: 'POST', body: JSON.stringify(mapLocalTaskToGoogleBody(task)) },
  );
  return { googleTaskId: data.id as string, googleListId: listId };
}

export async function updateGoogleTask(
  accessToken: string,
  listId: string,
  taskId: string,
  task: LocalTaskLike,
) {
  await googleFetch(
    `${GOOGLE_TASKS_BASE}/lists/${listId}/tasks/${taskId}`,
    accessToken,
    { method: 'PATCH', body: JSON.stringify(mapLocalTaskToGoogleBody(task)) },
  );
}

export async function deleteGoogleTask(accessToken: string, listId: string, taskId: string) {
  await googleFetch(
    `${GOOGLE_TASKS_BASE}/lists/${listId}/tasks/${taskId}`,
    accessToken,
    { method: 'DELETE' },
  );
}

export async function createGoogleCalendarEvent(accessToken: string, task: LocalTaskLike) {
  const body = mapLocalTaskToCalendarBody(task);
  if (!body) return null;
  const data = await googleFetch(
    `${GOOGLE_CALENDAR_BASE}/calendars/primary/events`,
    accessToken,
    { method: 'POST', body: JSON.stringify(body) },
  );
  return data;
}

export async function createGoogleCalendarEventFromActivity(
  accessToken: string,
  activity: LocalActivityLike,
) {
  const body = mapLocalActivityToCalendarBody(activity);
  if (!body) return null;
  return googleFetch(
    `${GOOGLE_CALENDAR_BASE}/calendars/primary/events`,
    accessToken,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  task: LocalTaskLike,
) {
  const body = mapLocalTaskToCalendarBody(task);
  if (!body) return null;
  await googleFetch(
    `${GOOGLE_CALENDAR_BASE}/calendars/primary/events/${eventId}`,
    accessToken,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
}

export async function updateGoogleCalendarEventFromActivity(
  accessToken: string,
  eventId: string,
  activity: LocalActivityLike,
) {
  const body = mapLocalActivityToCalendarBody(activity);
  if (!body) return null;
  await googleFetch(
    `${GOOGLE_CALENDAR_BASE}/calendars/primary/events/${eventId}`,
    accessToken,
    { method: 'PATCH', body: JSON.stringify(body) },
  );
}

export async function deleteGoogleCalendarEvent(accessToken: string, eventId: string) {
  await googleFetch(
    `${GOOGLE_CALENDAR_BASE}/calendars/primary/events/${eventId}`,
    accessToken,
    { method: 'DELETE' },
  );
}

export function mapGoogleEventToLocal(gEvent: Record<string, unknown>, index: number) {
  const start = gEvent.start as { dateTime?: string; date?: string };
  const end = gEvent.end as { dateTime?: string; date?: string };
  const startStr = start?.dateTime || (start?.date ? `${start.date}T09:00` : '');
  const endStr = end?.dateTime || (end?.date ? `${end.date}T10:00` : '');
  return {
    id: `google-event-${gEvent.id}`,
    googleEventId: gEvent.id,
    title: (gEvent.summary as string) || 'Sin título',
    start: startStr,
    end: endStr,
    description: (gEvent.description as string) || '',
    order: Date.now() + index,
  };
}
