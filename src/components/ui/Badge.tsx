import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'waste' | 'severity' | 'default';
  className?: string;
  dot?: boolean;
}

const statusStyles: Record<string, string> = {
  'Reported': 'bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100',
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200 ring-1 ring-blue-100',
  'Cleaned Up': 'bg-green-50 text-green-700 border border-green-200 ring-1 ring-green-100',
  'Archived': 'bg-gray-50 text-gray-500 border border-gray-200',
};

const dotColors: Record<string, string> = {
  'Reported': 'bg-amber-400',
  'In Progress': 'bg-blue-400',
  'Cleaned Up': 'bg-green-400',
  'Archived': 'bg-gray-400',
};

export function Badge({ label, variant = 'default', className, dot }: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium';

  if (variant === 'status') {
    return (
      <span className={cn(baseClasses, statusStyles[label] ?? 'bg-gray-50 text-gray-500 border border-gray-200', className)}>
        {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse-dot', dotColors[label] ?? 'bg-gray-400')} />}
        {label}
      </span>
    );
  }

  return (
    <span className={cn(baseClasses, 'bg-gray-100 text-gray-600', className)}>
      {label}
    </span>
  );
}
