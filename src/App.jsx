import { useState, useMemo } from 'react';
import { SearchX, AlertCircle } from 'lucide-react';
import MonthSelector from './components/MonthSelector';
import SearchBar from './components/SearchBar';
import StudentCard from './components/StudentCard';
import Loader from './components/Loader';
import { useSheetData } from './hooks/useSheetData';
import { normalizeRoll } from './utils/helpers';

export default function App() {
  const [selectedSheet, setSelectedSheet] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [rollInput, setRollInput] = useState('');

  const { loading, error, studentMap, colMeta, hasData, loadMonth } = useSheetData();

  const handleMonthSelect = (sheetName, label) => {
    setSelectedSheet(sheetName);
    setSelectedLabel(label);
    setRollInput('');
    loadMonth(sheetName);
  };

  const foundStudent = useMemo(() => {
    if (!studentMap || !rollInput.trim()) return null;
    return studentMap[normalizeRoll(rollInput)] || null;
  }, [studentMap, rollInput]);

  const showNotFound = studentMap && rollInput.trim() && !foundStudent && !loading;
  const showNoData   = studentMap && !hasData && !loading && !rollInput.trim();

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-orange-100 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <img src="/favicon.svg" alt="Logo" className="w-16 h-16" />
          <div>
            <h1 className="text-stone-800 font-semibold text-lg leading-tight">Hostel Attendance</h1>
            <p className="text-stone-400 text-xs">Mess &amp; Attendance Viewer</p>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6
                      flex flex-col md:flex-row gap-6 items-start">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 space-y-4">
            <MonthSelector selectedSheet={selectedSheet} onSelect={handleMonthSelect} />
            <SearchBar
              value={rollInput}
              onChange={setRollInput}
              disabled={!studentMap && !loading}
            />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 space-y-5">

          {loading && <Loader />}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">No data for {selectedLabel}</p>
                <p className="text-xs mt-0.5 opacity-75">The sheet may not exist yet or hasn't been filled in.</p>
              </div>
            </div>
          )}

          {showNoData && (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <CalendarEmpty />
              <p className="text-sm font-medium mt-3">No attendance data yet</p>
              <p className="text-xs mt-1 text-center">
                <span className="font-semibold text-orange-500">{selectedLabel}</span> exists but hasn't been filled in.
              </p>
            </div>
          )}

          {showNotFound && (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <SearchX className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">No record found</p>
              <p className="text-xs mt-1">Check the roll number and try again.</p>
            </div>
          )}

          {foundStudent && <StudentCard student={foundStudent} colMeta={colMeta} />}

          {!selectedSheet && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <CalendarEmpty />
              <p className="text-sm font-medium mt-3">Pick a month to get started</p>
              <p className="text-xs mt-1">Select a month from the panel on the left.</p>
            </div>
          )}

          {studentMap && hasData && !rollInput.trim() && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <SearchX className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Enter your roll number</p>
              <p className="text-xs mt-1">Type your roll number in the search box to view attendance.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function CalendarEmpty() {
  return (
    <svg className="w-12 h-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
