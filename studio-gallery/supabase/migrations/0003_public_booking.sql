-- Allow anonymous session booking form submissions
create policy "Public insert clients for booking"
  on public.clients for insert
  to anon
  with check (true);

create policy "Public insert inquiry bookings"
  on public.bookings for insert
  to anon
  with check (status = 'inquiry');
