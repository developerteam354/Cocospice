import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'red' | 'slate';
  loading?: boolean;
}

const colorMap = {
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400', value: 'text-indigo-300' },
  emerald:{ bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', value: 'text-emerald-300' },
  red:    { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400', value: 'text-red-300' },
  slate:  { bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: 'text-slate-400', value: 'text-slate-300' },
};

export default function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm p-5 flex items-center gap-4`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${c.border} bg-white/5`}>
        <Icon size={22} className={c.icon} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        {loading ? (
          <div className="mt-1 h-6 w-16 animate-pulse rounded bg-white/10" />
        ) : (
          <p className={`text-2xl font-bold ${c.value}`}>{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
