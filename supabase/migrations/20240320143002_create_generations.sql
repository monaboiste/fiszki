-- Migration: Create generations table
-- Description: Creates the generations table with RLS policies
-- Author: AI Assistant
-- Date: 2024-03-20

-- Create generations table
create table generations (
    generation_id bigserial primary key,
    flashcard_id bigint not null references flashcards(flashcard_id) on delete cascade,
    generation_duration_ms integer not null check (generation_duration_ms >= 0),
    input_text varchar(10000) not null,
    accepted boolean not null default false,
    model_used varchar(100) not null,
    created_at timestamptz not null default now()
);

-- Create index on flashcard_id for faster access
create index generations_flashcard_id_idx on generations(flashcard_id);

-- Enable Row Level Security
alter table generations enable row level security;

-- Create RLS Policies

-- Select policy for authenticated users
create policy "Users can view their own generations"
    on generations
    for select
    to authenticated
    using (exists (
        select 1 from flashcards
        where flashcards.flashcard_id = generations.flashcard_id
        and flashcards.user_id::text = auth.uid()::text
    ));

-- Insert policy for authenticated users
create policy "Users can create generations for their flashcards"
    on generations
    for insert
    to authenticated
    with check (exists (
        select 1 from flashcards
        where flashcards.flashcard_id = generations.flashcard_id
        and flashcards.user_id::text = auth.uid()::text
    ));