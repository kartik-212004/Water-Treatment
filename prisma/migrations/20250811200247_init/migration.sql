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
    "patriot_name" TEXT NOT NULL,
    "wqp_characteristic_name" TEXT NOT NULL,
    "removal_percentage" TEXT NOT NULL,
    "health_risk_blurb" TEXT NOT NULL,
    "health_guideline_ppb" DOUBLE PRECISION NOT NULL,
    "legal_limit_ppb" DOUBLE PRECISION NOT NULL,

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
