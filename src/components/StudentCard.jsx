import { useState } from 'react';
import { User, Home, BedDouble, UtensilsCrossed, Coffee, Moon, Receipt, ChevronDown } from 'lucide-react';
import { parseMealCount, parseDailyAttendance, buildCalendarGrid, DAY_LABELS } from '../utils/helpers';

export default function StudentCard({ student, colMeta }) {
  const name   = student['Name']     || '—';
  const rollNo = student['Roll No.'] || '—';
  const room   = student['Room #']   || '—';
  const hostel = student['Hostel']   || '—';

  // ── Meal count summary ──────────────────────────────────────────────
  const { bl, d, total } = parseMealCount(student['Meal Count']);

  // ── Bill fields — col indices confirmed from CSV ────────────────────
  // col 6  = Heads       → total mess bill (always populated)
  // col 7  = Mess Bill   → may be empty in some sheets
  // col 8  = Arrears with Fine
  // col 9  = Gross Total
  // col 10 = Collection
  // col 11 = Pending
  const heads    = student['Heads']              || '';
  const messBill = student['Mess Bill']          || '';
  const arrears  = student['Arrears with Fine']  || '';
  const gross    = student['Gross Total']        || '';
  const collected= student['Collection']         || '';
  const pending  = student['Pending']            || '';

  // ── Per-day attendance with prices ─────────────────────────────────
  const days     = parseDailyAttendance(student._raw || [], colMeta);
  const calendar = buildCalendarGrid(days);

  return (
    <div className="w-full rounded-2xl border border-orange-100 bg-white shadow-md overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-orange-500 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg leading-tight">{name}</p>
            <p className="text-orange-100 text-sm">{rollNo}</p>
          </div>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-orange-50">
        <InfoItem icon={<BedDouble className="w-4 h-4" />} label="Room"   value={room} />
        <InfoItem icon={<Home      className="w-4 h-4" />} label="Hostel" value={hostel} />
      </div>

      {/* ── Meal count summary ── */}
      <div className="px-5 py-4 border-b border-orange-50">
        <SectionLabel icon={<UtensilsCrossed className="w-3.5 h-3.5" />} text="Meal Summary" />
        <div className="grid grid-cols-3 gap-2 mt-3">
          <MealBadge icon={<Coffee className="w-4 h-4" />}           label="Breakfast / Lunch" count={bl}    color="bg-amber-50 text-amber-800 border-amber-200" />
          <MealBadge icon={<Moon   className="w-4 h-4" />}           label="Dinner"            count={d}     color="bg-blue-50 text-blue-800 border-blue-200" />
          <MealBadge icon={<UtensilsCrossed className="w-4 h-4" />}  label="Total Meals"       count={total} color="bg-orange-50 text-orange-800 border-orange-200" highlight />
        </div>
      </div>

      {/* ── Bill details ── */}
      <div className="px-5 py-4 border-b border-orange-50">
        <SectionLabel icon={<Receipt className="w-3.5 h-3.5" />} text="Mess Bill" />
        <div className="mt-3 space-y-2">
          <BillRow label="Total Mess Bill"     value={heads}     bold />
          {messBill  && <BillRow label="Mess Bill"          value={messBill} />}
          {arrears   && <BillRow label="Arrears with Fine"  value={arrears}  warn />}
          {gross     && <BillRow label="Gross Total"        value={gross} />}
          {collected && <BillRow label="Collection"         value={collected} />}
          {pending   && <BillRow label="Pending"            value={pending}  warn />}
          {!heads && !messBill && !arrears && !gross && !collected && !pending && (
            <p className="text-xs text-stone-400 italic">Bill details not available for this month.</p>
          )}
        </div>
      </div>

      {/* ── Attendance Calendar ── */}
      {calendar.length > 0 && (
        <div className="px-5 py-4">
          <SectionLabel icon={<UtensilsCrossed className="w-3.5 h-3.5" />} text="Attendance Calendar" />

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 mb-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />B/L</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />Dinner</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" />Both</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-stone-200 inline-block" />Absent</span>
          </div>

          <div className="space-y-3">
            {calendar.map(({ monthLabel, weeks }, idx) => (
              <CollapsibleMonth
                key={monthLabel}
                monthLabel={monthLabel}
                weeks={weeks}
                defaultOpen={idx === 0}
                showLabel={calendar.length > 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Collapsible month section ───────────────────────────────────────── */
function CollapsibleMonth({ monthLabel, weeks, defaultOpen, showLabel }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-stone-100 overflow-hidden">
      {/* Always show the toggle header when there are multiple months,
          but also show it for single-month so the calendar feels contained */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-stone-50 hover:bg-orange-50 transition"
      >
        <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
          {monthLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-2 space-y-1">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((lbl) => (
              <div key={lbl} className="text-center text-xs font-medium text-stone-400">{lbl}</div>
            ))}
          </div>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((cell, ci) =>
                cell === null
                  ? <div key={ci} />
                  : <CalendarCell key={cell.date} cell={cell} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Calendar cell ───────────────────────────────────────────────────── */
function CalendarCell({ cell }) {
  const { date, blPrice, dPrice, cost } = cell;
  const dayNum = date.split('-')[0];
  const hadBL  = blPrice > 0;
  const hadD   = dPrice  > 0;

  let bg, dotRow;
  if (hadBL && hadD) {
    bg     = 'bg-orange-100 border-orange-300';
    dotRow = <><Dot color="bg-amber-400" /><Dot color="bg-blue-400" /></>;
  } else if (hadBL) {
    bg     = 'bg-amber-50 border-amber-200';
    dotRow = <Dot color="bg-amber-400" />;
  } else if (hadD) {
    bg     = 'bg-blue-50 border-blue-200';
    dotRow = <Dot color="bg-blue-400" />;
  } else {
    bg     = 'bg-stone-50 border-stone-100';
    dotRow = null;
  }

  return (
    <div className={`rounded-lg border ${bg} flex flex-col items-center pt-1.5 pb-1 gap-0.5 min-h-[52px]`}>
      <span className="text-xs font-semibold text-stone-600 leading-none">{dayNum}</span>
      <div className="flex gap-0.5 my-0.5">
        {dotRow ?? <span className="w-2 h-2" />}
      </div>
      {cost > 0 && (
        <span className="text-[9px] font-medium text-stone-500 leading-none">₨{cost}</span>
      )}
    </div>
  );
}

function Dot({ color }) {
  return <span className={`w-2 h-2 rounded-full ${color}`} />;
}

/* ── Shared sub-components ───────────────────────────────────────────── */
function SectionLabel({ icon, text }) {
  return (
    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
      {icon}{text}
    </p>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-orange-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className="text-sm font-medium text-stone-700">{value}</p>
      </div>
    </div>
  );
}

function MealBadge({ icon, label, count, color, highlight }) {
  return (
    <div className={`rounded-xl border px-3 py-3 text-center ${color} ${highlight ? 'ring-1 ring-orange-300' : ''}`}>
      <div className="flex justify-center mb-1 opacity-70">{icon}</div>
      <p className="text-2xl font-bold leading-none">{count}</p>
      <p className="text-xs mt-1 opacity-70 leading-tight">{label}</p>
    </div>
  );
}

function BillRow({ label, value, bold, warn }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-100 px-4 py-2">
      <span className={`text-xs ${warn ? 'text-red-500' : 'text-stone-500'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-stone-800' : warn ? 'font-semibold text-red-600' : 'font-medium text-stone-700'}`}>
        ₨ {value}
      </span>
    </div>
  );
}
