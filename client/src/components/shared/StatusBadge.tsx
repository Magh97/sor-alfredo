import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted';
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#6B1A2A]/15 text-[#6B1A2A] border-[#6B1A2A]/30',
  success: 'bg-[#2D4A22]/15 text-[#2D4A22] border-[#2D4A22]/30',
  warning: 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/30',
  error: 'bg-[#8B1A1A]/15 text-[#8B1A1A] border-[#8B1A1A]/30',
  info: 'bg-[#3A5068]/15 text-[#3A5068] border-[#3A5068]/30',
  muted: 'bg-[#8B7355]/15 text-[#8B7355] border-[#8B7355]/30',
};

export function StatusBadge({ label, variant = 'primary' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block border-2 px-3 py-0.5 font-[\'DM_Sans\'] font-bold text-xs uppercase tracking-[0.1em]',
        variantStyles[variant],
      )}
    >
      {label}
    </span>
  );
}
