import { useState, useMemo } from 'react';
import { SearchX, AlertCircle, CalendarDays } from 'lucide-react';
import MonthSelector from './components/MonthSelector';
import MonthPickerModal from './components/MonthPickerModal';
import SearchBar from './components/SearchBar';
import StudentCard from './components/StudentCard';
import Loader from './components/Loader';
import { useSheetData } from './hooks/useSheetData';
import { normalizeRoll } from './utils/helpers';

export default function App() {
  const [selectedSheet, setSelectedSheet] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [rollInput,     setRollInput]     = useState('');
  const [modalOpen,     setModalOpen]     = useState(false);

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

      {/* ── Desktop/tablet: sidebar + main ── */}
      <div className="hidden md:flex flex-1 max-w-7xl w-full mx-auto px-6 py-6 gap-6 items-start">

        {/* Sidebar */}
        <aside className="w-72 lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 space-y-4">
            <MonthSelector selectedSheet={selectedSheet} onSelect={handleMonthSelect} />
            <SearchBar
              value={rollInput}
              onChange={setRollInput}
              disabled={!studentMap && !loading}
            />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-5">
          <BodyContent
            loading={loading} error={error} showNoData={showNoData}
            showNotFound={showNotFound} foundStudent={foundStudent}
            colMeta={colMeta} selectedSheet={selectedSheet}
            selectedLabel={selectedLabel} hasData={hasData}
            rollInput={rollInput} isMobile={false}
          />
        </main>
      </div>

      {/* ── Mobile: full-width content + sticky bottom bar ── */}
      <div className="md:hidden flex-1 flex flex-col">

        {/* Mobile search bar — always visible below header */}
        <div className="bg-white border-b border-orange-100 px-4 py-3">
          <SearchBar
            value={rollInput}
            onChange={setRollInput}
            disabled={!studentMap && !loading}
          />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
          <BodyContent
            loading={loading} error={error} showNoData={showNoData}
            showNotFound={showNotFound} foundStudent={foundStudent}
            colMeta={colMeta} selectedSheet={selectedSheet}
            selectedLabel={selectedLabel} hasData={hasData}
            rollInput={rollInput} isMobile
          />
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-orange-100 shadow-lg px-4 py-3">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-between rounded-xl bg-orange-500 px-4 py-3 text-white shadow-sm active:bg-orange-600 transition"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              <span className="text-sm font-medium">
                {selectedLabel || 'Select a Month'}
              </span>
            </div>
            <span className="text-xs text-orange-200">Tap to change</span>
          </button>
        </div>
      </div>

      {/* Month picker modal (mobile only) */}
      <MonthPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedSheet={selectedSheet}
        onSelect={handleMonthSelect}
      />
    </div>
  );
}

/* ── Shared body content ─────────────────────────────────────────────── */
function BodyContent({
  loading, error, showNoData, showNotFound,
  foundStudent, colMeta, selectedSheet, selectedLabel,
  hasData, rollInput, isMobile,
}) {
  return (
    <>
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
        <EmptyState icon={<CalendarEmptySvg />} title="No attendance data yet"
          sub={<><span className="font-semibold text-orange-500">{selectedLabel}</span> exists but hasn't been filled in.</>}
        />
      )}

      {showNotFound && (
        <EmptyState icon={<SearchX className="w-12 h-12 text-orange-300" />}
          title="No record found" sub="Check the roll number and try again." />
      )}

      {foundStudent && <StudentCard student={foundStudent} colMeta={colMeta} isMobile={isMobile} />}

      {!selectedSheet && !loading && (
        <EmptyState icon={<CalendarEmptySvg />} title="Pick a month to get started"
          sub={isMobile ? 'Tap the orange button below to choose a month.' : 'Select a month from the panel on the left.'} />
      )}

      {studentMap && hasData && !rollInput.trim() && !loading && (
        <EmptyState icon={<SearchX className="w-12 h-12 text-orange-300" />}
          title="Enter your roll number"
          sub={isMobile ? 'Type your roll number in the search box above.' : 'Type your roll number in the search box to view attendance.'} />
      )}
    </>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-stone-400 text-center px-4">
      {icon}
      <p className="text-sm font-medium mt-3 text-stone-500">{title}</p>
      <p className="text-xs mt-1 text-stone-400">{sub}</p>
    </div>
  );
}

function CalendarEmptySvg() {
  return (
    <svg className="w-12 h-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
