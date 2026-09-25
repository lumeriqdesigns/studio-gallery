-- Limit how many photos a client may download from a gallery (NULL = unlimited)
alter table public.galleries
  add column if not exists max_downloads integer;

comment on column public.galleries.max_downloads is
  'Max number of photos a client may download when allow_downloads is true. NULL = unlimited.';
