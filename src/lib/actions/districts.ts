'use server';

import { db } from '@/db';
import { reports } from '@/db/schema';
import { avg, count, sql } from 'drizzle-orm';

export type DistrictMetric = {
  district: string;
  avgSeverity: number;
  reportCount: number;
};

export async function getDistrictMetrics(): Promise<DistrictMetric[]> {
  try {
    const results = await db
      .select({
        district: reports.districtName,
        avgSeverity: avg(reports.severityLevel),
        reportCount: count(),
      })
      .from(reports)
      .groupBy(reports.districtName)
      .orderBy(sql`avg(${reports.severityLevel}) DESC`);

    return results.map((r) => ({
      district: r.district,
      avgSeverity: Number(r.avgSeverity ?? 0),
      reportCount: r.reportCount,
    }));
  } catch (err) {
    console.error('[getDistrictMetrics]', err);
    return [];
  }
}
