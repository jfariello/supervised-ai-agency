create extension if not exists "pgcrypto";

do $$ begin
  create type lead_stage as enum (
    'new',
    'enriched',
    'qualified',
    'brief_ready',
    'proposal_ready',
    'email_pending_approval',
    'contacted',
    'follow_up_due',
    'won',
    'lost',
    'do_not_contact'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type proposal_status as enum ('draft', 'needs_review', 'approved', 'sent', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type agent_status as enum ('queued', 'running', 'completed', 'failed', 'needs_review');
exception when duplicate_object then null;
end $$;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text not null default 'Contacto',
  email text unique,
  website text,
  phone text,
  address text,
  industry text not null default 'Sin clasificar',
  country text not null default 'Sin pais',
  source text not null check (source in ('excel', 'csv', 'apify', 'manual')),
  score integer not null default 40 check (score between 0 and 100),
  stage lead_stage not null default 'new',
  service_interest text not null default 'Paquete mixto',
  last_touch date not null default current_date,
  next_follow_up date,
  pain_point text not null default 'Pendiente de investigacion',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  name text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  goals text not null,
  context text not null,
  urgency text not null check (urgency in ('baja', 'media', 'alta')),
  budget_range text,
  suggested_services text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  title text not null,
  status proposal_status not null default 'draft',
  value text,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists email_drafts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  subject text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'sent')),
  provider_id text,
  created_at timestamptz not null default now()
);

create table if not exists followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  due_at date not null,
  type text not null check (type in ('email', 'call', 'proposal_review', 'research')),
  status text not null default 'pending' check (status in ('pending', 'done', 'overdue')),
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  status agent_status not null default 'queued',
  lead_id uuid references leads(id) on delete set null,
  task text not null,
  summary text not null,
  input jsonb not null default '{}',
  output jsonb not null default '{}',
  error text,
  model text,
  cost_usd numeric(10, 4) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('email', 'proposal', 'lead_action')),
  object_id uuid not null,
  lead_id uuid not null references leads(id) on delete cascade,
  title text not null,
  status approval_status not null default 'pending',
  risk text not null check (risk in ('bajo', 'medio', 'alto')),
  comment text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_stage_idx on leads(stage);
create index if not exists leads_email_idx on leads(email);
create index if not exists proposals_lead_id_idx on proposals(lead_id);
create index if not exists email_drafts_lead_id_idx on email_drafts(lead_id);
create index if not exists followups_due_at_idx on followups(due_at, status);
create index if not exists agent_runs_lead_id_idx on agent_runs(lead_id);
create index if not exists approvals_status_idx on approvals(status);

alter table leads alter column email drop not null;
alter table leads add column if not exists website text;
alter table leads add column if not exists phone text;
alter table leads add column if not exists address text;

create index if not exists leads_website_idx on leads(website);
