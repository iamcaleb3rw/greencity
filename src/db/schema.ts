import { pgTable, uuid, varchar, text, integer, decimal, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['Reported', 'In Progress', 'Cleaned Up', 'Archived']);

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  wasteType: varchar('waste_type', { length: 50 }).notNull(),
  severityLevel: integer('severity_level').notNull(),
  latitude: decimal('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: decimal('longitude', { precision: 9, scale: 6 }).notNull(),
  nearestLandmark: varchar('nearest_landmark', { length: 255 }),
  districtName: varchar('district_name', { length: 100 }).notNull(),
  imageUrl: text('image_url'),
  reportedBy: varchar('reported_by', { length: 100 }).default('Anonymous'),
  status: statusEnum('status').default('Reported').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const statusLogs = pgTable('status_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  previousStatus: statusEnum('previous_status'),
  newStatus: statusEnum('new_status').notNull(),
  updatedBy: varchar('updated_by', { length: 100 }).notNull(),
  notes: text('notes'),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reportsRelations = relations(reports, ({ many }) => ({
  logs: many(statusLogs),
}));

export const statusLogsRelations = relations(statusLogs, ({ one }) => ({
  report: one(reports, { fields: [statusLogs.reportId], references: [reports.id] }),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type StatusLog = typeof statusLogs.$inferSelect;
export type NewStatusLog = typeof statusLogs.$inferInsert;
export type Status = 'Reported' | 'In Progress' | 'Cleaned Up' | 'Archived';
export type WasteType = 'Plastic' | 'E-Waste' | 'Organic' | 'Chemical' | 'Construction' | 'Mixed' | 'Other';
