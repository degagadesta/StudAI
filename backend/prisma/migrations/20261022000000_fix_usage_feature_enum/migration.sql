-- AlterEnum: Update UsageFeature enum to use plural forms
-- This updates the enum values from singular to plural to match config

-- Rename existing enum values
ALTER TYPE "UsageFeature" RENAME VALUE 'CHAT_MESSAGE' TO 'CHAT_MESSAGES';
ALTER TYPE "UsageFeature" RENAME VALUE 'PDF_UPLOAD' TO 'PDF_UPLOADS';
