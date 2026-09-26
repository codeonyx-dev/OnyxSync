import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';
import { formatDisplayDate, formatDisplayTime } from '../dateUtils';
import CalendarPicker from './CalendarPicker';
import TimePicker from './TimePicker';

export default function DateTimeFields({
  endDate,
  endTime,
  onDateChange,
  onTimeChange,
  dateLabel = 'Fecha de finalización',
  timeLabel = 'Hora',
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTime, setShowTime] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 ml-1">{dateLabel}</label>
        <button
          type="button"
          onClick={() => setShowCalendar(v => !v)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${endDate ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
        >
          <Calendar size={16} className={endDate ? 'text-zinc-300' : 'text-zinc-600'} />
          <span className="flex-1">{formatDisplayDate(endDate)}</span>
          <ChevronDown size={14} className={`text-zinc-600 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
        </button>
        {showCalendar && (
          <CalendarPicker
            value={endDate}
            onChange={onDateChange}
            onPick={() => setShowCalendar(false)}
          />
        )}
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 ml-1">{timeLabel}</label>
        <button
          type="button"
          onClick={() => setShowTime(v => !v)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${endTime ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
        >
          <Clock size={16} className={endTime ? 'text-zinc-300' : 'text-zinc-600'} />
          <span className="flex-1">{formatDisplayTime(endTime)}</span>
          <ChevronDown size={14} className={`text-zinc-600 transition-transform ${showTime ? 'rotate-180' : ''}`} />
        </button>
        {showTime && (
          <TimePicker
            value={endTime}
            onChange={onTimeChange}
            onComplete={() => setShowTime(false)}
          />
        )}
      </div>
    </div>
  );
}
