import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getReportById } from '@/lib/actions/reports';
import { Badge } from '@/components/ui/Badge';
import { getSeverityLabel, getSeverityColor, formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, MapPin, Calendar, User, AlertTriangle, Leaf } from 'lucide-react';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);
  if (!report) return { title: 'Report Not Found — KigaliClean' };
  return { title: `${report.title} — KigaliClean`, description: report.description ?? undefined };
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const report = await getReportById(id);
  if (!report) notFound();

  const sevColor = getSeverityColor(report.severityLevel);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-gray-200">|</span>
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-forest-600 rounded-md flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">KigaliClean</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Image */}
        {report.imageUrl && (
          <div className="w-full h-56 rounded-3xl overflow-hidden shadow-md animate-fade-in">
            <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[var(--shadow-card)] p-6 space-y-5 animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{report.title}</h1>
            <Badge label={report.status} variant="status" dot className="shrink-0" />
          </div>

          {/* Meta grid */}
          <dl className="grid grid-cols-2 gap-3">
            {[
              { icon: <MapPin className="w-3.5 h-3.5" />, label: 'District', val: report.districtName },
              { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Reported', val: formatRelativeTime(report.createdAt) },
              { icon: <User className="w-3.5 h-3.5" />, label: 'Reporter', val: report.reportedBy ?? 'Anonymous' },
              { icon: <AlertTriangle className="w-3.5 h-3.5" style={{ color: sevColor }} />, label: 'Severity', val: `${getSeverityLabel(report.severityLevel)} (${report.severityLevel}/5)` },
            ].map(({ icon, label, val }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1">{icon}<span className="text-xs">{label}</span></div>
                <p className="text-sm font-semibold text-gray-900">{val}</p>
              </div>
            ))}
          </dl>

          {/* Waste type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Waste type:</span>
            <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{report.wasteType}</span>
          </div>

          {/* Landmark */}
          {report.nearestLandmark && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>{report.nearestLandmark}</span>
            </div>
          )}

          {/* Description */}
          {report.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
            </div>
          )}

          {/* Coordinates */}
          <div className="font-mono text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
            📍 {Number(report.latitude).toFixed(6)}, {Number(report.longitude).toFixed(6)}
          </div>
        </div>

        {/* Status Timeline */}
        {report.logs && report.logs.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[var(--shadow-card)] p-6 animate-fade-in">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Status History</h2>
            <div className="relative space-y-4">
              {report.logs.map((log, i) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">{i + 1}</span>
                    </div>
                    {i < report.logs.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      {log.previousStatus && (
                        <Badge label={log.previousStatus} variant="status" className="text-[10px]" />
                      )}
                      {log.previousStatus && <span className="text-gray-300 text-xs">→</span>}
                      <Badge label={log.newStatus} variant="status" />
                    </div>
                    {log.notes && <p className="text-xs text-gray-500 mt-1">{log.notes}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">
                      {log.updatedBy} · {formatRelativeTime(log.changedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
