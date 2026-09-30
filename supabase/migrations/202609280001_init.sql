create extension if not exists pgcrypto;

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  parent_id uuid references public.folders (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  source_book_id text not null,
  title text not null,
  author text not null,
  cover_url text,
  synopsis text not null default '',
  page_count integer,
  community_rating numeric(3, 2),
  folder_id uuid references public.folders (id) on delete set null,
  has_physical boolean not null default false,
  pdf_url text,
  pdf_label text,
  storage_mode text not null default 'none' check (storage_mode in ('none', 'local', 'cloud')),
  status text not null default 'queued' check (status in ('queued', 'reading', 'finished')),
  total_seconds integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  personal_rating integer check (personal_rating between 1 and 5),
  thoughts text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  format text not null check (format in ('pdf', 'physical')),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0)
);

create table if not exists public.active_sessions (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  format text not null check (format in ('pdf', 'physical')),
  started_at timestamptz not null
);

alter table public.folders enable row level security;
alter table public.books enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.active_sessions enable row level security;

create policy "folders are private"
on public.folders
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "books are private"
on public.books
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "sessions are private"
on public.reading_sessions
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "active sessions are private"
on public.active_sessions
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

insert into storage.buckets (id, name, public)
values ('book-pdfs', 'book-pdfs', false)
on conflict (id) do nothing;

create policy "authenticated users can read their pdfs"
on storage.objects
for select
using (
  bucket_id = 'book-pdfs'
  and auth.role() = 'authenticated'
  and owner = auth.uid()
);

create policy "authenticated users can upload their pdfs"
on storage.objects
for insert
with check (
  bucket_id = 'book-pdfs'
  and auth.role() = 'authenticated'
  and owner = auth.uid()
);

create policy "authenticated users can update their pdfs"
on storage.objects
for update
using (
  bucket_id = 'book-pdfs'
  and auth.role() = 'authenticated'
  and owner = auth.uid()
)
with check (
  bucket_id = 'book-pdfs'
  and auth.role() = 'authenticated'
  and owner = auth.uid()
);

create policy "authenticated users can delete their pdfs"
on storage.objects
for delete
using (
  bucket_id = 'book-pdfs'
  and auth.role() = 'authenticated'
  and owner = auth.uid()
);
