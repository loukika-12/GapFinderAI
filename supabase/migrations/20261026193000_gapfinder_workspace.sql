-- GapFinder AI: per-user persistent workspace, study activity, and materials.
-- All tables are protected by Supabase Row Level Security.
create table if not exists public.study_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.study_workspaces enable row level security;
drop policy if exists "Users can read own workspace" on public.study_workspaces;
create policy "Users can read own workspace" on public.study_workspaces for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own workspace" on public.study_workspaces;
create policy "Users can insert own workspace" on public.study_workspaces for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own workspace" on public.study_workspaces;
create policy "Users can update own workspace" on public.study_workspaces for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.study_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('material_saved','assistant_answered','quiz_completed','revision_task_completed')),
  title text not null check (char_length(title) between 1 and 200),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.study_activity enable row level security;
drop policy if exists "Users can view own study activity" on public.study_activity;
create policy "Users can view own study activity" on public.study_activity for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own study activity" on public.study_activity;
create policy "Users can insert own study activity" on public.study_activity for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can delete own study activity" on public.study_activity;
create policy "Users can delete own study activity" on public.study_activity for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  mime_type text not null check (mime_type in ('application/pdf','text/plain')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  storage_path text not null unique,
  content text not null default '' check (char_length(content) <= 500000),
  created_at timestamptz not null default now()
);
alter table public.materials enable row level security;
drop policy if exists "Users can read their own materials" on public.materials;
create policy "Users can read their own materials" on public.materials for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own materials" on public.materials;
create policy "Users can insert their own materials" on public.materials for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their own materials" on public.materials;
create policy "Users can update their own materials" on public.materials for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own materials" on public.materials;
create policy "Users can delete their own materials" on public.materials for delete to authenticated using (auth.uid() = user_id);
