-- Per-gallery download control: preview/selects only vs full downloads
-- Run in Supabase SQL Editor if you already applied 0001_init.sql

alter table public.galleries
  add column if not exists allow_downloads boolean not null default false;

comment on column public.galleries.allow_downloads is
  'When false, clients can preview and select favorites only. When true, download buttons are enabled.';
