import { useState, useMemo } from 'react';
import { AlertCircle, SearchX } from 'lucide-react';
import MonthSelector from './components/MonthSelector';
import SearchBar from './components/SearchBar';
import StudentCard from './components/StudentCard';
import Loader from './components/Loader';
import { useSheetData } from './hooks/useSheetData';
import { normalizeRoll } from './utils/helpers';

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [rollInput, setRollInput] = useState('');

  const { loading, error, studentMap, loadMonth } = useSheetData();

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setRollInput('');
    if (month) loadMonth(month);
  };

  // O(1) hashmap lookup
  const foundStudent = useMemo(() => {
    if (!studentMap || !rollInput.trim()) return null;
    return studentMap[normalizeRoll(rollInput)] || null;
  }, [studentMap, rollInput]);

  const showNotFound = studentMap && rollInput.trim() && !foundStudent && !loading;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-700 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <img
            src="/favicon.svg"
            alt="Logo"
            className="w-10 h-10 rounded-lg bg-white/20 p-1"
          />
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-wide">
              Hostel Attendance
            </h1>
            <p className="text-orange-100 text-xs">Mess &amp; Attendance Viewer</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Controls card */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 space-y-4">
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
          <SearchBar
            value={rollInput}
            onChange={setRollInput}
            disabled={!studentMap && !loading}
          />
        </div>

        {loading && <Loader />}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
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

        {!selectedMonth && !loading && (
          <p className="text-center text-sm text-stone-400 py-8">
            Select a month above to get started.
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
