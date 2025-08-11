create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists dnc_entities (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  value text not null,
  reason text,
  expires_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists dnc_kind_value_idx on dnc_entities (kind, value);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists intake_forms (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  raw jsonb not null,
  created_at timestamptz default now()
);

create table if not exists bots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  title text not null,
  email text not null,
  phone text not null,
  status text not null default 'idle',
  client_id uuid references clients(id),
  spec jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid references bots(id),
  type text not null,
  payload jsonb not null,
  status text not null default 'queued',
  priority int default 5,
  scheduled_for timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists tasks_status_idx on tasks(status, priority, scheduled_for);

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  bot_id uuid references bots(id),
  started_at timestamptz default now(),
  ended_at timestamptz,
  result jsonb,
  error text
);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  rrule text not null,
  window jsonb,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid references bots(id),
  category text not null,
  kpis jsonb not null,
  window text not null,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  company text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  city text,
  state text,
  status text default 'new',
  round int,
  extra jsonb,
  created_at timestamptz default now()
);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_company_idx on leads(company);

create table if not exists pricing_addons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text not null,
  hours_estimate numeric not null,
  price numeric not null,
  active boolean default true
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);
