import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  Plus, X, Calendar, Clock, ListTodo, Edit2, FolderPlus,
} from 'lucide-react';
import Navbar from './components/layout/Navbar';
import TabBar from './components/layout/TabBar';
import ConfirmDialog from './components/shared/ConfirmDialog';
import UndoToast from './components/shared/UndoToast';
import MisTareasPanel from './modules/mistareas/MisTareasPanel';
import CalendarioPanel from './modules/calendario/CalendarioPanel';
import TaskModals from './modules/mistareas/TaskModals';
import ActivityModals from './modules/calendario/ActivityModals';
import { EMPTY_TAREA, MAX_ATTACHMENT_SIZE } from './shared/constants';
import { readFileAsDataUrl } from './shared/fileUtils';
import {
  getTaskEndDate, getTaskEndTime, getTaskDescription, normalizeRecurrence,
  getTaskDueStatus, getRecurrenceLabel, createNextRecurringTask,
  sortTasksByDate, sortTasksForDisplay,
} from './shared/taskUtils';
import {
  getCarpeta, getChildFolders, getDescendantIds, isFolderEmpty,
} from './modules/mistareas/folderUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState('tareas');

  const [carpetas, setCarpetas] = useState([
    { id: 1, name: 'Trabajo',  colorIdx: 1, collapsed: false, treeCollapsed: false, parentId: null },
    { id: 2, name: 'Personal', colorIdx: 2, collapsed: false, treeCollapsed: false, parentId: null },
    { id: 3, name: 'Servidor', colorIdx: 1, collapsed: false, treeCollapsed: false, parentId: 1 },
  ]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [nuevaCarpeta, setNuevaCarpeta] = useState({ name: '', colorIdx: 0, parentId: null });

  const [actividades, setActividades] = useState([
    { id: 1, title: 'Salir a comer',   start: '2026-06-08T13:00', end: '2026-06-08T14:30', description: 'Almuerzo con el equipo' },
    { id: 2, title: 'Ir a la iglesia', start: '2026-06-09T09:00', end: '2026-06-09T11:00', description: 'Reunión dominical' }
  ]);

  const [tareas, setTareas] = useState([
    { id: 1, folderId: 3, title: 'Hacer el reporte del servidor', endDate: '2026-06-10', endTime: '18:00', description: 'Revisar logs de la semana',
      isRecurring: false, recurrence: null,
      subtasks: [{ id: 101, title: 'Descargar logs', completed: false }, { id: 102, title: 'Filtrar errores', completed: false }],
      attachments: [],
      inCalendar: false, completed: false, order: 1 },
    { id: 2, folderId: 2, title: 'Rutina de ejercicio (Pierna)', endDate: '2026-06-08', endTime: '07:00', description: 'Enfocarse en sentadillas',
      isRecurring: true, recurrence: { type: 'weekly', interval: 1, weekDays: [1, 3, 5], monthDay: 8 },
      subtasks: [{ id: 103, title: 'Calentamiento', completed: true }, { id: 104, title: 'Sentadillas 4x10', completed: false }],
      attachments: [],
      inCalendar: false, completed: false, order: 2 }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [taskFilters, setTaskFilters] = useState({
    withDate: false, noDate: false, recurring: false, withSubtasks: false, inCalendar: false, emptyFolders: false,
  });
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [mobileFolderDrawer, setMobileFolderDrawer] = useState(false);
  const [editingCarpeta, setEditingCarpeta] = useState(null);
  const [undoToast, setUndoToast] = useState(null);
  const [activeDragTask, setActiveDragTask] = useState(null);
  const [movePickerTaskId, setMovePickerTaskId] = useState(null);
  const searchInputRef = useRef(null);
  const undoTimeoutRef = useRef(null);
  const dragOverKeyRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 10 } }),
  );

  const [nuevaActividad, setNuevaActividad] = useState({ title: '', start: '', end: '', description: '' });
  const [nuevaTarea, setNuevaTarea] = useState({ ...EMPTY_TAREA });
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');
  const [subtareasTemp, setSubtareasTemp] = useState([]);
  const [adjuntosTemp, setAdjuntosTemp] = useState([]);
  const fileInputCreateRef = useRef(null);
  const fileInputEditRef = useRef(null);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', data: null });
  const [formDataEdit, setFormDataEdit] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const openConfirm = ({ title, message, detail = '', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'danger', onConfirm }) => {
    setConfirmDialog({ title, message, detail, confirmLabel, cancelLabel, variant, onConfirm });
  };

  const closeConfirm = () => setConfirmDialog(null);

  const handleConfirmAccept = () => {
    const action = confirmDialog?.onConfirm;
    closeConfirm();
    action?.();
  };

  const showUndoToast = (message, undoAction) => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setUndoToast({ message, action: undoAction });
    undoTimeoutRef.current = setTimeout(() => setUndoToast(null), 5000);
  };

  const toggleTaskFilter = (key) => setTaskFilters(f => ({ ...f, [key]: !f[key] }));

  const clearAllFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setTaskFilters({
      withDate: false, noDate: false, recurring: false, withSubtasks: false, inCalendar: false, emptyFolders: false,
    });
  };

  const filterByFolder = useCallback((list) => {
    if (activeFolderId === 'sin-carpeta') return list.filter(t => !t.folderId);
    if (activeFolderId) {
      const folderIds = getDescendantIds(carpetas, activeFolderId);
      return list.filter(t => folderIds.includes(t.folderId));
    }
    return list;
  }, [activeFolderId, carpetas]);

  const applySearchAndFilters = useCallback((list) => {
    let result = list;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        getTaskDescription(t).toLowerCase().includes(q) ||
        t.subtasks?.some(st => st.title.toLowerCase().includes(q))
      );
    }
    if (dateFilter === 'today') result = result.filter(t => getTaskDueStatus(t) === 'today');
    if (dateFilter === 'week') result = result.filter(t => ['today', 'week'].includes(getTaskDueStatus(t)));
    if (dateFilter === 'overdue') result = result.filter(t => getTaskDueStatus(t) === 'overdue');
    if (taskFilters.withDate) result = result.filter(t => !!getTaskEndDate(t));
    if (taskFilters.noDate) result = result.filter(t => !getTaskEndDate(t));
    if (taskFilters.recurring) result = result.filter(t => t.isRecurring);
    if (taskFilters.withSubtasks) result = result.filter(t => t.subtasks?.length > 0);
    if (taskFilters.inCalendar) result = result.filter(t => t.inCalendar);
    return sortTasksForDisplay(result);
  }, [searchQuery, dateFilter, taskFilters]);

  const handleAddCarpeta = (e) => {
    e.preventDefault();
    if (!nuevaCarpeta.name.trim()) return;
    setCarpetas([...carpetas, {
      id: Date.now(),
      name: nuevaCarpeta.name.trim(),
      colorIdx: nuevaCarpeta.colorIdx,
      collapsed: false,
      treeCollapsed: false,
      parentId: nuevaCarpeta.parentId ?? null,
    }]);
    setNuevaCarpeta({ name: '', colorIdx: 0, parentId: null });
    closeModal();
  };

  const deleteCarpeta = (id) => {
    const idsToDelete = getDescendantIds(carpetas, id);
    setTareas(tareas.map(t => idsToDelete.includes(t.folderId) ? { ...t, folderId: null } : t));
    setCarpetas(carpetas.filter(c => !idsToDelete.includes(c.id)));
    if (idsToDelete.includes(activeFolderId)) setActiveFolderId(null);
    closeModal();
  };

  const confirmDeleteCarpeta = (id) => {
    const carpeta = getCarpeta(carpetas, id);
    if (!carpeta) return;
    openConfirm({
      title: 'Eliminar carpeta',
      message: `¿Eliminar "${carpeta.name}" y sus subcarpetas?`,
      detail: 'Las tareas quedarán sin carpeta. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: () => deleteCarpeta(id),
    });
  };

  const openEditFolder = (carpeta) => {
    setEditingCarpeta({ id: carpeta.id, name: carpeta.name, colorIdx: carpeta.colorIdx });
    setModalConfig({ isOpen: true, type: 'editar-carpeta', data: carpeta });
  };

  const saveFolderEdit = (e) => {
    e.preventDefault();
    if (!editingCarpeta?.name.trim()) return;
    setCarpetas(carpetas.map(c => c.id === editingCarpeta.id
      ? { ...c, name: editingCarpeta.name.trim(), colorIdx: editingCarpeta.colorIdx }
      : c));
    setEditingCarpeta(null);
    closeModal();
  };

  const toggleCarpetaCollapse = (id) => {
    setCarpetas(carpetas.map(c => c.id === id ? { ...c, collapsed: !c.collapsed } : c));
  };

  const toggleFolderTreeCollapse = (id) => {
    setCarpetas(carpetas.map(c => c.id === id ? { ...c, treeCollapsed: !c.treeCollapsed } : c));
  };

  const handleAddSubtarea = (e, isEditing = false) => {
    e.preventDefault();
    if (!nuevaSubtarea) return;
    const newSubtask = { id: Date.now() + Math.random(), title: nuevaSubtarea, completed: false };
    if (isEditing) {
      setFormDataEdit({ ...formDataEdit, subtasks: [...formDataEdit.subtasks, newSubtask] });
    } else {
      setSubtareasTemp([...subtareasTemp, newSubtask]);
    }
    setNuevaSubtarea('');
  };

  const removeSubtarea = (index, isEditing = false) => {
    if (isEditing) {
      setFormDataEdit({ ...formDataEdit, subtasks: formDataEdit.subtasks.filter((_, i) => i !== index) });
    } else {
      setSubtareasTemp(subtareasTemp.filter((_, i) => i !== index));
    }
  };

  const handleAttachFiles = async (fileList, isEditing = false) => {
    if (!fileList?.length) return;
    const newAttachments = [];
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_ATTACHMENT_SIZE) continue;
      const dataUrl = await readFileAsDataUrl(file);
      newAttachments.push({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      });
    }
    if (!newAttachments.length) return;
    if (isEditing) {
      setFormDataEdit({
        ...formDataEdit,
        attachments: [...(formDataEdit.attachments || []), ...newAttachments],
      });
    } else {
      setAdjuntosTemp([...adjuntosTemp, ...newAttachments]);
    }
  };

  const removeAttachment = (id, isEditing = false) => {
    if (isEditing) {
      setFormDataEdit({
        ...formDataEdit,
        attachments: (formDataEdit.attachments || []).filter(a => a.id !== id),
      });
    } else {
      setAdjuntosTemp(adjuntosTemp.filter(a => a.id !== id));
    }
  };

  const handleAddTarea = (e) => {
    e.preventDefault();
    if (!nuevaTarea.title) return;
    setTareas([...tareas, {
      ...nuevaTarea,
      folderId: nuevaTarea.folderId ?? (activeFolderId && activeFolderId !== 'sin-carpeta' ? activeFolderId : null),
      recurrence: nuevaTarea.isRecurring ? normalizeRecurrence(nuevaTarea.recurrence, nuevaTarea.endDate) : null,
      subtasks: subtareasTemp,
      attachments: adjuntosTemp,
      id: Date.now(),
      inCalendar: false,
      completed: false,
      order: Date.now(),
    }]);
    setNuevaTarea({ ...EMPTY_TAREA, folderId: null });
    setSubtareasTemp([]);
    setAdjuntosTemp([]);
    closeModal();
  };

  const handleQuickAddTask = (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    const folderId = activeFolderId && activeFolderId !== 'sin-carpeta' ? activeFolderId : null;
    setTareas([...tareas, {
      id: Date.now(),
      title: quickTaskTitle.trim(),
      folderId,
      endDate: '', endTime: '', description: '',
      isRecurring: false, recurrence: null,
      subtasks: [], attachments: [],
      inCalendar: false, completed: false,
      order: Date.now(),
    }]);
    setQuickTaskTitle('');
  };

  const completeTask = (id) => {
    const task = tareas.find(t => t.id === id);
    if (!task) return;
    const updated = {
      ...task,
      completed: true,
      subtasks: (task.subtasks || []).map(st => ({ ...st, completed: true })),
    };
    setTareas(prev => {
      let next = prev.map(t => t.id === id ? updated : t);
      if (task.isRecurring) {
        const nextTask = createNextRecurringTask(task);
        if (nextTask) next = [...next, nextTask];
      }
      return next;
    });
  };

  const toggleTaskCompletion = (id) => {
    const task = tareas.find(t => t.id === id);
    if (!task) return;
    if (!task.completed) completeTask(id);
    else setTareas(tareas.map(t => t.id === id ? { ...t, completed: false } : t));
  };

  const toggleSubtaskCompletion = (taskId, subtaskId, e) => {
    if (e) e.stopPropagation();
    const task = tareas.find(t => t.id === taskId);
    if (!task) return;
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    const newSubtasks = task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
    const allDone = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);

    if (!subtask.completed && allDone) {
      completeTask(taskId);
      if (modalConfig.isOpen && modalConfig.data?.id === taskId) closeModal();
      return;
    }

    setTareas(tareas.map(t => t.id === taskId ? { ...t, subtasks: newSubtasks } : t));
    if (modalConfig.isOpen && modalConfig.data?.id === taskId) {
      setModalConfig({ ...modalConfig, data: { ...modalConfig.data, subtasks: newSubtasks } });
    }
  };

  const confirmPromoteSubtask = (taskId, subtaskId, e) => {
    if (e) e.stopPropagation();
    const parentTask = tareas.find(t => t.id === taskId);
    const subtask = parentTask?.subtasks?.find(st => st.id === subtaskId);
    if (!subtask || !parentTask) return;
    openConfirm({
      title: 'Convertir en tarea principal',
      message: `¿Convertir "${subtask.title}" en tarea independiente?`,
      detail: `Se quitará de "${parentTask.title}" y heredará su fecha y carpeta.`,
      confirmLabel: 'Convertir',
      variant: 'warning',
      onConfirm: () => promoteSubtask(taskId, subtaskId, e),
    });
  };

  const promoteSubtask = (taskId, subtaskId, e) => {
    if (e) e.stopPropagation();
    const parentTask = tareas.find(t => t.id === taskId);
    const subtaskToPromote = parentTask.subtasks.find(st => st.id === subtaskId);
    const newTask = {
      id: Date.now(),
      folderId: parentTask.folderId,
      title: subtaskToPromote.title,
      endDate: getTaskEndDate(parentTask),
      endTime: getTaskEndTime(parentTask),
      description: `Promovida desde: ${parentTask.title}`,
      isRecurring: false,
      recurrence: null,
      subtasks: [],
      attachments: [],
      inCalendar: false,
      completed: subtaskToPromote.completed,
      order: Date.now(),
    };
    setTareas(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) } : t);
      return [...updated, newTask];
    });
    if (modalConfig.isOpen && modalConfig.data?.id === taskId) {
      setModalConfig({ ...modalConfig, data: { ...modalConfig.data, subtasks: modalConfig.data.subtasks.filter(st => st.id !== subtaskId) } });
    }
  };

  const deleteTask = (id) => {
    const tarea = tareas.find(t => t.id === id);
    openConfirm({
      title: 'Eliminar tarea',
      message: `¿Eliminar "${tarea?.title || 'sin título'}"?`,
      detail: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: () => {
        const deleted = tareas.find(t => t.id === id);
        const idx = tareas.findIndex(t => t.id === id);
        setTareas(tareas.filter(t => t.id !== id));
        closeModal();
        if (deleted) {
          showUndoToast(`"${deleted.title}" eliminada`, () => {
            setTareas(prev => {
              const copy = [...prev];
              copy.splice(Math.min(idx, copy.length), 0, deleted);
              return copy;
            });
          });
        }
      },
    });
  };

  const clearCompletedTasks = () => {
    const count = tareas.filter(t => t.completed && filterByFolder([t]).length).length;
    if (count === 0) return;
    openConfirm({
      title: 'Limpiar completadas',
      message: `¿Eliminar ${count} tarea(s) completada(s)?`,
      detail: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Limpiar',
      variant: 'danger',
      onConfirm: () => {
        setTareas(tareas.filter(t => !(t.completed && filterByFolder([t]).length)));
      },
    });
  };

  const moveTaskToFolder = (taskId, folderId) => {
    if (!taskId) return;
    const normalizedFolderId = folderId === 'sin-carpeta' || folderId === null ? null : folderId;
    const task = tareas.find(t => t.id === taskId);
    if (!task || task.folderId === normalizedFolderId) return;
    setTareas(prev => prev.map(t => t.id === taskId ? { ...t, folderId: normalizedFolderId } : t));
    const folderName = normalizedFolderId ? getCarpeta(carpetas, normalizedFolderId)?.name : 'Sin carpeta';
    showUndoToast(`Movida a "${folderName}"`, () => {
      setTareas(prev => prev.map(t => t.id === taskId ? { ...t, folderId: task.folderId } : t));
    });
    setMovePickerTaskId(null);
  };

  const tareasFiltradas = applySearchAndFilters(filterByFolder(tareas));
  const tareasIncompletas = tareasFiltradas.filter(t => !t.completed);
  const tareasCompletadas = sortTasksByDate(tareasFiltradas.filter(t => t.completed));
  const hasActiveFilters = searchQuery.trim() || dateFilter !== 'all' || Object.values(taskFilters).some(Boolean);

  const buildFolderGroups = (parentId = null) => {
    return getChildFolders(carpetas, parentId).map(c => {
      const empty = isFolderEmpty(carpetas, tareas, c.id);
      const subgrupos = buildFolderGroups(c.id);

      if (taskFilters.emptyFolders) {
        if (!empty) return null;
        return { carpeta: c, tareas: [], subgrupos, isEmptyFolder: true };
      }

      const items = applySearchAndFilters(tareas.filter(t => t.folderId === c.id && !t.completed));
      return { carpeta: c, tareas: items, subgrupos, isEmptyFolder: empty };
    }).filter(g => g && (taskFilters.emptyFolders
      ? g.isEmptyFolder
      : (g.tareas.length > 0 || g.subgrupos.length > 0)));
  };

  const getGruposTareas = () => {
    if (activeFolderId !== null) return null;
    const grupos = buildFolderGroups(null);
    if (!taskFilters.emptyFolders) {
      const sinCarpeta = applySearchAndFilters(tareas.filter(t => !t.folderId && !t.completed));
      if (sinCarpeta.length > 0) grupos.push({ carpeta: null, tareas: sinCarpeta, subgrupos: [] });
    }
    return grupos;
  };

  const grupos = getGruposTareas();
  const hasVisibleTasks = taskFilters.emptyFolders
    ? (grupos?.length > 0)
    : (tareasIncompletas.length > 0 || (grupos && grupos.some(g => g.tareas.length > 0 || g.subgrupos.length > 0)));

  const getOrderedIdsForList = (sortListId) => {
    if (sortListId === 'filtered-pending') return tareasIncompletas.map(t => t.id);
    if (sortListId.startsWith('folder-group-')) {
      const key = sortListId.replace('folder-group-', '');
      const folderId = key === 'sin-carpeta' ? null : Number(key);
      return applySearchAndFilters(
        tareas.filter(t => !t.completed && (folderId === null ? !t.folderId : t.folderId === folderId))
      ).map(t => t.id);
    }
    return [];
  };

  const reorderTasksInList = (sortListId, activeTaskId, overTaskId) => {
    if (!sortListId || activeTaskId === overTaskId) return;
    const ids = getOrderedIdsForList(sortListId);
    const oldIndex = ids.indexOf(activeTaskId);
    const newIndex = ids.indexOf(overTaskId);
    if (oldIndex < 0 || newIndex < 0) return;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    const orderMap = Object.fromEntries(newIds.map((id, i) => [id, (i + 1) * 1000]));
    setTareas(prev => prev.map(t => orderMap[t.id] !== undefined ? { ...t, order: orderMap[t.id] } : t));
  };

  const handleDragStart = (event) => {
    dragOverKeyRef.current = null;
    const data = event.active.data.current;
    if (data?.type === 'task') {
      setActiveDragTask(tareas.find(t => t.id === data.taskId) || null);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeData = active.data.current;
    if (activeData?.type !== 'task') return;

    const overId = String(over.id);
    if (overId.startsWith('folder-')) return;

    const overData = over.data.current;
    if (overData?.type !== 'task' || !overData.sortListId || overData.sortListId !== activeData.sortListId) return;

    const dragKey = `${activeData.sortListId}:${activeData.taskId}:${overData.taskId}`;
    if (dragOverKeyRef.current === dragKey) return;
    dragOverKeyRef.current = dragKey;
    reorderTasksInList(activeData.sortListId, activeData.taskId, overData.taskId);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragTask(null);
    dragOverKeyRef.current = null;
    if (!over) return;
    const activeData = active.data.current;
    if (activeData?.type !== 'task') return;
    const taskId = activeData.taskId;
    const overId = String(over.id);
    if (overId.startsWith('folder-')) {
      const fid = over.data.current?.folderId;
      moveTaskToFolder(taskId, fid === null ? 'sin-carpeta' : fid);
    }
  };

  const handleDragCancel = () => {
    setActiveDragTask(null);
    dragOverKeyRef.current = null;
  };

  const saveTaskEdit = (e) => {
    e.preventDefault();
    const updated = {
      ...formDataEdit,
      recurrence: formDataEdit.isRecurring ? normalizeRecurrence(formDataEdit.recurrence, formDataEdit.endDate) : null,
    };
    setTareas(tareas.map(t => t.id === updated.id ? updated : t));
    closeModal();
  };

  const handleAddActividad = (e) => {
    e.preventDefault();
    if (!nuevaActividad.title || !nuevaActividad.start) return;
    setActividades([...actividades, { ...nuevaActividad, id: Date.now() }]);
    setNuevaActividad({ title: '', start: '', end: '', description: '' });
    closeModal();
  };

  const deleteActivity = (id) => {
    const actividad = actividades.find(a => a.id === id);
    openConfirm({
      title: 'Eliminar evento',
      message: `¿Eliminar "${actividad?.title || 'sin título'}"?`,
      detail: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: () => {
        setActividades(actividades.filter(a => a.id !== id));
        closeModal();
      },
    });
  };

  const saveActivityEdit = (e) => {
    e.preventDefault();
    setActividades(actividades.map(a => a.id === formDataEdit.id ? formDataEdit : a));
    closeModal();
  };

  const openConversionModal = (tarea) => {
    const date = getTaskEndDate(tarea);
    const time = getTaskEndTime(tarea) || '09:00';
    setFormDataEdit({ start: date ? `${date}T${time}` : '', end: '' });
    setModalConfig({ isOpen: true, type: 'convertir', data: tarea });
  };

  const confirmarConversion = (e) => {
    e.preventDefault();
    if (!formDataEdit.start || !formDataEdit.end) return;
    const tarea = modalConfig.data;
    const nuevoEvento = {
      id: Date.now(),
      title: `[Tarea] ${tarea.title}`,
      start: formDataEdit.start,
      end: formDataEdit.end,
      description: `${getTaskDescription(tarea)}${tarea.attachments?.length ? '\n\nAdjuntos: ' + tarea.attachments.map(a => a.name).join(', ') : ''}${tarea.isRecurring ? '\n\nRepetición: ' + getRecurrenceLabel(tarea) : ''}\n${tarea.subtasks?.length ? 'Subtareas:\n' + tarea.subtasks.map(st => `- ${st.completed ? '[x]' : '[ ]'} ${st.title}`).join('\n') : ''}`
    };
    setActividades([...actividades, nuevoEvento]);
    setTareas(tareas.map(t => t.id === tarea.id ? { ...t, inCalendar: true } : t));
    closeModal();
    setActiveTab('actividades');
  };

  const openModal = (type, data) => {
    const parsed = data ? JSON.parse(JSON.stringify(data)) : null;
    if (parsed) {
      if (!parsed.attachments) parsed.attachments = [];
      if (!parsed.subtasks) parsed.subtasks = [];
      if (!parsed.endDate && parsed.dueDate) parsed.endDate = parsed.dueDate;
      if (!parsed.endTime && parsed.dueTime) parsed.endTime = parsed.dueTime;
      if (!parsed.description && parsed.notes) parsed.description = parsed.notes;
      if (parsed.isRecurring === undefined) parsed.isRecurring = false;
      if (parsed.recurrenceFreq && !parsed.recurrence) {
        parsed.recurrence = normalizeRecurrence({ type: parsed.recurrenceFreq, interval: 1, weekDays: [1], monthDay: 1 }, parsed.endDate || parsed.dueDate);
      }
      if (parsed.isRecurring && parsed.recurrence) {
        parsed.recurrence = normalizeRecurrence(parsed.recurrence, parsed.endDate || parsed.dueDate);
      }
    }
    setFormDataEdit(parsed);
    setModalConfig({ isOpen: true, type, data: parsed });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: '', data: null });
    setFormDataEdit(null);
    setEditingCarpeta(null);
  };

  const openCreateTask = () => {
    setNuevaTarea({ ...EMPTY_TAREA, folderId: activeFolderId && activeFolderId !== 'sin-carpeta' ? activeFolderId : null });
    setSubtareasTemp([]);
    setAdjuntosTemp([]);
    setNuevaSubtarea('');
    setModalConfig({ isOpen: true, type: 'crear-tarea', data: null });
  };

  const openCreateActivity = () => {
    setNuevaActividad({ title: '', start: '', end: '', description: '' });
    setModalConfig({ isOpen: true, type: 'crear-actividad', data: null });
  };

  const openCreateFolder = (parentId) => {
    const resolvedParent = parentId !== undefined
      ? parentId
      : (activeFolderId && activeFolderId !== 'sin-carpeta' ? activeFolderId : null);
    setNuevaCarpeta({ name: '', colorIdx: 0, parentId: resolvedParent });
    setModalConfig({ isOpen: true, type: 'crear-carpeta', data: null });
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === 'Escape') {
        if (confirmDialog) { closeConfirm(); return; }
        if (modalConfig.isOpen) { closeModal(); return; }
        if (mobileFolderDrawer) { setMobileFolderDrawer(false); return; }
      }
      if (isTyping) return;
      if (activeTab === 'tareas') {
        if (e.key === 'n' || e.key === 'N') openCreateTask();
        if (e.key === '/') { e.preventDefault(); searchInputRef.current?.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab, modalConfig.isOpen, confirmDialog, mobileFolderDrawer]);

  const taskModalTypes = ['crear-tarea', 'editar-tarea', 'detalles-tarea', 'crear-carpeta', 'editar-carpeta', 'convertir'];
  const isTaskModal = taskModalTypes.includes(modalConfig.type);

  const modalTitle = () => {
    switch (modalConfig.type) {
      case 'crear-tarea': return <><Plus size={18}/> Nueva Tarea</>;
      case 'crear-actividad': return <><Plus size={18}/> Agendar Evento</>;
      case 'crear-carpeta': return <><FolderPlus size={18}/> {nuevaCarpeta.parentId ? 'Nueva Subcarpeta' : 'Nueva Carpeta'}</>;
      case 'editar-carpeta': return <><Edit2 size={18}/> Editar Carpeta</>;
      case 'convertir': return <><Clock size={18}/> Fijar Bloque de Tiempo</>;
      case 'detalles-tarea': return <><ListTodo size={18}/> Detalles de la Tarea</>;
      case 'editar-tarea': return <><Edit2 size={18}/> Editar Tarea</>;
      case 'detalles-actividad': return <><Calendar size={18}/> Detalles del Evento</>;
      case 'editar-actividad': return <><Edit2 size={18}/> Editar Evento</>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'tareas' && (
          <MisTareasPanel
            carpetas={carpetas}
            tareas={tareas}
            activeFolderId={activeFolderId}
            setActiveFolderId={setActiveFolderId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            taskFilters={taskFilters}
            toggleTaskFilter={toggleTaskFilter}
            clearAllFilters={clearAllFilters}
            quickTaskTitle={quickTaskTitle}
            setQuickTaskTitle={setQuickTaskTitle}
            mobileFolderDrawer={mobileFolderDrawer}
            setMobileFolderDrawer={setMobileFolderDrawer}
            movePickerTaskId={movePickerTaskId}
            setMovePickerTaskId={setMovePickerTaskId}
            activeDragTask={activeDragTask}
            searchInputRef={searchInputRef}
            sensors={sensors}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragEnd={handleDragEnd}
            handleDragCancel={handleDragCancel}
            tareasIncompletas={tareasIncompletas}
            tareasCompletadas={tareasCompletadas}
            hasActiveFilters={hasActiveFilters}
            grupos={grupos}
            hasVisibleTasks={hasVisibleTasks}
            handleQuickAddTask={handleQuickAddTask}
            openCreateTask={openCreateTask}
            openCreateFolder={openCreateFolder}
            openEditFolder={openEditFolder}
            confirmDeleteCarpeta={confirmDeleteCarpeta}
            toggleCarpetaCollapse={toggleCarpetaCollapse}
            toggleFolderTreeCollapse={toggleFolderTreeCollapse}
            toggleTaskCompletion={toggleTaskCompletion}
            deleteTask={deleteTask}
            clearCompletedTasks={clearCompletedTasks}
            openModal={openModal}
            openConversionModal={openConversionModal}
            moveTaskToFolder={moveTaskToFolder}
            toggleSubtaskCompletion={toggleSubtaskCompletion}
            confirmPromoteSubtask={confirmPromoteSubtask}
          />
        )}

        {activeTab === 'actividades' && (
          <CalendarioPanel actividades={actividades} openModal={openModal} />
        )}
      </main>

      <button onClick={activeTab === 'tareas' ? openCreateTask : openCreateActivity} className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 bg-zinc-100 hover:bg-white text-zinc-950 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] z-40 transition-transform hover:scale-105 active:scale-95">
        <Plus size={24} />
      </button>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className={`bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pb-4 sm:pb-0 animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 ${isTaskModal ? 'max-w-2xl' : 'max-w-md'}`}>
            <div className="p-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/50 sticky top-0 z-10">
              <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                {modalTitle()}
              </h3>
              <button onClick={closeModal} className="p-1 text-zinc-500 hover:bg-zinc-800 rounded-md transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto onyx-scroll">
              <TaskModals
                modalType={modalConfig.type}
                modalData={modalConfig.data}
                carpetas={carpetas}
                nuevaCarpeta={nuevaCarpeta}
                setNuevaCarpeta={setNuevaCarpeta}
                editingCarpeta={editingCarpeta}
                setEditingCarpeta={setEditingCarpeta}
                nuevaTarea={nuevaTarea}
                setNuevaTarea={setNuevaTarea}
                nuevaSubtarea={nuevaSubtarea}
                setNuevaSubtarea={setNuevaSubtarea}
                subtareasTemp={subtareasTemp}
                adjuntosTemp={adjuntosTemp}
                formDataEdit={formDataEdit}
                setFormDataEdit={setFormDataEdit}
                fileInputCreateRef={fileInputCreateRef}
                fileInputEditRef={fileInputEditRef}
                handleAddCarpeta={handleAddCarpeta}
                saveFolderEdit={saveFolderEdit}
                handleAddTarea={handleAddTarea}
                handleAddSubtarea={handleAddSubtarea}
                removeSubtarea={removeSubtarea}
                handleAttachFiles={handleAttachFiles}
                removeAttachment={removeAttachment}
                saveTaskEdit={saveTaskEdit}
                confirmarConversion={confirmarConversion}
                toggleSubtaskCompletion={toggleSubtaskCompletion}
                confirmPromoteSubtask={confirmPromoteSubtask}
                openModal={openModal}
                openConversionModal={openConversionModal}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteTask={deleteTask}
              />
              <ActivityModals
                modalType={modalConfig.type}
                modalData={modalConfig.data}
                nuevaActividad={nuevaActividad}
                setNuevaActividad={setNuevaActividad}
                formDataEdit={formDataEdit}
                setFormDataEdit={setFormDataEdit}
                handleAddActividad={handleAddActividad}
                saveActivityEdit={saveActivityEdit}
                deleteActivity={deleteActivity}
                openModal={openModal}
              />
            </div>
          </div>
        </div>
      )}

      <UndoToast
        undoToast={undoToast}
        onUndo={() => { undoToast.action?.(); setUndoToast(null); if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current); }}
        onDismiss={() => setUndoToast(null)}
      />

      <ConfirmDialog
        confirmDialog={confirmDialog}
        onClose={closeConfirm}
        onAccept={handleConfirmAccept}
      />
    </div>
  );
}
