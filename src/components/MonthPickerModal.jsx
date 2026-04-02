import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_FULL, MONTH_NAMES, MIN_YEAR, buildSheetName } from '../utils/helpers';

/**
 * Full-screen bottom-sheet modal for mobile month selection.
 * Renders as a slide-up overlay on small screens.
 */
export default function MonthPickerModal({ isOpen, onClose, selectedSheet, onSelect }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const canGoNext = year < today.getFullYear();

  const handleSelect = (sheet, label) => {
    onSelect(sheet, label);
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Sheet panel — stop propagation so clicks inside don't close */}
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <p className="font-semibold text-stone-800 text-base">Select Month</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 transition text-stone-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Year navigator */}
        <div className="flex items-center justify-between px-5 py-3 bg-orange-500">
          <button
            onClick={() => setYear((y) => y - 1)}
            disabled={year <= MIN_YEAR}
            className="p-1.5 rounded-full text-white hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-base tracking-wide">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            disabled={!canGoNext}
            className="p-1.5 rounded-full text-white hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-4 gap-2.5 p-5">
          {MONTH_FULL.map((name, idx) => {
            const sheet = buildSheetName(idx, year);
            const isSelected = selectedSheet === sheet;
            const isFuture =
              year > today.getFullYear() ||
              (year === today.getFullYear() && idx > today.getMonth());

            return (
              <button
                key={sheet}
                onClick={() => !isFuture && handleSelect(sheet, `${name} ${year}`)}
                disabled={isFuture}
                className={`
                  rounded-xl py-3 text-sm font-medium transition
                  ${isFuture
                    ? 'text-stone-300 cursor-not-allowed'
                    : isSelected
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-orange-50 text-stone-700 hover:bg-orange-100 hover:text-orange-700 border border-orange-100'
                  }
                `}
              >
                {MONTH_NAMES[idx]}
              </button>
            );
          })}
        </div>

        {/* Safe area spacer for phones with home indicator */}
        <div className="h-4" />
      </div>
    </div>
  );
}
