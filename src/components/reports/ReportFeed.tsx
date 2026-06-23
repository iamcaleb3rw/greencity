import { getReports } from '@/lib/actions/reports';
import { ReportCard } from './ReportCard';
import { FileX } from 'lucide-react';

export async function ReportFeed() {
  const reports = await getReports();

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <FileX className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">No active reports</p>
        <p className="text-xs text-gray-400 mt-1">Be the first to report a pollution incident</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 stagger-children">
      {reports.map((report, i) => (
        <ReportCard key={report.id} report={report} index={i} />
      ))}
    </div>
  );
}
