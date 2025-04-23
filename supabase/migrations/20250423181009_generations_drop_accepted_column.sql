-- Migration: Drop accepted column
-- Description: Drops the accepted column from the generations table
-- Author: System
-- Date: 2025-04-23

alter table generations drop column accepted;
