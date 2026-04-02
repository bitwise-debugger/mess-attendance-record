import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-500">
      <Loader2 className="animate-spin w-10 h-10 mb-3 text-orange-500" />
      <p className="text-sm">Fetching attendance data...</p>
    </div>
  );
}
