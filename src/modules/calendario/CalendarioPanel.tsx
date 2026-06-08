import React from 'react';
import { Clock, Edit2 } from 'lucide-react';

export default function CalendarioPanel({ actividades, openModal }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Línea de Tiempo</h3>
          <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">Listo para Sectograph</span>
        </div>
        {actividades.sort((a, b) => new Date(a.start) - new Date(b.start)).map(actividad => {
          const startDate = new Date(actividad.start);
          const endDate = actividad.end ? new Date(actividad.end) : null;
          return (
            <div key={actividad.id} className="relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 overflow-hidden group transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-zinc-600 group-hover:bg-zinc-400 transition-colors"></div>
              <div className="pl-3 flex justify-between items-start">
                <div className="cursor-pointer flex-1" onClick={() => openModal('detalles-actividad', actividad)}>
                  <h3 className="font-semibold text-lg mb-1.5 text-zinc-100">{actividad.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                    <Clock size={14} className="text-zinc-500" />
                    <span>{startDate.toLocaleDateString()} • {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{endDate && ` hasta ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-4">
                  <button onClick={() => openModal('editar-actividad', actividad)} className="p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"><Edit2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
