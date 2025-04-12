-- Migration: Create flashcards table
-- Description: Creates the flashcards table with RLS policies
-- Author: AI Assistant
-- Date: 2025-04-12

-- Create flashcards table
create table flashcards (
    flashcard_id bigserial primary key,
    user_id bigint not null references users(user_id) on delete cascade,
    generation_id bigint references generations(generation_id) on delete set null,
    front varchar(200) not null,
    back varchar(500) not null,
    type varchar(30) not null check (type in ('manual', 'ai-generated', 'ai-generated-modified')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create index on user_id for faster filtering
create index flashcards_user_id_idx on flashcards(user_id);

-- Create index on generation_id for faster access
create index flashcards_generation_id_idx on flashcards(generation_id);

-- Enable Row Level Security
alter table flashcards enable row level security;

-- Create RLS Policies

-- Select policy for authenticated users
create policy "Users can view their own flashcards"
    on flashcards
    for select
    to authenticated
    using (auth.uid()::text = user_id::text);

-- Insert policy for authenticated users
create policy "Users can create their own flashcards"
    on flashcards
    for insert
    to authenticated
    with check (auth.uid()::text = user_id::text);

-- Update policy for authenticated users
create policy "Users can update their own flashcards"
    on flashcards
    for update
    to authenticated
    using (auth.uid()::text = user_id::text)
    with check (auth.uid()::text = user_id::text);

-- Delete policy for authenticated users
create policy "Users can delete their own flashcards"
    on flashcards
    for delete
    to authenticated
    using (auth.uid()::text = user_id::text);