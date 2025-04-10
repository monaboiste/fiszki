-- Migration: Temporarily disable RLS policies
-- Description: Disables all RLS policies during development phase. IMPORTANT: Re-enable before production!
-- Author: AI Assistant
-- Date: 2024-03-20

-- WARNING: This is a development-only migration. These policies should be re-enabled before going to production!

-- Disable RLS on flashcards table
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can create their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;
alter table flashcards disable row level security;

-- Disable RLS on generations table
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can create generations for their flashcards" on generations;
alter table generations disable row level security;

-- Disable RLS on ai_generation_logs table
alter table ai_generation_logs disable row level security;

comment on table flashcards is 'WARNING: RLS policies temporarily disabled for development';
comment on table generations is 'WARNING: RLS policies temporarily disabled for development';
comment on table ai_generation_logs is 'WARNING: RLS policies temporarily disabled for development';