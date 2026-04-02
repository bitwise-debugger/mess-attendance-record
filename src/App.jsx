import { useState, useMemo } from 'react';
import { AlertCircle, SearchX } from 'lucide-react';
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

  const { loading, error, studentMap, loadMonth } = useSheetData();

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

  // "No data" means we got an error that looks like a missing sheet
  const noData = error && selectedSheet;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header — flat orange, no gradient */}
      <header className="bg-orange-500 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src="/favicon.svg" alt="Logo" className="w-12 h-12" />
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">
              Hostel Attendance
            </h1>
            <p className="text-orange-100 text-xs">Mess &amp; Attendance Viewer</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 space-y-4">
          <MonthSelector selectedSheet={selectedSheet} onSelect={handleMonthSelect} />
          <SearchBar
            value={rollInput}
            onChange={setRollInput}
            disabled={!studentMap && !loading}
          />
        </div>

        {loading && <Loader />}

        {/* No data for this sheet */}
        {noData && (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400">
            <CalendarEmpty />
            <p className="text-sm font-medium mt-3">No data available</p>
            <p className="text-xs mt-1">
              We don't have attendance records for{' '}
              <span className="font-semibold text-orange-500">{selectedLabel}</span>.
            </p>
          </div>
        )}

        {showNotFound && (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400">
            <SearchX className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">No record found</p>
            <p className="text-xs mt-1">Check the roll number and try again.</p>
          </div>
        )}

        {foundStudent && <StudentCard student={foundStudent} />}

        {!selectedSheet && !loading && (
          <p className="text-center text-sm text-stone-400 py-8">
            Pick a month from the calendar above to get started.
          </p>
        )}

        {studentMap && !rollInput.trim() && !loading && (
          <p className="text-center text-sm text-stone-400 py-4">
            Enter your roll number to view attendance.
          </p>
        )}
      </main>
    </div>
  );
}

// Simple inline SVG for "empty calendar" state
function CalendarEmpty() {
  return (
    <svg className="w-12 h-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
