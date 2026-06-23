CREATE TYPE "public"."status" AS ENUM('Reported', 'In Progress', 'Cleaned Up', 'Archived');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"waste_type" varchar(50) NOT NULL,
	"severity_level" integer NOT NULL,
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"nearest_landmark" varchar(255),
	"district_name" varchar(100) NOT NULL,
	"image_url" text,
	"reported_by" varchar(100) DEFAULT 'Anonymous',
	"status" "status" DEFAULT 'Reported' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"previous_status" "status",
	"new_status" "status" NOT NULL,
	"updated_by" varchar(100) NOT NULL,
	"notes" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "status_logs" ADD CONSTRAINT "status_logs_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;