-- Migration: Create AI generation logs table
-- Description: Creates the ai_generation_logs table with RLS policies
-- Author: AI Assistant
-- Date: 2024-03-20

-- Create ai_generation_logs table
create table ai_generation_logs (
    log_id bigserial primary key,
    generation_id bigint not null references generations(generation_id) on delete cascade,
    logged_at timestamptz not null default now(),
    error_code varchar(50) not null,
    error_description text not null
);

-- Create index on generation_id for faster access
create index ai_generation_logs_generation_id_idx on ai_generation_logs(generation_id);

-- Enable Row Level Security
alter table ai_generation_logs enable row level security;

-- Create RLS Policies

-- Select policy for authenticated users
create policy "Users can view their own generation logs"
    on ai_generation_logs
    for select
    to authenticated
    using (exists (
        select 1 from generations
        join flashcards on flashcards.flashcard_id = generations.flashcard_id
        where generations.generation_id = ai_generation_logs.generation_id
        and flashcards.user_id::text = auth.uid()::text
    ));

-- Insert policy for authenticated users
create policy "Users can create logs for their generations"
    on ai_generation_logs
    for insert
    to authenticated
    with check (exists (
        select 1 from generations
        join flashcards on flashcards.flashcard_id = generations.flashcard_id
        where generations.generation_id = ai_generation_logs.generation_id
        and flashcards.user_id::text = auth.uid()::text
    ));