import React from 'react';
import {
  Plus, X, Circle, CheckCircle2, Edit2, Trash2, ArrowUpRight,
  Folder, FolderOpen, CalendarCheck, Calendar, Clock, ListTodo, Paperclip, Repeat,
} from 'lucide-react';
import { FOLDER_COLORS, WEEKDAYS, WEEKDAY_NAMES } from '../../shared/constants';
import {
  getTaskEndDate, getTaskEndTime, getTaskDescription, normalizeRecurrence,
  formatRecurrenceLabel,
} from '../../shared/taskUtils';
import { formatDisplayDate, formatDisplayTime } from '../../shared/dateUtils';
import DateTimeFields from '../../shared/ui/DateTimeFields';
import RecurrencePicker from '../../shared/ui/RecurrencePicker';
import FolderPicker from './FolderPicker';
import AttachmentList from './AttachmentList';
import TaskDetailsContent from './TaskDetailsContent';
import { getCarpeta, getFolderPath } from './folderUtils';

export default function TaskModals({
  modalType,
  modalData,
  carpetas,
  nuevaCarpeta,
  setNuevaCarpeta,
  editingCarpeta,
  setEditingCarpeta,
  nuevaTarea,
  setNuevaTarea,
  nuevaSubtarea,
  setNuevaSubtarea,
  subtareasTemp,
  adjuntosTemp,
  formDataEdit,
  setFormDataEdit,
  fileInputCreateRef,
  fileInputEditRef,
  handleAddCarpeta,
  saveFolderEdit,
  handleAddTarea,
  handleAddSubtarea,
  removeSubtarea,
  handleAttachFiles,
  removeAttachment,
  saveTaskEdit,
  confirmarConversion,
  toggleSubtaskCompletion,
  confirmPromoteSubtask,
  openModal,
  openConversionModal,
  toggleTaskCompletion,
  deleteTask,
}) {
  if (modalType === 'crear-carpeta') {
    return (
      <form onSubmit={handleAddCarpeta} className="space-y-5">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Carpeta padre</label>
          <FolderPicker
            carpetas={carpetas}
            value={nuevaCarpeta.parentId}
            onChange={(id) => setNuevaCarpeta({ ...nuevaCarpeta, parentId: id })}
            rootLabel="Raíz"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Nombre de la carpeta</label>
          <input
            autoFocus
            type="text"
            placeholder="Ej. Trabajo, Juegos, Personal..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 text-zinc-100"
            value={nuevaCarpeta.name}
            onChange={(e) => setNuevaCarpeta({ ...nuevaCarpeta, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-2 ml-1">Color</label>
          <div className="grid grid-cols-4 gap-2">
            {FOLDER_COLORS.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNuevaCarpeta({ ...nuevaCarpeta, colorIdx: i })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${nuevaCarpeta.colorIdx === i ? `${c.bg} ${c.text} ${c.border} ring-2 ring-offset-2 ring-offset-zinc-900 ring-zinc-400` : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`}></span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        {nuevaCarpeta.name && (
          <div>
            {nuevaCarpeta.parentId && (
              <p className="text-xs text-zinc-500 mb-2 ml-1">
                Dentro de: {getFolderPath(carpetas, nuevaCarpeta.parentId).map(c => c.name).join(' / ')}
              </p>
            )}
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${FOLDER_COLORS[nuevaCarpeta.colorIdx].bg} ${FOLDER_COLORS[nuevaCarpeta.colorIdx].border}`}>
              <FolderOpen size={16} className={FOLDER_COLORS[nuevaCarpeta.colorIdx].text} />
              <span className={`text-sm font-medium ${FOLDER_COLORS[nuevaCarpeta.colorIdx].text}`}>{nuevaCarpeta.name}</span>
            </div>
          </div>
        )}
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">
            {nuevaCarpeta.parentId ? 'Crear Subcarpeta' : 'Crear Carpeta'}
          </button>
        </div>
      </form>
    );
  }

  if (modalType === 'editar-carpeta' && editingCarpeta) {
    return (
      <form onSubmit={saveFolderEdit} className="space-y-5">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Nombre de la carpeta</label>
          <input
            autoFocus
            type="text"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 text-zinc-100"
            value={editingCarpeta.name}
            onChange={(e) => setEditingCarpeta({ ...editingCarpeta, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-2 ml-1">Color</label>
          <div className="grid grid-cols-4 gap-2">
            {FOLDER_COLORS.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setEditingCarpeta({ ...editingCarpeta, colorIdx: i })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${editingCarpeta.colorIdx === i ? `${c.bg} ${c.text} ${c.border} ring-2 ring-offset-2 ring-offset-zinc-900 ring-zinc-400` : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`}></span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-3 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">Guardar</button>
        </div>
      </form>
    );
  }

  if (modalType === 'crear-tarea') {
    return (
      <form onSubmit={handleAddTarea} className="space-y-4">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nombre de la tarea"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-500 text-zinc-100"
            value={nuevaTarea.title}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, title: e.target.value })}
            autoFocus
          />
          {subtareasTemp.length > 0 && (
            <ul className="space-y-1.5 pl-1">
              {subtareasTemp.map((st, i) => (
                <li key={st.id} className="text-sm text-zinc-400 flex items-center justify-between bg-zinc-900/60 px-3 py-2 rounded-lg border border-zinc-800/50">
                  <span className="flex items-center gap-2"><Circle size={12} className="text-zinc-600" />{st.title}</span>
                  <button type="button" onClick={() => removeSubtarea(i)} className="text-zinc-600 hover:text-red-400"><X size={14} /></button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Añadir subtarea..."
              className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 text-zinc-100"
              value={nuevaSubtarea}
              onChange={(e) => setNuevaSubtarea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtarea(e)}
            />
            <button type="button" onClick={handleAddSubtarea} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors shrink-0" title="Añadir subtarea">
              <Plus size={16} />
            </button>
          </div>
        </div>
        <DateTimeFields
          endDate={nuevaTarea.endDate}
          endTime={nuevaTarea.endTime}
          onDateChange={(endDate) => setNuevaTarea({ ...nuevaTarea, endDate })}
          onTimeChange={(endTime) => setNuevaTarea({ ...nuevaTarea, endTime })}
        />
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Descripción</label>
          <textarea rows="3" placeholder="Detalles, contexto o instrucciones..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 resize-none text-zinc-100" value={nuevaTarea.description} onChange={(e) => setNuevaTarea({ ...nuevaTarea, description: e.target.value })} />
        </div>
        <RecurrencePicker
          value={{ isRecurring: nuevaTarea.isRecurring, recurrence: nuevaTarea.recurrence }}
          endDate={nuevaTarea.endDate}
          onChange={(patch) => setNuevaTarea({ ...nuevaTarea, ...patch })}
        />
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Carpeta</label>
          <FolderPicker
            carpetas={carpetas}
            value={nuevaTarea.folderId}
            onChange={(id) => setNuevaTarea({ ...nuevaTarea, folderId: id })}
          />
        </div>
        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
          <label className="block text-xs text-zinc-500 mb-2">Archivos adjuntos</label>
          <input
            ref={fileInputCreateRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => { handleAttachFiles(e.target.files, false); e.target.value = ''; }}
          />
          <button
            type="button"
            onClick={() => fileInputCreateRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-xs transition-colors"
          >
            <Paperclip size={15} /> Adjuntar archivos
          </button>
          <p className="text-[10px] text-zinc-600 mt-1.5 ml-1">Máx. 5 MB por archivo</p>
          <AttachmentList attachments={adjuntosTemp} onRemove={(id) => removeAttachment(id, false)} />
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">Guardar Tarea</button>
        </div>
      </form>
    );
  }

  if (modalType === 'convertir') {
    return (
      <form onSubmit={confirmarConversion} className="space-y-5">
        <p className="text-sm text-zinc-400 mb-4">Asigna horario a <strong className="text-zinc-200">{modalData.title}</strong> para visualizarla en tu calendario.</p>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Hora de Inicio</label>
          <input type="datetime-local" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 text-zinc-200" value={formDataEdit.start} onChange={(e) => setFormDataEdit({ ...formDataEdit, start: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Hora de Finalización</label>
          <input type="datetime-local" required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 text-zinc-200" value={formDataEdit.end} onChange={(e) => setFormDataEdit({ ...formDataEdit, end: e.target.value })} />
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">Agendar Evento</button>
        </div>
      </form>
    );
  }

  if (modalType === 'detalles-tarea' && modalData) {
    return (
      <TaskDetailsContent
        tarea={modalData}
        carpetas={carpetas}
        onEdit={(t) => openModal('editar-tarea', t)}
        onConversion={openConversionModal}
        onToggleComplete={toggleTaskCompletion}
        onDelete={deleteTask}
        onToggleSubtask={toggleSubtaskCompletion}
        onPromoteSubtask={confirmPromoteSubtask}
      />
    );
  }

  if (modalType === 'editar-tarea' && formDataEdit) {
    return (
      <form onSubmit={saveTaskEdit} className="space-y-4">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nombre de la tarea"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500"
            value={formDataEdit.title}
            onChange={(e) => setFormDataEdit({ ...formDataEdit, title: e.target.value })}
          />
          {formDataEdit.subtasks?.length > 0 && (
            <ul className="space-y-1.5 pl-1">
              {formDataEdit.subtasks.map((st, i) => (
                <li key={st.id || i} className="flex gap-2">
                  <input
                    type="text"
                    className={`flex-1 bg-zinc-900/60 border border-zinc-800/50 rounded-lg px-3 py-2 text-sm ${st.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}
                    value={st.title}
                    onChange={(e) => { const s = [...formDataEdit.subtasks]; s[i] = { ...s[i], title: e.target.value }; setFormDataEdit({ ...formDataEdit, subtasks: s }); }}
                  />
                  <button type="button" onClick={() => removeSubtarea(i, true)} className="px-3 bg-red-950/30 text-red-400 hover:bg-red-900/50 rounded-lg"><X size={14}/></button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Añadir subtarea..."
              className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600"
              value={nuevaSubtarea}
              onChange={(e) => setNuevaSubtarea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtarea(e, true)}
            />
            <button type="button" onClick={(e) => handleAddSubtarea(e, true)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors shrink-0" title="Añadir subtarea">
              <Plus size={16} />
            </button>
          </div>
        </div>
        <DateTimeFields
          endDate={formDataEdit.endDate || ''}
          endTime={formDataEdit.endTime || ''}
          onDateChange={(endDate) => setFormDataEdit({ ...formDataEdit, endDate })}
          onTimeChange={(endTime) => setFormDataEdit({ ...formDataEdit, endTime })}
        />
        <div>
          <label className="block text-xs text-zinc-500 mb-1 ml-1">Descripción</label>
          <textarea rows="3" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 resize-none" value={formDataEdit.description || ''} onChange={(e) => setFormDataEdit({ ...formDataEdit, description: e.target.value })}></textarea>
        </div>
        <RecurrencePicker
          value={{ isRecurring: formDataEdit.isRecurring, recurrence: formDataEdit.recurrence }}
          endDate={formDataEdit.endDate}
          onChange={(patch) => setFormDataEdit({ ...formDataEdit, ...patch })}
        />
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Carpeta</label>
          <FolderPicker
            carpetas={carpetas}
            value={formDataEdit.folderId}
            onChange={(id) => setFormDataEdit({ ...formDataEdit, folderId: id })}
          />
        </div>
        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
          <label className="block text-xs text-zinc-500 mb-2">Archivos adjuntos</label>
          <input
            ref={fileInputEditRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => { handleAttachFiles(e.target.files, true); e.target.value = ''; }}
          />
          <button
            type="button"
            onClick={() => fileInputEditRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-xs transition-colors"
          >
            <Paperclip size={15} /> Adjuntar archivos
          </button>
          <p className="text-[10px] text-zinc-600 mt-1.5 ml-1">Máx. 5 MB por archivo</p>
          <AttachmentList attachments={formDataEdit.attachments} onRemove={(id) => removeAttachment(id, true)} />
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">Guardar Cambios</button>
        </div>
      </form>
    );
  }

  return null;
}
