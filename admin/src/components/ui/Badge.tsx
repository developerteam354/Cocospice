interface BadgeProps {
  variant: 'green' | 'orange' | 'amber' | 'red' | 'slate';
  children: React.ReactNode;
}

const styles: Record<BadgeProps['variant'], string> = {
  green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  amber:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  red:    'bg-red-500/15 text-red-400 border-red-500/20',
  slate:  'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
