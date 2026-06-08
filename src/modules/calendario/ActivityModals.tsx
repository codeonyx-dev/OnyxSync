import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

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
        <input type="text" placeholder="Título del evento (Ej. Reunión de diseño)" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 text-zinc-100" value={nuevaActividad.title} onChange={(e) => setNuevaActividad({ ...nuevaActividad, title: e.target.value })} autoFocus />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Inicio</label>
            <input type="datetime-local" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 text-zinc-300" value={nuevaActividad.start} onChange={(e) => setNuevaActividad({ ...nuevaActividad, start: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 ml-1">Fin</label>
            <input type="datetime-local" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 text-zinc-300" value={nuevaActividad.end} onChange={(e) => setNuevaActividad({ ...nuevaActividad, end: e.target.value })} />
          </div>
        </div>
        <textarea placeholder="Descripción o ubicación..." rows="2" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600 resize-none text-zinc-100" value={nuevaActividad.description} onChange={(e) => setNuevaActividad({ ...nuevaActividad, description: e.target.value })}></textarea>
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">Añadir al Calendario</button>
        </div>
      </form>
    );
  }

  if (modalType === 'detalles-actividad') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-3">{modalData.title}</h2>
          <div className="space-y-2 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-sm text-zinc-300"><strong>Inicio:</strong> {new Date(modalData.start).toLocaleString()}</div>
            {modalData.end && <div className="flex items-center gap-2 text-sm text-zinc-300"><strong>Fin:</strong> {new Date(modalData.end).toLocaleString()}</div>}
          </div>
        </div>
        {modalData.description && <div><h4 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Descripción</h4><div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><p className="text-sm text-zinc-300 whitespace-pre-line">{modalData.description}</p></div></div>}
        <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-800/50">
          <button onClick={() => openModal('editar-actividad', modalData)} className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"><Edit2 size={13}/> Editar</button>
          <button onClick={() => deleteActivity(modalData.id)} className="p-1.5 bg-red-950/30 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors ml-auto" title="Eliminar"><Trash2 size={14}/></button>
        </div>
      </div>
    );
  }

  if (modalType === 'editar-actividad' && formDataEdit) {
    return (
      <form onSubmit={saveActivityEdit} className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1 ml-1">Título</label>
          <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white" value={formDataEdit.title} onChange={(e) => setFormDataEdit({ ...formDataEdit, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1">Inicio</label>
            <input type="datetime-local" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300" value={formDataEdit.start} onChange={(e) => setFormDataEdit({ ...formDataEdit, start: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1">Fin</label>
            <input type="datetime-local" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300" value={formDataEdit.end} onChange={(e) => setFormDataEdit({ ...formDataEdit, end: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1 ml-1">Descripción</label>
          <textarea rows="4" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 resize-none" value={formDataEdit.description} onChange={(e) => setFormDataEdit({ ...formDataEdit, description: e.target.value })}></textarea>
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-zinc-800/50">
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium transition-colors">Guardar Evento</button>
        </div>
      </form>
    );
  }

  return null;
}
