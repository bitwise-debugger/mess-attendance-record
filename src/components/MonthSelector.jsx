import { CalendarDays } from 'lucide-react';
import { AVAILABLE_MONTHS } from '../utils/helpers';

export default function MonthSelector({ selectedMonth, onMonthChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="month-select" className="text-sm font-medium text-stone-600 flex items-center gap-1.5">
        <CalendarDays className="w-4 h-4 text-orange-500" />
        Select Month
      </label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
      >
        <option value="">-- Choose a month --</option>
        {AVAILABLE_MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
