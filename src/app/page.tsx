import { Suspense } from 'react';
import Link from 'next/link';
import { getReports } from '@/lib/actions/reports';
import { getDistrictMetrics } from '@/lib/actions/districts';
import { ReportFeed } from '@/components/reports/ReportFeed';
import { AnalyticsCards } from '@/components/dashboard/AnalyticsCards';
import { AnalyticsSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import dynamic from 'next/dynamic';
import { MapSkeleton } from '@/components/ui/Skeleton';
import { Leaf, Plus, Shield, MapIcon } from 'lucide-react';
import type * as L from 'leaflet';
import PollutionMap from '@/components/map/PollutionMap';




export const revalidate = 30;

export default async function HomePage() {
  const [reports, districtMetrics] = await Promise.all([
    getReports(),
    getDistrictMetrics(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">KigaliClean</span>
            <span className="hidden sm:block text-xs text-gray-400 font-normal">Pollution Tracker</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Report Incident
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white px-4 sm:px-6 py-5">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Kigali Pollution Tracker
              </h1>
              <p className="text-forest-300 text-xs mt-0.5">
                Community-driven illegal dumping surveillance across Gasabo, Kicukiro & Nyarugenge
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-right">
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-forest-400 text-xs">Active reports</p>
              </div>
              <div className="w-px h-10 bg-forest-700" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-forest-400 text-xs">Districts monitored</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main split layout ── */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full">

          {/* LEFT — Feed + Analytics */}
          <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 space-y-5">
            {/* Analytics */}
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Overview</h2>
              <Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsCards />
              </Suspense>
            </section>

            {/* District rank */}
            {districtMetrics.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">District Rankings</h2>
                <div className="space-y-2">
                  {districtMetrics.map((d, i) => (
                    <div key={d.district} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{d.district}</span>
                          <span className="text-xs text-gray-400">{d.reportCount} report{d.reportCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(d.avgSeverity / 5) * 100}%`,
                              background: `linear-gradient(90deg, #FED976, #800026)`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Avg severity {d.avgSeverity.toFixed(1)}/5</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Feed */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Reports</h2>
                <Link href="/submit" className="text-xs text-forest-600 hover:text-forest-700 font-medium transition-colors">
                  + New report
                </Link>
              </div>
              <Suspense fallback={
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
              }>
                <ReportFeed />
              </Suspense>
            </section>
          </div>

          {/* RIGHT — Sticky map */}
          <div className="flex-1 lg:sticky lg:top-20 lg:h-[calc(100vh-88px)]">
            <div className="flex items-center gap-2 mb-3">
              <MapIcon className="w-3.5 h-3.5 text-gray-400" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Map</h2>
              <div className="flex items-center gap-3 ml-auto text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 opacity-80" />
                  District pollution
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gray-900" />
                  Incidents
                </span>
              </div>
            </div>
            <PollutionMap reports={reports} districtMetrics={districtMetrics} />
          </div>
        </div>
      </div>
    </div>
  );
}
