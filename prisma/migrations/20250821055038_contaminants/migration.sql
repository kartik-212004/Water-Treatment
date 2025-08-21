/*
  Warnings:

  - You are about to drop the `Contaminant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Contaminant";

-- CreateTable
CREATE TABLE "public"."contaminant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "removalRate" TEXT NOT NULL,
    "healthRisk" TEXT NOT NULL,

    CONSTRAINT "contaminant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contaminant_name_key" ON "public"."contaminant"("name");
