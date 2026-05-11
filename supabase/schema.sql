-- Workify — Supabase schema (matches design spec section 9)
-- Run this in the Supabase SQL editor on a fresh project.
-- Demo uses seed data from src/mocks/seed-data.ts, so these tables are scaffolding for the production version.

create extension if not exists "uuid-ossp";

create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  plan text not null default 'starter',
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  email text not null unique,
  role text not null default 'owner',
  signature text,
  timezone text default 'America/Chicago',
  created_at timestamptz default now()
);

create table if not exists mailboxes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  provider text not null,
  email text not null,
  tokens jsonb,
  daily_cap int default 100,
  created_at timestamptz default now()
);

create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  legal_name text not null,
  domain text,
  trust text default 'inferred',
  signals jsonb default '[]'::jsonb,
  raw jsonb,
  created_at timestamptz default now()
);

create table if not exists recruiters (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  full_name text not null,
  title text,
  email text,
  email_status text default 'inferred',
  trust text default 'inferred',
  pipeline_stage text default 'new',
  signals jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists sequences (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  tone text,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists sequence_steps (
  id uuid primary key default uuid_generate_v4(),
  sequence_id uuid references sequences(id) on delete cascade,
  step_index int not null,
  day_offset int not null,
  subject text,
  body text,
  created_at timestamptz default now()
);

create table if not exists enrollments (
  id uuid primary key default uuid_generate_v4(),
  sequence_id uuid references sequences(id) on delete cascade,
  recruiter_id uuid references recruiters(id) on delete cascade,
  mailbox_id uuid references mailboxes(id) on delete set null,
  status text default 'queued',
  current_step int default 0,
  next_send_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  enrollment_id uuid references enrollments(id) on delete cascade,
  direction text not null,
  subject text,
  body text,
  sent_at timestamptz,
  thread_id text,
  replied_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists calls (
  id uuid primary key default uuid_generate_v4(),
  recruiter_id uuid references recruiters(id) on delete cascade,
  twilio_sid text,
  transcript jsonb,
  summary text,
  sentiment text,
  action_items jsonb default '[]'::jsonb,
  started_at timestamptz,
  duration_sec int default 0,
  disposition text,
  created_at timestamptz default now()
);

create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  recruiter_id uuid references recruiters(id) on delete set null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  type text default 'meeting',
  created_at timestamptz default now()
);

create table if not exists suppression_list (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  email text not null,
  reason text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_recruiters_workspace on recruiters(workspace_id);
create index if not exists idx_recruiters_pipeline on recruiters(pipeline_stage);
create index if not exists idx_messages_enrollment on messages(enrollment_id);
create index if not exists idx_enrollments_recruiter on enrollments(recruiter_id);
create index if not exists idx_calendar_user on calendar_events(user_id);

-- RLS — disabled for demo. Enable + write policies for production.
-- alter table recruiters enable row level security;
-- (policies omitted in the demo)
