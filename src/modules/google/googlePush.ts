import { getTaskEndDate } from '../../shared/taskUtils';
import { getStoredToken } from './googleOAuth';
import {
  createGoogleTask,
  updateGoogleTask,
  deleteGoogleTask,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  createGoogleCalendarEventFromActivity,
  updateGoogleCalendarEventFromActivity,
  mapCalendarEventToLocalActivity,
} from './googleApi';

export type GoogleTaskUpdates = {
  googleTaskId?: string;
  googleListId?: string;
  googleEventId?: string | null;
  inCalendar?: boolean;
};

export type GooglePushResult = {
  taskUpdates: GoogleTaskUpdates;
  activity?: ReturnType<typeof mapCalendarEventToLocalActivity> & { id: number | string };
};

function hasCalendarDate(task: { endDate?: string; dueDate?: string }) {
  return Boolean(getTaskEndDate(task));
}

export async function pushNewTaskToGoogle(task: Record<string, unknown>): Promise<GooglePushResult> {
  const token = getStoredToken();
  if (!token) return { taskUpdates: {} };

  const taskUpdates: GoogleTaskUpdates = {};
  let activity: GooglePushResult['activity'];

  if (!task.googleTaskId) {
    const created = await createGoogleTask(token, task as Parameters<typeof createGoogleTask>[1]);
    taskUpdates.googleTaskId = created.googleTaskId;
    taskUpdates.googleListId = created.googleListId;
  }

  if (hasCalendarDate(task) && !task.googleEventId) {
    const gEvent = await createGoogleCalendarEvent(token, task as Parameters<typeof createGoogleCalendarEvent>[1]);
    if (gEvent) {
      taskUpdates.googleEventId = gEvent.id;
      taskUpdates.inCalendar = true;
      activity = {
        ...mapCalendarEventToLocalActivity(gEvent, (task.title as string) || ''),
        id: Date.now(),
      };
    }
  }

  return { taskUpdates, activity };
}

export async function pushTaskUpdateToGoogle(
  task: Record<string, unknown>,
  prev?: Record<string, unknown>,
): Promise<GooglePushResult> {
  const token = getStoredToken();
  if (!token) return { taskUpdates: {} };

  const taskUpdates: GoogleTaskUpdates = {};
  let activity: GooglePushResult['activity'];

  if (task.googleTaskId && task.googleListId) {
    await updateGoogleTask(
      token,
      task.googleListId as string,
      task.googleTaskId as string,
      task as Parameters<typeof updateGoogleTask>[3],
    );
  } else if (!task.googleTaskId) {
    const created = await createGoogleTask(token, task as Parameters<typeof createGoogleTask>[1]);
    taskUpdates.googleTaskId = created.googleTaskId;
    taskUpdates.googleListId = created.googleListId;
  }

  const hadDate = prev ? hasCalendarDate(prev) : false;
  const hasDate = hasCalendarDate(task);

  if (task.googleEventId) {
    if (hasDate) {
      await updateGoogleCalendarEvent(
        token,
        task.googleEventId as string,
        task as Parameters<typeof updateGoogleCalendarEvent>[2],
      );
      taskUpdates.inCalendar = true;
    } else {
      await deleteGoogleCalendarEvent(token, task.googleEventId as string);
      taskUpdates.googleEventId = null;
      taskUpdates.inCalendar = false;
    }
  } else if (hasDate) {
    const gEvent = await createGoogleCalendarEvent(token, task as Parameters<typeof createGoogleCalendarEvent>[1]);
    if (gEvent) {
      taskUpdates.googleEventId = gEvent.id;
      taskUpdates.inCalendar = true;
      activity = {
        ...mapCalendarEventToLocalActivity(gEvent, (task.title as string) || ''),
        id: Date.now(),
      };
    }
  } else if (hadDate && !hasDate) {
    taskUpdates.inCalendar = false;
  }

  return { taskUpdates, activity };
}

export async function pushTaskCompletionToGoogle(task: Record<string, unknown>) {
  const token = getStoredToken();
  if (!token || !task.googleTaskId || !task.googleListId) return;

  await updateGoogleTask(
    token,
    task.googleListId as string,
    task.googleTaskId as string,
    { ...task, completed: true } as Parameters<typeof updateGoogleTask>[3],
  );
}

export type GoogleActivityUpdates = {
  googleEventId?: string | null;
};

export async function pushNewActivityToGoogle(
  activity: Record<string, unknown>,
): Promise<{ activityUpdates: GoogleActivityUpdates }> {
  const token = getStoredToken();
  if (!token) return { activityUpdates: {} };

  if (activity.googleEventId) return { activityUpdates: {} };

  const gEvent = await createGoogleCalendarEventFromActivity(
    token,
    activity as Parameters<typeof createGoogleCalendarEventFromActivity>[1],
  );
  if (!gEvent) return { activityUpdates: {} };
  return { activityUpdates: { googleEventId: gEvent.id as string } };
}

export async function pushActivityUpdateToGoogle(
  activity: Record<string, unknown>,
): Promise<{ activityUpdates: GoogleActivityUpdates }> {
  const token = getStoredToken();
  if (!token) return { activityUpdates: {} };

  if (activity.googleEventId) {
    await updateGoogleCalendarEventFromActivity(
      token,
      activity.googleEventId as string,
      activity as Parameters<typeof updateGoogleCalendarEventFromActivity>[2],
    );
    return { activityUpdates: {} };
  }

  const gEvent = await createGoogleCalendarEventFromActivity(
    token,
    activity as Parameters<typeof createGoogleCalendarEventFromActivity>[1],
  );
  if (!gEvent) return { activityUpdates: {} };
  return { activityUpdates: { googleEventId: gEvent.id as string } };
}

export async function pushActivityDeletionToGoogle(activity: Record<string, unknown>) {
  const token = getStoredToken();
  if (!token || !activity.googleEventId) return;
  await deleteGoogleCalendarEvent(token, activity.googleEventId as string);
}

export function applyGoogleActivityPushResult(
  activityId: number | string,
  updates: GoogleActivityUpdates,
  setActividades: SetState<Record<string, unknown>[]>,
) {
  if (!updates || Object.keys(updates).length === 0) return;
  setActividades(prev =>
    prev.map(a => (a.id === activityId ? { ...a, ...updates } : a)),
  );
}

export async function pushTaskDeletionToGoogle(task: Record<string, unknown>) {
  const token = getStoredToken();
  if (!token) return;

  if (task.googleTaskId && task.googleListId) {
    await deleteGoogleTask(token, task.googleListId as string, task.googleTaskId as string);
  }
  if (task.googleEventId) {
    await deleteGoogleCalendarEvent(token, task.googleEventId as string);
  }
}

type SetState<T> = (value: T | ((prev: T) => T)) => void;

export function applyGooglePushResult(
  taskId: number | string,
  result: GooglePushResult,
  setTareas: SetState<Record<string, unknown>[]>,
  setActividades?: SetState<Record<string, unknown>[]>,
) {
  const { taskUpdates, activity } = result;
  if (taskUpdates && Object.keys(taskUpdates).length > 0) {
    setTareas(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...taskUpdates } : t)),
    );
  }
  if (activity && setActividades) {
    setActividades(prev => {
      const existing = prev.find(a => a.googleEventId === activity.googleEventId);
      if (existing) {
        return prev.map(a =>
          a.googleEventId === activity.googleEventId ? { ...a, ...activity } : a,
        );
      }
      return [...prev, activity];
    });
  }
}
