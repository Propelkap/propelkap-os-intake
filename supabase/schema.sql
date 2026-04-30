-- Schema for gina-brows-intake
-- Run this in the Supabase SQL editor of the new project.

create extension if not exists "pgcrypto";

create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text,
  nombre_dueña text,
  nombre_estudio text,
  ciudad text,
  payload jsonb not null,
  user_agent text,
  ip text
);

create index if not exists intake_submissions_created_at_idx
  on public.intake_submissions (created_at desc);

create index if not exists intake_submissions_email_idx
  on public.intake_submissions (email);

alter table public.intake_submissions enable row level security;

-- No public policies. Only the service role (used server-side from Next.js API
-- routes) can read/write. The anon key has zero access.
