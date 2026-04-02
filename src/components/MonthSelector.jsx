import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { MONTH_FULL, MONTH_NAMES, MIN_YEAR, buildSheetName } from '../utils/helpers';

/**
 * A calendar-style month picker.
 * Shows a year navigator + 12 month tiles.
 * onSelect(sheetName, label) is called when a month is clicked.
 */
export default function MonthSelector({ selectedSheet, onSelect }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());

  const prevYear = () => setYear((y) => y - 1);
  const nextYear = () => {
    if (year < today.getFullYear()) setYear((y) => y + 1);
  };

  const canGoNext = year < today.getFullYear();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-stone-600 flex items-center gap-1.5">
        <CalendarDays className="w-4 h-4 text-orange-500" />
        Select Month
      </p>

      <div className="rounded-xl border border-orange-200 bg-orange-50 overflow-hidden">
        {/* Year navigation */}
        <div className="flex items-center justify-between px-4 py-3 bg-orange-500">
          <button
            onClick={prevYear}
            disabled={year <= MIN_YEAR}
            className="p-1 rounded-full text-white hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-white font-semibold text-base tracking-wide">{year}</span>

          <button
            onClick={nextYear}
            disabled={!canGoNext}
            className="p-1 rounded-full text-white hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Next year"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-4 gap-2 p-3">
          {MONTH_FULL.map((name, idx) => {
            const sheet = buildSheetName(idx, year);
            const isSelected = selectedSheet === sheet;

            // Disable future months
            const isFuture =
              year > today.getFullYear() ||
              (year === today.getFullYear() && idx > today.getMonth());

            return (
              <button
                key={sheet}
                onClick={() => !isFuture && onSelect(sheet, `${name} ${year}`)}
                disabled={isFuture}
                className={`
                  rounded-lg py-2 text-xs font-medium transition
                  ${isFuture
                    ? 'text-stone-300 cursor-not-allowed'
                    : isSelected
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-orange-100 hover:text-orange-700 border border-orange-100'
                  }
                `}
              >
                {MONTH_NAMES[idx]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
