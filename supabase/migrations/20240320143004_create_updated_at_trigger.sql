-- Migration: Create updated_at trigger
-- Description: Creates a trigger function to automatically update the updated_at timestamp
-- Author: AI Assistant
-- Date: 2024-03-20

-- Create the trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply trigger to users table
create trigger set_updated_at
    before update on users
    for each row
    execute function public.set_updated_at();

-- Apply trigger to flashcards table
create trigger set_updated_at
    before update on flashcards
    for each row
    execute function public.set_updated_at();

comment on function public.set_updated_at() is 'Trigger to automatically set updated_at timestamp when a record is updated';