-- Migration: Create users table
-- Description: Creates the core users table
-- Author: AI Assistant
-- Date: 2024-03-20

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- Create users table
create table users (
    user_id bigserial primary key,
    email varchar(255) not null unique,
    password_hash text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create index on email for faster lookups
create index users_email_idx on users(email);