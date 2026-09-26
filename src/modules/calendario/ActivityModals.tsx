import React from 'react';
import { Calendar, Clock, Edit2, Trash2, Repeat } from 'lucide-react';
import DateTimeFields from '../../shared/ui/DateTimeFields';
import RecurrencePicker from '../../shared/ui/RecurrencePicker';
import { formatDisplayDate, formatDisplayTime } from '../../shared/dateUtils';
import {
  getActivityStartDate,
  getActivityStartTime,
  getActivityEndDate,
  getActivityEndTime,
  formatActivityTimeRange,
  getActivityRecurrenceLabel,
} from './activityUtils';

export default function ActivityModals({
  modalType,
  modalData,
  nuevaActividad,
  setNuevaActividad,
  formDataEdit,
  setFormDataEdit,
  handleAddActividad,
  saveActivityEdit,
  deleteActivity,
  openModal,
}) {
  if (modalType === 'crear-actividad') {
    return (
      <form onSubmit={handleAddActividad} className="space-y-4">
        <input
          type="text"
          placeholder="Título del evento (Ej. Reunión de diseño)"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 text-zinc-100"
          value={nuevaActividad.title}
          onChange={(e) => setNuevaActividad({ ...nuevaActividad, title: e.target.value })}
          autoFocus
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateTimeFields
            endDate={nuevaActividad.startDate}
            endTime={nuevaActividad.startTime}
            onDateChange={(startDate) => setNuevaActividad({ ...nuevaActividad, startDate, endDate: nuevaActividad.endDate || startDate })}
            onTimeChange={(startTime) => setNuevaActividad({ ...nuevaActividad, startTime })}
            dateLabel="Fecha de inicio"
            timeLabel="Hora de inicio"
          />
          <DateTimeFields
            endDate={nuevaActividad.endDate}
            endTime={nuevaActividad.endTime}
            onDateChange={(endDate) => setNuevaActividad({ ...nuevaActividad, endDate })}
            onTimeChange={(endTime) => setNuevaActividad({ ...nuevaActividad, endTime })}
            dateLabel="Fecha de fin"
            timeLabel="Hora de fin"
          />
        </div>
        <RecurrencePicker
          value={{ isRecurring: nuevaActividad.isRecurring, recurrence: nuevaActividad.recurrence }}
          endDate={nuevaActividad.startDate}
          onChange={(patch) => setNuevaActividad({ ...nuevaActividad, ...patch })}
        />
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Descripción</label>
          <textarea
            placeholder="Descripción o ubicación..."
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 resize-none text-zinc-100"
            value={nuevaActividad.description}
            onChange={(e) => setNuevaActividad({ ...nuevaActividad, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">
            Añadir al Calendario
          </button>
        </div>
      </form>
    );
  }

  if (modalType === 'detalles-actividad') {
    const startDate = getActivityStartDate(modalData);
    const endDate = getActivityEndDate(modalData);
    const timeRange = formatActivityTimeRange(modalData);
    const isMultiDay = endDate && endDate !== startDate;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-3">{modalData.title}</h2>
          <div className="space-y-2 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
            {startDate && (
              <p className="text-sm text-zinc-300 flex items-center gap-2">
                <Calendar size={14} className="text-zinc-500 shrink-0" />
                <span>
                  {isMultiDay
                    ? `${formatDisplayDate(startDate)} → ${formatDisplayDate(endDate)}`
                    : formatDisplayDate(startDate)}
                </span>
              </p>
            )}
            {timeRange && (
              <p className="text-sm text-zinc-300 flex items-center gap-2">
                <Clock size={14} className="text-zinc-500 shrink-0" />
                <span>{timeRange}</span>
              </p>
            )}
            {!timeRange && getActivityStartTime(modalData) && (
              <p className="text-sm text-zinc-300 flex items-center gap-2">
                <Clock size={14} className="text-zinc-500 shrink-0" />
                <span>{formatDisplayTime(getActivityStartTime(modalData))}</span>
              </p>
            )}
          </div>
        </div>
        {modalData.isRecurring && getActivityRecurrenceLabel(modalData) && (
          <div className="px-3 py-2.5 rounded-xl bg-violet-950/20 border border-violet-900/30">
            <p className="text-xs text-violet-300 flex items-center gap-1.5">
              <Repeat size={13} className="shrink-0" />
              {getActivityRecurrenceLabel(modalData)}
            </p>
          </div>
        )}
        {modalData.description && (
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Descripción</h4>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <p className="text-sm text-zinc-300 whitespace-pre-line">{modalData.description}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-800/50">
          <button
            onClick={() => openModal('editar-actividad', modalData)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit2 size={13} /> Editar
          </button>
          <button
            onClick={() => deleteActivity(modalData.id)}
            className="p-1.5 bg-red-950/30 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors ml-auto"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (modalType === 'editar-actividad' && formDataEdit) {
    return (
      <form onSubmit={saveActivityEdit} className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1 ml-1">Título</label>
          <input
            type="text"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white"
            value={formDataEdit.title}
            onChange={(e) => setFormDataEdit({ ...formDataEdit, title: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateTimeFields
            endDate={formDataEdit.startDate}
            endTime={formDataEdit.startTime}
            onDateChange={(startDate) => setFormDataEdit({ ...formDataEdit, startDate, endDate: formDataEdit.endDate || startDate })}
            onTimeChange={(startTime) => setFormDataEdit({ ...formDataEdit, startTime })}
            dateLabel="Fecha de inicio"
            timeLabel="Hora de inicio"
          />
          <DateTimeFields
            endDate={formDataEdit.endDate}
            endTime={formDataEdit.endTime}
            onDateChange={(endDate) => setFormDataEdit({ ...formDataEdit, endDate })}
            onTimeChange={(endTime) => setFormDataEdit({ ...formDataEdit, endTime })}
            dateLabel="Fecha de fin"
            timeLabel="Hora de fin"
          />
        </div>
        <RecurrencePicker
          value={{ isRecurring: formDataEdit.isRecurring, recurrence: formDataEdit.recurrence }}
          endDate={formDataEdit.startDate}
          onChange={(patch) => setFormDataEdit({ ...formDataEdit, ...patch })}
        />
        <div>
          <label className="block text-xs text-zinc-500 mb-1 ml-1">Descripción</label>
          <textarea
            rows={4}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 resize-none"
            value={formDataEdit.description}
            onChange={(e) => setFormDataEdit({ ...formDataEdit, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">
            Guardar Evento
          </button>
        </div>
      </form>
    );
  }

  return null;
}
