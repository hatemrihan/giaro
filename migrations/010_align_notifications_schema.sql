-- ================================================================
-- Migration 010: Align notifications table with database.types.ts
-- Renames metadata->data and adds missing title column
-- ================================================================

ALTER TABLE notifications RENAME COLUMN metadata TO data;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
