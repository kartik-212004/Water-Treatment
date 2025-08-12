-- Add created_at column and unique composite constraint to contaminant_mapping
ALTER TABLE "public"."contaminant_mapping" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW();
-- Create unique index (will fail if duplicates exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'contaminant_mapping_pws_id_zip_code_key'
    ) THEN
        CREATE UNIQUE INDEX "contaminant_mapping_pws_id_zip_code_key" ON "public"."contaminant_mapping" ("pws_id", "zip_code");
    END IF;
END $$;
