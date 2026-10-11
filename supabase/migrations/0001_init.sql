-- Penny Feed schema. One reader, one editor.
--
-- Access model
--   * The reader (browser) signs in as the single owner and can read content and
--     read/write their own state. It can NEVER write items or series.
--   * The editor publishes only through the `ingest` edge function, which uses
--     the service role after validating its own bearer token. Scheduled tasks
--     therefore never hold database credentials.
--   * Nothing is readable until you register yourself as owner (see README).

create table if not exists public.app_owner (
  uid uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.app_owner where uid = auth.uid());
$$;

-- ---------------------------------------------------------------- content

create table if not exists public.items (
  id              text primary key,
  format          text not null check (format in ('update','explainer','rabbit_hole','deep_dive','series_chapter','circle')),
  headline        text not null,
  dek             text,
  body            text not null,
  reading_minutes int  not null,
  topics          text[] not null default '{}',
  published_at    timestamptz not null default now(),
  event_date      timestamptz,
  timeliness      text not null check (timeliness in ('current','evergreen')),
  significance    numeric not null check (significance between 0 and 1),
  -- Only content that passed validation is ever inserted, so the pipeline's
  -- earlier stages (discovered..approved) live in the editor, not here.
  status          text not null default 'published' check (status in ('published','corrected','archived')),
  reason          text,
  sources         jsonb not null default '[]',
  caveats         jsonb not null default '[]',
  series_id       text,
  chapter         int,
  recap           text,
  person          text,
  version         int  not null default 1,
  corrections     jsonb not null default '[]',
  discovered_via  text,
  sample          boolean not null default false,
  updated_at      timestamptz not null default now()
);
create index if not exists items_published_idx on public.items (status, published_at desc);
create unique index if not exists items_series_chapter_uq on public.items (series_id, chapter) where series_id is not null and status <> 'archived';

create table if not exists public.series (
  id              text primary key,
  title           text not null,
  description     text not null,
  subject         text not null,
  topics          text[] not null default '{}',
  motif           text not null default 'window',
  status          text not null default 'suggested',
  research_status text not null check (research_status in ('pitched','researching','ready')),
  total_chapters  int  not null,
  outline         jsonb not null default '[]',
  sources         jsonb not null default '[]',
  reason          text,
  sample          boolean not null default false,
  version         int  not null default 1,
  updated_at      timestamptz not null default now()
);

-- Every version of an item that was ever published, so corrections never erase history.
create table if not exists public.item_versions (
  item_id    text not null,
  version    int  not null,
  snapshot   jsonb not null,
  created_at timestamptz not null default now(),
  primary key (item_id, version)
);

-- ---------------------------------------------------------------- reader state

-- Documents keyed by name: interests, prefs, history, reader, feedback.
-- (A single reader doesn't need these normalised; see docs/DECISIONS.md.)
create table if not exists public.state (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- ingestion log

create table if not exists public.ingestion_jobs (
  id          uuid primary key default gen_random_uuid(),
  task        text not null,
  run_id      text not null unique,   -- idempotency key
  status      text not null default 'running' check (status in ('running','ok','partial','failed')),
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  submitted   int not null default 0,
  accepted    int not null default 0,
  rejected    int not null default 0,
  errors      jsonb not null default '[]',
  result      jsonb
);
create index if not exists ingestion_jobs_started_idx on public.ingestion_jobs (started_at desc);

-- ---------------------------------------------------------------- row level security

alter table public.app_owner       enable row level security;
alter table public.items           enable row level security;
alter table public.series          enable row level security;
alter table public.item_versions   enable row level security;
alter table public.state           enable row level security;
alter table public.ingestion_jobs  enable row level security;

-- Reader: read content and the log; read/write own state. No content writes.
create policy items_read     on public.items          for select to authenticated using (public.is_owner());
create policy series_read    on public.series         for select to authenticated using (public.is_owner());
create policy versions_read  on public.item_versions  for select to authenticated using (public.is_owner());
create policy jobs_read      on public.ingestion_jobs for select to authenticated using (public.is_owner());
create policy state_read     on public.state          for select to authenticated using (public.is_owner());
create policy state_insert   on public.state          for insert to authenticated with check (public.is_owner());
create policy state_update   on public.state          for update to authenticated using (public.is_owner()) with check (public.is_owner());
create policy state_delete   on public.state          for delete to authenticated using (public.is_owner());
-- app_owner has no policies: only the service role / SQL editor can touch it.

-- Defence in depth: the anon role gets nothing at all.
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------- grants
-- Written for projects created with "Automatically expose new tables" OFF, so
-- every privilege is explicit. (Harmless if it was left on.) RLS above still
-- decides which rows the reader may touch.
grant usage on schema public to authenticated, service_role;

-- Reader: read content and the log; read/write own state. Nothing else.
grant select on public.items, public.series, public.item_versions, public.ingestion_jobs to authenticated;
grant select, insert, update, delete on public.state to authenticated;

-- Editor functions run as service_role (after their own token check).
grant all on all tables in schema public to service_role;
grant execute on function public.is_owner() to authenticated;
