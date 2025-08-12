-- CreateTable
CREATE TABLE "public"."water_reports" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pws_id" TEXT NOT NULL,
    "zip_code" TEXT,
    "water_system_name" TEXT,
    "detected_patriots_count" INTEGER NOT NULL,
    "report_data" JSONB NOT NULL,
    "klaviyo_event_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "water_reports_pkey" PRIMARY KEY ("id")
);
