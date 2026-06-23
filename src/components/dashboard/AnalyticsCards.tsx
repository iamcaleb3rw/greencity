import { getAnalytics } from '@/lib/actions/reports';
import { getDistrictMetrics } from '@/lib/actions/districts';
import { TrendingUp, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { getSeverityLabel } from '@/lib/utils';

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[var(--shadow-card)] animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: (color ?? '#22c55e') + '15' }}>
          <span style={{ color: color ?? '#22c55e' }}>{icon}</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export async function AnalyticsCards() {
  const [analytics, districtMetrics] = await Promise.all([getAnalytics(), getDistrictMetrics()]);

  const activeCount = analytics.byStatus
    .filter(s => s.status !== 'Archived')
    .reduce((a, b) => a + Number(b.count), 0);

  const cleanedCount = analytics.byStatus.find(s => s.status === 'Cleaned Up')?.count ?? 0;
  const topDistrict = districtMetrics[0];

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        label="Total Reports"
        value={analytics.total}
        sub="All time"
        color="#6366f1"
      />
      <StatCard
        icon={<AlertCircle className="w-3.5 h-3.5" />}
        label="Active Incidents"
        value={activeCount}
        sub="Needs attention"
        color="#f59e0b"
      />
      <StatCard
        icon={<CheckCircle className="w-3.5 h-3.5" />}
        label="Cleaned Up"
        value={cleanedCount}
        sub="Resolved"
        color="#22c55e"
      />
      <StatCard
        icon={<MapPin className="w-3.5 h-3.5" />}
        label="Most Polluted"
        value={topDistrict?.district ?? '—'}
        sub={topDistrict ? `Avg severity ${topDistrict.avgSeverity.toFixed(1)}` : 'No data'}
        color="#ef4444"
      />
    </div>
  );
}
