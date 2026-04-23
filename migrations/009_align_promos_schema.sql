-- ================================================================
-- Migration 009: Align promos table with database.types.ts
-- Renames columns and adds missing ones to match the application's
-- expected schema in lib/database.types.ts
-- ================================================================

-- Rename existing columns to match type definitions
ALTER TABLE promos RENAME COLUMN discount TO discount_value;
ALTER TABLE promos RENAME COLUMN max_uses TO usage_limit;

-- Add missing columns
ALTER TABLE promos ADD COLUMN IF NOT EXISTS minimum_order NUMERIC DEFAULT NULL;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS maximum_discount NUMERIC DEFAULT NULL;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;
ALTER TABLE promos ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'percentage';
