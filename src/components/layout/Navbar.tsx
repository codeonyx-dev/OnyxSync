import React from 'react';
import { CalendarCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-zinc-800 shadow-lg">
            <CalendarCheck size={18} className="text-zinc-200" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-zinc-100">Onyx<span className="text-zinc-500">Sync</span></h1>
        </div>
      </div>
    </nav>
  );
}
