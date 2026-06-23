import Link from 'next/link';
import type { Report } from '@/db/schema';
import { Badge } from '@/components/ui/Badge';
import { getSeverityLabel, getSeverityColor, formatRelativeTime } from '@/lib/utils';
import { MapPin, AlertTriangle, Trash2 } from 'lucide-react';

const wasteIcons: Record<string, string> = {
  'Plastic': '🧴', 'E-Waste': '💻', 'Organic': '🍂',
  'Chemical': '⚗️', 'Construction': '🏗️', 'Mixed': '🗑️', 'Other': '📦',
};

export function ReportCard({ report, index = 0 }: { report: Report; index?: number }) {
  const severityColor = getSeverityColor(report.severityLevel);
  const wasteIcon = wasteIcons[report.wasteType] ?? '🗑️';

  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-xl shrink-0 mt-0.5">{wasteIcon}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-forest-700 transition-colors line-clamp-2">
              {report.title}
            </h3>
            {report.nearestLandmark && (
              <p className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {report.nearestLandmark}
              </p>
            )}
          </div>
        </div>
        <Badge label={report.status} variant="status" dot className="shrink-0" />
      </div>

      {/* Description */}
      {report.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {report.description}
        </p>
      )}

      {/* Image thumbnail */}
      {report.imageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden h-28">
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center gap-2">
          {/* Severity indicator */}
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" style={{ color: severityColor }} />
            <span className="text-xs font-medium" style={{ color: severityColor }}>
              {getSeverityLabel(report.severityLevel)}
            </span>
          </div>
          <span className="text-gray-200">|</span>
          <span className="text-xs text-gray-400">{report.districtName}</span>
        </div>
        <span className="text-xs text-gray-400">{formatRelativeTime(report.createdAt)}</span>
      </div>

      {/* Severity bar */}
      <div className="mt-2 h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(report.severityLevel / 5) * 100}%`, background: severityColor }}
        />
      </div>
    </Link>
  );
}
