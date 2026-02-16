-- Ensure RLS is enabled for staff table
alter table public.staff enable row level security;

-- Drop existing policies if they exist (to avoid errors)
drop policy if exists "Allow public all for staff" on public.staff;

-- Create a comprehensive policy for staff
create policy "Allow public all for staff" on public.staff for all using (true);
