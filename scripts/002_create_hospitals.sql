-- Create hospitals table
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text,
  email text,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  radius_km decimal(5, 2) default 5, -- Alert radius in kilometers
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.hospitals enable row level security;

-- Everyone can view hospitals
create policy "hospitals_select_all"
  on public.hospitals for select
  using (true);

-- Only hospital staff can insert/update/delete
create policy "hospitals_insert_staff"
  on public.hospitals for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'hospital_staff'
    )
  );

create policy "hospitals_update_staff"
  on public.hospitals for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'hospital_staff'
    )
  );
