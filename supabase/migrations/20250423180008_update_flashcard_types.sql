-- Migration: Update flashcard types
-- Description: Updates the type check constraint to use ai_generated instead of ai-generated
-- Author: System
-- Date: 2025-04-23

-- First update existing data to use the new type format
update flashcards
set type = 'ai_generated'
where type = 'ai-generated';

update flashcards
set type = 'ai_generated_modified'
where type = 'ai-generated-modified';

-- Drop the existing check constraint
alter table flashcards
drop constraint flashcards_type_check;

-- Add the new check constraint with updated values
alter table flashcards
add constraint flashcards_type_check
check (type in ('manual', 'ai_generated', 'ai_generated_modified'));