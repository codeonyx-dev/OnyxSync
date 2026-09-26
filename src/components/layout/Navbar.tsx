import React from 'react';
import { Calendar, CheckSquare, CalendarCheck, LayoutGrid } from 'lucide-react';
import GoogleSyncButton from './GoogleSyncButton';

export default function Navbar({ activeTab, onTabChange, onBackToLobby }) {
  return (
    <nav className="border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-zinc-800 shadow-lg">
            <CalendarCheck size={16} className="text-zinc-200 sm:w-[18px] sm:h-[18px]" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-wide text-zinc-100 truncate hidden xs:block">
            Onyx<span className="text-zinc-500">Sync</span>
          </h1>
        </div>

        {/* Pestañas centrales */}
        <div className="flex p-1 bg-zinc-900/60 rounded-xl border border-zinc-800/60 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('tareas')}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'tareas'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent'
            }`}
          >
            <CheckSquare size={15} />
            <span className="hidden sm:inline">Mis Tareas</span>
            <span className="sm:hidden">Tareas</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('actividades')}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              activeTab === 'actividades'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent'
            }`}
          >
            <Calendar size={15} />
            <span>Calendario</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onBackToLobby && (
            <button
              type="button"
              onClick={onBackToLobby}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
              title="Volver al lobby"
            >
              <LayoutGrid size={16} />
            </button>
          )}
          <GoogleSyncButton />
        </div>
      </div>
    </nav>
  );
}
