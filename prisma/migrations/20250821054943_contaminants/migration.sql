-- CreateTable
CREATE TABLE "public"."Contaminant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "removalRate" TEXT NOT NULL,
    "healthRisk" TEXT NOT NULL,

    CONSTRAINT "Contaminant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contaminant_name_key" ON "public"."Contaminant"("name");
