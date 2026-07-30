import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'card' | 'row' | 'kds';
  className?: string;
}

export function Skeleton({ variant = 'row', className }: SkeletonProps) {
  const heights: Record<string, string> = {
    card: 'h-36',
    row: 'h-14',
    kds: 'h-72',
  };

  return (
    <div
      className={cn(
        heights[variant] ?? 'h-14',
        'skeleton-shimmer animate-shimmer rounded-none',
        className,
      )}
    />
  );
}
