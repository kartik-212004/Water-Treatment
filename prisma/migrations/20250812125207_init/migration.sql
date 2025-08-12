/*
  Warnings:

  - You are about to drop the column `health_guideline_ppb` on the `contaminant_mapping` table. All the data in the column will be lost.
  - You are about to drop the column `health_risk_blurb` on the `contaminant_mapping` table. All the data in the column will be lost.
  - You are about to drop the column `legal_limit_ppb` on the `contaminant_mapping` table. All the data in the column will be lost.
  - You are about to drop the column `patriot_name` on the `contaminant_mapping` table. All the data in the column will be lost.
  - You are about to drop the column `removal_percentage` on the `contaminant_mapping` table. All the data in the column will be lost.
  - You are about to drop the column `wqp_characteristic_name` on the `contaminant_mapping` table. All the data in the column will be lost.
  - You are about to drop the `water_reports` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `detected_patriots_count` to the `contaminant_mapping` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pws_id` to the `contaminant_mapping` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_data` to the `contaminant_mapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."contaminant_mapping" DROP COLUMN "health_guideline_ppb",
DROP COLUMN "health_risk_blurb",
DROP COLUMN "legal_limit_ppb",
DROP COLUMN "patriot_name",
DROP COLUMN "removal_percentage",
DROP COLUMN "wqp_characteristic_name",
ADD COLUMN     "detected_patriots_count" INTEGER NOT NULL,
ADD COLUMN     "klaviyo_event_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pws_id" TEXT NOT NULL,
ADD COLUMN     "report_data" JSONB NOT NULL,
ADD COLUMN     "water_system_name" TEXT,
ADD COLUMN     "zip_code" TEXT;

-- DropTable
DROP TABLE "public"."water_reports";
