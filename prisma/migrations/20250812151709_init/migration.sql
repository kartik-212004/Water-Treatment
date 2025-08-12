-- CreateTable
CREATE TABLE "public"."leads" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "phone_number" BIGINT,
    "zip_code" TEXT NOT NULL,
    "pwsid" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contaminant_mapping" (
    "id" TEXT NOT NULL,
    "pws_id" TEXT NOT NULL,
    "zip_code" TEXT,
    "water_system_name" TEXT,
    "detected_patriots_count" INTEGER NOT NULL,
    "report_data" JSONB NOT NULL,
    "klaviyo_event_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contaminant_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_key" ON "public"."leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rateLimit_key_key" ON "public"."rateLimit"("key");
