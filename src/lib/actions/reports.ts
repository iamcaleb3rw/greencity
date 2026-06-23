'use server';

import { db } from '@/db';
import { reports, statusLogs, type NewReport, type Status } from '@/db/schema';
import { eq, ne, avg, count, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().optional(),
  wasteType: z.enum(['Plastic', 'E-Waste', 'Organic', 'Chemical', 'Construction', 'Mixed', 'Other']),
  severityLevel: z.number().int().min(1).max(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  nearestLandmark: z.string().optional(),
  districtName: z.string().min(1, 'District is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  reportedBy: z.string().optional().default('Anonymous'),
});

export type ReportFormData = z.infer<typeof ReportSchema>;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createReport(formData: ReportFormData): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = ReportSchema.parse(formData);
    const [report] = await db.insert(reports).values({
      title: validated.title,
      description: validated.description ?? null,
      wasteType: validated.wasteType,
      severityLevel: validated.severityLevel,
      latitude: String(validated.latitude),
      longitude: String(validated.longitude),
      nearestLandmark: validated.nearestLandmark ?? null,
      districtName: validated.districtName,
      imageUrl: validated.imageUrl || null,
      reportedBy: validated.reportedBy ?? 'Anonymous',
      status: 'Reported',
    } satisfies NewReport).returning({ id: reports.id });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, data: { id: report.id } };
  } catch (err) {
    console.error('[createReport]', err);
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    return { success: false, error: 'Failed to submit report. Please try again.' };
  }
}

// ─── READ ─────────────────────────────────────────────────────────────────────
export async function getReports(includeArchived = false) {
  try {
    if (!includeArchived) {
      return await db.select().from(reports).where(ne(reports.status, 'Archived')).orderBy(sql`${reports.createdAt} DESC`);
    }
    return await db.select().from(reports).orderBy(sql`${reports.createdAt} DESC`);
  } catch (err) {
    console.error('[getReports]', err);
    return [];
  }
}

export async function getReportById(id: string) {
  try {
    return await db.query.reports.findFirst({
      where: eq(reports.id, id),
      with: { logs: { orderBy: sql`${statusLogs.changedAt} DESC` } },
    }) ?? null;
  } catch (err) {
    console.error('[getReportById]', err);
    return null;
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateReportStatus(
  id: string,
  newStatus: Status,
  adminNotes?: string,
  adminToken?: string
): Promise<ActionResult> {
  if (adminToken !== process.env.ADMIN_SECRET) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Get current status
    const existing = await db
      .select({ status: reports.status })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!existing[0]) {
      return { success: false, error: 'Report not found' };
    }

    const previousStatus = existing[0].status;

    // 2. Update report (NO transaction)
    await db
      .update(reports)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id));

    // 3. Insert status log (separate query)
    await db.insert(statusLogs).values({
      reportId: id,
      previousStatus,
      newStatus,
      updatedBy: 'Admin',
      notes: adminNotes ?? null,
    });

    // 4. Revalidate UI
    revalidatePath('/');
    revalidatePath(`/reports/${id}`);
    revalidatePath('/admin');

    return { success: true, data: undefined };
  } catch (err) {
    console.error('[updateReportStatus]', err);
    return { success: false, error: 'Failed to update status.' };
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteReport(id: string, adminToken?: string): Promise<ActionResult> {
  if (adminToken !== process.env.ADMIN_SECRET) return { success: false, error: 'Unauthorized' };
  try {
    await db.delete(reports).where(eq(reports.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, data: undefined };
  } catch (err) {
    console.error('[deleteReport]', err);
    return { success: false, error: 'Failed to delete report.' };
  }
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export async function getAnalytics() {
  try {
    const [totalResult] = await db.select({ count: count() }).from(reports);
    const byStatus = await db.select({ status: reports.status, count: count() }).from(reports).groupBy(reports.status);
    const [avgResult] = await db.select({ avg: avg(reports.severityLevel) }).from(reports);
    return {
      total: totalResult.count,
      byStatus: byStatus as { status: Status; count: number }[],
      avgSeverity: Number(avgResult.avg ?? 0),
    };
  } catch (err) {
    console.error('[getAnalytics]', err);
    return { total: 0, byStatus: [], avgSeverity: 0 };
  }
}
