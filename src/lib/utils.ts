import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeverityLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Minimal', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Critical',
  };
  return labels[level] ?? 'Unknown';
}

export function getSeverityColor(level: number): string {
  const colors: Record<number, string> = {
    1: '#22c55e', 2: '#84cc16', 3: '#f59e0b', 4: '#ef4444', 5: '#7f1d1d',
  };
  return colors[level] ?? '#6b7280';
}

export function getChoroplethColor(avgSeverity: number): string {
  if (avgSeverity <= 1.5) return '#FFEDA0';
  if (avgSeverity <= 2.5) return '#FED976';
  if (avgSeverity <= 3.0) return '#FEB24C';
  if (avgSeverity <= 3.5) return '#FD8D3C';
  if (avgSeverity <= 4.0) return '#FC4E2A';
  if (avgSeverity <= 4.5) return '#E31A1C';
  return '#800026';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Reported': '#f59e0b',
    'In Progress': '#3b82f6',
    'Cleaned Up': '#22c55e',
    'Archived': '#9ca3af',
  };
  return colors[status] ?? '#6b7280';
}

export function getStatusBg(status: string): string {
  const colors: Record<string, string> = {
    'Reported': 'bg-amber-50 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Cleaned Up': 'bg-green-50 text-green-700 border-green-200',
    'Archived': 'bg-gray-50 text-gray-500 border-gray-200',
  };
  return colors[status] ?? 'bg-gray-50 text-gray-500 border-gray-200';
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
