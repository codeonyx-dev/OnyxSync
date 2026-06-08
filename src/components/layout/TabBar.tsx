import React from 'react';
import { Calendar, CheckSquare } from 'lucide-react';

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="flex p-1.5 bg-zinc-900/50 rounded-xl mb-8 border border-zinc-800/50 w-full max-w-md mx-auto">
      <button onClick={() => onTabChange('tareas')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'tareas' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'}`}>
        <CheckSquare size={16} /> Mis Tareas
      </button>
      <button onClick={() => onTabChange('actividades')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'actividades' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'}`}>
        <Calendar size={16} /> Calendario
      </button>
    </div>
  );
}
