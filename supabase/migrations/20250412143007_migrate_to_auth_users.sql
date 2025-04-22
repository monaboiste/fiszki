-- Migration: Drop users table
-- Description: Replace users table with auth.users
-- Author: AI Assistant
-- Date: 2025-04-15

drop policy if exists "Users can create their own generations" on generations;

alter table flashcards drop constraint if exists flashcards_user_id_fkey;
alter table generations drop constraint if exists generations_user_id_fkey;
alter table ai_generation_logs drop constraint if exists ai_generation_logs_user_id_fkey;

drop table if exists users cascade;

alter table flashcards alter column user_id type uuid using null;
alter table generations alter column user_id type uuid using null;

alter table flashcards add constraint flashcards_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
alter table generations add constraint generations_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;