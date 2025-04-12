-- Migration: Create generations table
-- Description: Creates the generations table with RLS policies
-- Author: AI Assistant
-- Date: 2025-04-12

-- Create generations table
create table generations (
    generation_id bigserial primary key,
    user_id bigint not null references users(user_id) on delete cascade,
    generation_duration_ms integer not null check (generation_duration_ms >= 0),
    input_text varchar(10000) not null,
    accepted boolean not null default false,
    model_used varchar(100) not null,
    created_at timestamptz not null default now()
);

-- Create index on user_id for faster access
create index generations_user_id_idx on generations(user_id);

-- Enable Row Level Security
alter table generations enable row level security;

-- Create RLS Policies

-- Select policy for authenticated users
create policy "Users can view their own generations"
    on generations
    for select
    to authenticated
    using (auth.uid()::text = user_id::text);

-- Insert policy for authenticated users
create policy "Users can create their own generations"
    on generations
    for insert
    to authenticated
    with check (auth.uid()::text = user_id::text);