import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, disabled }) {
  const debounceTimer = useRef(null);

  const handleChange = (e) => {
    const raw = e.target.value;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => onChange(raw), 350);
    // Update display immediately via a controlled trick: call onChange right away too
    onChange(raw);
  };

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="roll-input" className="text-sm font-medium text-stone-600 flex items-center gap-1.5">
        <Search className="w-4 h-4 text-orange-500" />
        Roll Number
      </label>
      <div className="relative">
        <input
          id="roll-input"
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="e.g. 25011519-014"
          className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2.5 pr-9 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
