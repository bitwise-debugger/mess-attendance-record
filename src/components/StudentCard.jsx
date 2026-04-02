import { User, Home, BedDouble, UtensilsCrossed } from 'lucide-react';
import { parseMealSummary } from '../utils/helpers';

export default function StudentCard({ student }) {
  const { mealCount, messbill, arrears, grossTotal, collection, pending } = parseMealSummary(student);

  const name   = student['Name']    || '—';
  const rollNo = student['Roll No.'] || '—';
  const room   = student['Room #']  || '—';
  const hostel = student['Hostel']  || '—';

  return (
    <div className="w-full rounded-2xl border border-orange-100 bg-white shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 px-5 py-4">
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

      {/* Info Grid */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-orange-50">
        <InfoItem icon={<BedDouble className="w-4 h-4" />} label="Room" value={room} />
        <InfoItem icon={<Home className="w-4 h-4" />} label="Hostel" value={hostel} />
      </div>

      {/* Meal Summary */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          Mess Summary
        </p>
        <div className="grid grid-cols-3 gap-2">
          <SummaryBadge label="Meal Count"  value={mealCount}  color="bg-amber-50 text-amber-800 border-amber-200" />
          <SummaryBadge label="Mess Bill"   value={`₨ ${messbill}`}  color="bg-orange-50 text-orange-800 border-orange-200" />
          <SummaryBadge label="Pending"     value={`₨ ${pending}`}   color="bg-red-50 text-red-700 border-red-200" />
          <SummaryBadge label="Arrears"     value={`₨ ${arrears}`}   color="bg-yellow-50 text-yellow-800 border-yellow-200" />
          <SummaryBadge label="Gross Total" value={`₨ ${grossTotal}`} color="bg-stone-50 text-stone-700 border-stone-200" />
          <SummaryBadge label="Collection"  value={`₨ ${collection}`} color="bg-green-50 text-green-700 border-green-200" />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-orange-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function SummaryBadge({ label, value, color }) {
  return (
    <div className={`rounded-xl border px-2 py-2.5 text-center ${color}`}>
      <p className="text-sm font-bold leading-none">{value}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  );
}
