-- Migration: Update AI generation logs table
-- Description: Makes generation_id nullable and removes foreign key constraint
-- Author: AI Assistant
-- Date: 2025-04-12

-- Drop the existing foreign key constraint
alter table ai_generation_logs
drop constraint ai_generation_logs_generation_id_fkey;

-- Make generation_id nullable without foreign key
alter table ai_generation_logs
alter column generation_id drop not null;