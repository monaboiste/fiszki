-- Migration: Re-enable RLS Policies
-- Description: Re-enables RLS for flashcards, generations, and ai_generation_logs tables, restores their policies, and removes temporary comments.
-- Author: AI Assistant
-- Date: 2025-05-13

-- Enable RLS and restore policies for flashcards table
alter table public.flashcards enable row level security;

create policy "Users can view their own flashcards"
    on public.flashcards
    for select
    to authenticated
    using (auth.uid()::text = user_id::text);

create policy "Users can create their own flashcards"
    on public.flashcards
    for insert
    to authenticated
    with check (auth.uid()::text = user_id::text);

create policy "Users can update their own flashcards"
    on public.flashcards
    for update
    to authenticated
    using (auth.uid()::text = user_id::text)
    with check (auth.uid()::text = user_id::text);

create policy "Users can delete their own flashcards"
    on public.flashcards
    for delete
    to authenticated
    using (auth.uid()::text = user_id::text);

comment on table public.flashcards is null; -- Remove temporary comment

-- Enable RLS and restore policies for generations table
alter table public.generations enable row level security;

create policy "Users can view their own generations"
    on public.generations
    for select
    to authenticated
    using (auth.uid()::text = user_id::text);

create policy "Users can create their own generations"
    on public.generations
    for insert
    to authenticated
    with check (auth.uid()::text = user_id::text);

comment on table public.generations is null; -- Remove temporary comment

-- Enable RLS for ai_generation_logs table
alter table public.ai_generation_logs enable row level security;
-- No specific policies were defined or dropped for ai_generation_logs previously.
-- Enabling RLS restores its state. Default RLS behavior denies all access unless specific permissive policies are added
-- or access is through a role that bypasses RLS (e.g., service_role).
-- Per RLS best practices, explicit policies (e.g., `create policy "Allow all for admin" on ai_generation_logs to service_role;`)
-- or permissive `using (true)` policies for `anon` and/or `authenticated` might be considered if direct access is needed.
-- For now, only RLS is enabled to match the state prior to temporary disablement.

comment on table public.ai_generation_logs is null; -- Remove temporary comment