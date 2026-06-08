import React from 'react';
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  ListTodo, Plus, X, Folder, FolderOpen, FolderPlus, ChevronDown, ChevronRight,
  Edit2, Trash2, CheckCircle2, Search, GripVertical, Menu,
} from 'lucide-react';
import { FOLDER_COLORS } from '../../shared/constants';
import { taskDndId, taskFolderCollisionDetection } from './dnd';
import FolderDropTarget from './FolderDropTarget';
import TareaCard from './TareaCard';
import FolderPicker from './FolderPicker';
import {
  getCarpeta, getChildFolders, getRootFolders, getFolderPath, flattenFolders,
  countPendingTasksInFolder, isFolderEmpty,
} from './folderUtils';
import TaskFiltersBar from './TaskFiltersBar';

export default function MisTareasPanel({
  carpetas,
  tareas,
  activeFolderId,
  setActiveFolderId,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  taskFilters,
  toggleTaskFilter,
  clearAllFilters,
  quickTaskTitle,
  setQuickTaskTitle,
  mobileFolderDrawer,
  setMobileFolderDrawer,
  movePickerTaskId,
  setMovePickerTaskId,
  activeDragTask,
  searchInputRef,
  sensors,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDragCancel,
  tareasIncompletas,
  tareasCompletadas,
  hasActiveFilters,
  grupos,
  hasVisibleTasks,
  handleQuickAddTask,
  openCreateTask,
  openCreateFolder,
  openEditFolder,
  confirmDeleteCarpeta,
  toggleCarpetaCollapse,
  toggleFolderTreeCollapse,
  toggleTaskCompletion,
  deleteTask,
  clearCompletedTasks,
  openModal,
  openConversionModal,
  moveTaskToFolder,
  toggleSubtaskCompletion,
  confirmPromoteSubtask,
}) {
  const renderSidebarFolder = (folder, depth = 0) => {
    const children = getChildFolders(carpetas, folder.id);
    const color = FOLDER_COLORS[folder.colorIdx];
    const empty = isFolderEmpty(carpetas, tareas, folder.id);
    if (taskFilters.emptyFolders && !empty) return null;
    const count = countPendingTasksInFolder(carpetas, tareas, folder.id);
    const isActive = activeFolderId === folder.id;
    const hasChildren = children.length > 0;
    const isTreeExpanded = !folder.treeCollapsed;
    const isRoot = depth === 0;

    return (
      <div key={folder.id}>
        <div className={`flex items-center gap-0.5 group/sidebar-folder ${isRoot ? 'mt-1' : ''}`}>
          <div className="w-[18px] shrink-0 flex items-center justify-center">
            {hasChildren ? (
              <button
                onClick={() => toggleFolderTreeCollapse(folder.id)}
                className="p-0.5 text-zinc-600 hover:text-zinc-300 rounded shrink-0"
              >
                {isTreeExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            ) : isRoot ? (
              <span className="w-[18px]" />
            ) : (
              <span className="text-[10px] text-zinc-700 leading-none">└</span>
            )}
          </div>
          <FolderDropTarget folderId={folder.id} className="flex-1 min-w-0">
          <button
            onClick={() => setActiveFolderId(folder.id)}
            className={`flex-1 flex items-center gap-2 min-w-0 transition-all ${
              isRoot
                ? `px-2.5 py-2 rounded-xl text-sm font-semibold ${isActive ? `${color.bg} ${color.text} border ${color.border}` : 'text-zinc-300 hover:bg-zinc-800/50'}`
                : `px-2 py-1.5 rounded-lg text-xs font-normal ${isActive ? `${color.bg} ${color.text} border ${color.border}` : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}`
            }`}
          >
            {isRoot ? (
              <Folder size={15} className={color.text} />
            ) : (
              <FolderOpen size={13} className={isActive ? color.text : 'text-zinc-600'} />
            )}
            {isRoot ? (
              <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 opacity-60 ${color.dot}`} />
            )}
            <span className="flex-1 text-left truncate">{folder.name}</span>
            {empty ? (
              <span className="text-[9px] uppercase tracking-wide text-zinc-600 border border-dashed border-zinc-700 px-1 py-px rounded shrink-0">Vacía</span>
            ) : (
              <span className={`bg-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded-md shrink-0 ${isRoot ? 'text-[11px]' : 'text-[10px]'}`}>{count}</span>
            )}
          </button>
          </FolderDropTarget>
          <button
            onClick={() => openEditFolder(folder)}
            className="p-1 text-zinc-600 hover:text-zinc-300 rounded shrink-0 opacity-0 group-hover/sidebar-folder:opacity-100 transition-opacity"
            title="Editar carpeta"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => openCreateFolder(folder.id)}
            className="p-1 text-zinc-600 hover:text-zinc-300 rounded shrink-0 opacity-0 group-hover/sidebar-folder:opacity-100 transition-opacity"
            title="Subcarpeta"
          >
            <FolderPlus size={12} />
          </button>
        </div>
        {hasChildren && isTreeExpanded && (
          <div className={`${isRoot ? 'ml-4 pl-2 border-l border-zinc-800/70' : 'ml-3 pl-1.5 border-l border-zinc-800/40'} space-y-0.5`}>
            {children.map(c => renderSidebarFolder(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderTaskCard = (tarea, sortListId) => {
    const carpeta = getCarpeta(carpetas, tarea.folderId);
    return (
      <TareaCard
        key={tarea.id}
        tarea={tarea}
        sortListId={sortListId}
        activeFolderId={activeFolderId}
        movePickerOpen={movePickerTaskId === tarea.id}
        carpeta={carpeta}
        folderPathLabel={carpeta ? getFolderPath(carpetas, carpeta.id).map(c => c.name).join('/') : ''}
        onToggleComplete={toggleTaskCompletion}
        onOpenDetails={(t) => openModal('detalles-tarea', t)}
        onOpenEdit={(t) => openModal('editar-tarea', t)}
        onToggleMovePicker={(id) => setMovePickerTaskId(movePickerTaskId === id ? null : id)}
        onConversion={openConversionModal}
        onToggleSubtask={toggleSubtaskCompletion}
        onPromoteSubtask={confirmPromoteSubtask}
        folderPicker={
          <FolderPicker
            carpetas={carpetas}
            value={tarea.folderId}
            onChange={(id) => moveTaskToFolder(tarea.id, id === null ? 'sin-carpeta' : id)}
          />
        }
      />
    );
  };

  const countTasksInGroup = (grupo) =>
    grupo.tareas.length + grupo.subgrupos.reduce((sum, sub) => sum + countTasksInGroup(sub), 0);

  const renderFolderGroup = (grupo, depth = 0) => {
    const { carpeta, tareas: items, subgrupos, isEmptyFolder } = grupo;
    if (items.length === 0 && subgrupos.length === 0 && !isEmptyFolder) return null;
    const groupCount = countTasksInGroup(grupo);
    const color = carpeta ? FOLDER_COLORS[carpeta.colorIdx] : null;
    const isCollapsed = carpeta ? carpeta.collapsed : false;
    const isRoot = depth === 0;

    const sortListId = `folder-group-${carpeta?.id ?? 'sin-carpeta'}`;

    return (
      <div key={carpeta?.id ?? 'sin-carpeta'} className={depth > 0 ? 'ml-4 pl-3 border-l border-zinc-800/80' : ''}>
        <FolderDropTarget folderId={carpeta?.id ?? 'sin-carpeta'} className="flex items-center gap-2 mb-2 group/header rounded-lg transition-all">
          {carpeta ? (
            <>
              <button onClick={() => toggleCarpetaCollapse(carpeta.id)} className="flex items-center gap-2 flex-1 min-w-0">
                {isRoot ? (
                  <Folder size={15} className={color.text} />
                ) : (
                  <FolderOpen size={13} className={color.text} />
                )}
                {isRoot ? (
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 opacity-70 ${color.dot}`} />
                )}
                <h3 className={`${isRoot ? 'text-sm font-semibold uppercase tracking-wider' : 'text-xs font-medium normal-case tracking-normal'} ${color.text}`}>
                  {carpeta.name}
                </h3>
                {isCollapsed ? <ChevronRight size={14} className="text-zinc-500 ml-1" /> : <ChevronDown size={14} className="text-zinc-500 ml-1" />}
                {groupCount === 0 && isEmptyFolder ? (
                  <span className="text-[9px] uppercase tracking-wide text-zinc-600 border border-dashed border-zinc-700 px-1.5 py-px rounded ml-1">Vacía</span>
                ) : (
                  <span className="text-[11px] text-zinc-500 ml-1">{groupCount}</span>
                )}
              </button>
              <button
                onClick={() => openEditFolder(carpeta)}
                className="opacity-0 group-hover/header:opacity-100 p-1 text-zinc-600 hover:text-zinc-300 rounded transition-all"
                title="Editar carpeta"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => openCreateFolder(carpeta.id)}
                className="opacity-0 group-hover/header:opacity-100 p-1 text-zinc-600 hover:text-zinc-300 rounded transition-all"
                title="Nueva subcarpeta"
              >
                <FolderPlus size={13} />
              </button>
              <button
                onClick={() => confirmDeleteCarpeta(carpeta.id)}
                className="opacity-0 group-hover/header:opacity-100 p-1 text-zinc-600 hover:text-red-400 rounded transition-all"
                title="Eliminar carpeta"
              >
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Folder size={14} className="text-zinc-600" />
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Sin Carpeta</h3>
            </div>
          )}
        </FolderDropTarget>
        {!isCollapsed && (
          <>
            {items.length > 0 ? (
              <SortableContext items={items.map(t => taskDndId(t.id))} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 mb-2">
                  {items.map(tarea => renderTaskCard(tarea, sortListId))}
                </div>
              </SortableContext>
            ) : isEmptyFolder && (
              <div className="mb-3 px-3 py-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-center">
                <FolderOpen size={18} className="mx-auto text-zinc-600 mb-1.5" />
                <p className="text-xs text-zinc-500">Carpeta vacía</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Arrastra tareas aquí o crea una nueva</p>
              </div>
            )}
            {subgrupos.length > 0 && (
              <div className="space-y-6">
                {subgrupos.map(sub => renderFolderGroup(sub, depth + 1))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={taskFolderCollisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-6 animate-in fade-in duration-500">
        <aside className="w-48 shrink-0 hidden sm:block">
          <div className="sticky top-24 space-y-1">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Carpetas</span>
              <button onClick={() => openCreateFolder(null)} className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors" title="Nueva carpeta">
                <FolderPlus size={15} />
              </button>
            </div>
            <button
              onClick={() => setActiveFolderId(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${activeFolderId === null ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
            >
              <ListTodo size={15} />
              <span className="flex-1 text-left">Todas</span>
              <span className="text-[11px] bg-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded-md">{tareas.filter(t=>!t.completed).length}</span>
            </button>
            {getRootFolders(carpetas).map(c => renderSidebarFolder(c))}
            {tareas.filter(t => !t.folderId && !t.completed).length > 0 && (
              <FolderDropTarget folderId="sin-carpeta">
              <button
                onClick={() => setActiveFolderId('sin-carpeta')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${activeFolderId === 'sin-carpeta' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
              >
                <Folder size={15} />
                <span className="flex-1 text-left">Sin carpeta</span>
                <span className="text-[11px] bg-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded-md">{tareas.filter(t => !t.folderId && !t.completed).length}</span>
              </button>
              </FolderDropTarget>
            )}
          </div>
        </aside>

        <div className="flex-1 space-y-4 min-w-0">
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMobileFolderDrawer(true)}
                className="sm:hidden p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 shrink-0"
                title="Carpetas"
              >
                <Menu size={18} />
              </button>
              <form onSubmit={handleQuickAddTask} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Añadir tarea… (Enter)"
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <button type="submit" className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors shrink-0" title="Añadir">
                  <Plus size={18} />
                </button>
              </form>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar tareas… (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <TaskFiltersBar
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              taskFilters={taskFilters}
              toggleTaskFilter={toggleTaskFilter}
              hasActiveFilters={hasActiveFilters}
              clearAllFilters={clearAllFilters}
              tareasCompletadas={tareasCompletadas}
              clearCompletedTasks={clearCompletedTasks}
            />
          </div>

          {activeDragTask && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-blue-300">
              <GripVertical size={14} />
              Arrastra a una carpeta del panel izquierdo o usa el botón de carpeta en la tarea
            </div>
          )}

          <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button onClick={() => setActiveFolderId(null)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFolderId === null ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
              Todas
            </button>
            {flattenFolders(carpetas).map(({ carpeta: c, depth }) => {
              const color = FOLDER_COLORS[c.colorIdx];
              const isRoot = depth === 0;
              return (
                <FolderDropTarget key={c.id} folderId={c.id} className="shrink-0">
                <button
                  onClick={() => setActiveFolderId(c.id)}
                  className={`flex items-center gap-1.5 rounded-lg font-medium transition-all border ${isRoot ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]'} ${activeFolderId === c.id ? `${color.bg} ${color.text} ${color.border}` : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
                  style={{ marginLeft: depth * 6 }}
                >
                  {isRoot ? <Folder size={12} /> : <FolderOpen size={11} />}
                  {!isRoot && <span className={`w-1 h-1 rounded-full ${color.dot}`} />}
                  {isRoot && <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />}
                  {c.name}
                </button>
                </FolderDropTarget>
              );
            })}
            {tareas.filter(t => !t.folderId && !t.completed).length > 0 && (
              <FolderDropTarget folderId="sin-carpeta" className="shrink-0">
              <button
                onClick={() => setActiveFolderId('sin-carpeta')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${activeFolderId === 'sin-carpeta' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
              >
                Sin carpeta
              </button>
              </FolderDropTarget>
            )}
            <button onClick={() => openCreateFolder(null)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-500 border border-zinc-800 border-dashed">
              <Plus size={12} /> Carpeta
            </button>
          </div>

          {activeFolderId === null && grupos && (
            <div className="space-y-6">
              {!hasVisibleTasks && (
                <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                  <ListTodo size={32} className="mx-auto text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-400 mb-1">
                    {taskFilters.emptyFolders
                      ? 'No hay carpetas vacías'
                      : hasActiveFilters ? 'Ninguna tarea coincide con los filtros' : 'No tienes tareas pendientes'}
                  </p>
                  <p className="text-xs text-zinc-600 mb-4">
                    {taskFilters.emptyFolders
                      ? 'Todas tus carpetas tienen tareas pendientes'
                      : hasActiveFilters ? 'Prueba con otros filtros o limpia la búsqueda' : 'Crea tu primera tarea o organízala en carpetas'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button onClick={openCreateTask} className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium">Nueva tarea</button>
                    {!hasActiveFilters && <button onClick={() => openCreateFolder(null)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium">Nueva carpeta</button>}
                  </div>
                </div>
              )}
              {grupos.map(grupo => renderFolderGroup(grupo))}
              {tareasCompletadas.length > 0 && (
                <div className="space-y-2 pt-3">
                  <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wider ml-1">Completadas</h3>
                  {tareasCompletadas.map(tarea => (
                    <div key={tarea.id} className="bg-zinc-950/50 border border-zinc-900 rounded-xl px-3 py-2 flex items-center gap-2.5 opacity-60">
                      <button onClick={() => toggleTaskCompletion(tarea.id)} className="text-emerald-500/80 hover:text-emerald-400 transition-colors shrink-0"><CheckCircle2 size={18} strokeWidth={1.5} /></button>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-zinc-400 line-through decoration-zinc-600 truncate">{tarea.title}</h3>
                      </div>
                      <button onClick={() => deleteTask(tarea.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors shrink-0"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeFolderId !== null && (
            <div className="space-y-8">
              {activeFolderId !== 'sin-carpeta' && (() => {
                const c = getCarpeta(carpetas, activeFolderId);
                const color = c ? FOLDER_COLORS[c.colorIdx] : null;
                const path = c ? getFolderPath(carpetas, c.id) : [];
                const subcarpetas = c ? getChildFolders(carpetas, c.id) : [];
                return c ? (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {path.length <= 1 ? (
                          <Folder size={20} className={color.text} />
                        ) : (
                          <FolderOpen size={18} className={color.text} />
                        )}
                        <div>
                          {path.length > 1 && (
                            <p className="text-xs text-zinc-500 mb-0.5">
                              {path.slice(0, -1).map(p => p.name).join(' › ')}
                            </p>
                          )}
                          <h2 className={`text-lg font-bold ${color.text}`}>{c.name}</h2>
                          {path.length > 1 && (
                            <span className="text-[10px] text-zinc-600 uppercase tracking-wide">Subcarpeta</span>
                          )}
                        </div>
                        <span className="text-sm text-zinc-500">{tareasIncompletas.length} pendientes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditFolder(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-all"
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        <button
                          onClick={() => openCreateFolder(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-all"
                        >
                          <FolderPlus size={13} /> Subcarpeta
                        </button>
                        <button
                          onClick={() => confirmDeleteCarpeta(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-900/50 transition-all"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </div>

                    {subcarpetas.length > 0 && (
                      <div>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 ml-1">Subcarpetas</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subcarpetas.map(sub => {
                          const subColor = FOLDER_COLORS[sub.colorIdx];
                          const subCount = countPendingTasksInFolder(carpetas, tareas, sub.id);
                          return (
                            <FolderDropTarget key={sub.id} folderId={sub.id}>
                            <button
                              onClick={() => setActiveFolderId(sub.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all hover:border-zinc-600 bg-zinc-900/40 border-zinc-800/80"
                            >
                              <FolderOpen size={15} className={subColor.text} />
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 opacity-70 ${subColor.dot}`} />
                              <div className="flex-1 min-w-0">
                                <span className={`block text-xs font-medium truncate ${subColor.text}`}>{sub.name}</span>
                              </div>
                              <span className="text-[11px] text-zinc-500">{subCount}</span>
                              <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                            </button>
                            </FolderDropTarget>
                          );
                        })}
                        </div>
                      </div>
                    )}
                  </>
                ) : null;
              })()}

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider ml-1">Pendientes</h3>
                {tareasIncompletas.length === 0 && (
                  <div className="text-center py-10 px-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                    <p className="text-sm text-zinc-500 mb-3">{hasActiveFilters ? 'Sin resultados' : 'No hay tareas pendientes'}</p>
                    <button onClick={hasActiveFilters ? clearAllFilters : openCreateTask} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium">
                      {hasActiveFilters ? 'Limpiar filtros' : 'Crear tarea'}
                    </button>
                  </div>
                )}
                {tareasIncompletas.length > 0 && (
                  <SortableContext items={tareasIncompletas.map(t => taskDndId(t.id))} strategy={verticalListSortingStrategy}>
                    {tareasIncompletas.map(tarea => renderTaskCard(tarea, 'filtered-pending'))}
                  </SortableContext>
                )}
              </div>

              {tareasCompletadas.length > 0 && (
                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between ml-1">
                    <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wider">Completadas</h3>
                    <button type="button" onClick={clearCompletedTasks} className="text-[11px] text-red-400/70 hover:text-red-400">Limpiar</button>
                  </div>
                  {tareasCompletadas.map(tarea => (
                    <div key={tarea.id} className="bg-zinc-950/50 border border-zinc-900 rounded-xl px-3 py-2 flex items-center gap-2.5 opacity-60">
                      <button onClick={() => toggleTaskCompletion(tarea.id)} className="text-emerald-500/80 hover:text-emerald-400 transition-colors shrink-0"><CheckCircle2 size={18} strokeWidth={1.5} /></button>
                      <div className="flex-1 min-w-0"><h3 className="text-sm text-zinc-400 line-through decoration-zinc-600 truncate">{tarea.title}</h3></div>
                      <button onClick={() => deleteTask(tarea.id)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors shrink-0"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mobileFolderDrawer && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileFolderDrawer(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 p-4 overflow-y-auto onyx-scroll animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Carpetas</span>
              <button onClick={() => setMobileFolderDrawer(false)} className="p-1 text-zinc-500 hover:text-zinc-200"><X size={18} /></button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveFolderId(null); setMobileFolderDrawer(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${activeFolderId === null ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400'}`}
              >
                <ListTodo size={15} /><span className="flex-1 text-left">Todas</span>
              </button>
              {getRootFolders(carpetas).map(c => renderSidebarFolder(c))}
              {tareas.filter(t => !t.folderId && !t.completed).length > 0 && (
                <FolderDropTarget folderId="sin-carpeta">
                <button
                  onClick={() => { setActiveFolderId('sin-carpeta'); setMobileFolderDrawer(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${activeFolderId === 'sin-carpeta' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400'}`}
                >
                  <Folder size={15} /><span className="flex-1 text-left">Sin carpeta</span>
                </button>
                </FolderDropTarget>
              )}
              <button onClick={() => { openCreateFolder(null); setMobileFolderDrawer(false); }} className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-sm text-zinc-500 border border-dashed border-zinc-700">
                <FolderPlus size={15} /> Nueva carpeta
              </button>
            </div>
          </aside>
        </div>
      )}

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
        {activeDragTask ? (
          <div className="bg-zinc-900 border-2 border-blue-500/50 rounded-lg px-3 py-2.5 shadow-2xl shadow-black/60 text-sm text-zinc-100 max-w-[280px] pointer-events-none rotate-1 scale-105">
            <div className="flex items-center gap-2">
              <GripVertical size={14} className="text-blue-400 shrink-0" />
              <span className="line-clamp-2 font-medium">{activeDragTask.title}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
