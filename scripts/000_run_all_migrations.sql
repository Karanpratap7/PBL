-- Combined migration script - Run this to set up the entire database schema

-- 1. Create hospitals table first (no dependencies)
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  address text,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  alert_radius_km decimal(5, 2) default 5,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.hospitals enable row level security;

create policy "hospitals_select_all"
  on public.hospitals for select
  using (true);

-- 2. Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  date_of_birth date,
  gender text,
  user_role text not null default 'user',
  hospital_id uuid references public.hospitals(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

create policy "hospital_staff_view_all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'hospital_staff'
    )
  );

-- 3. Create medical_records table
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  blood_type text,
  allergies text[],
  medications text[],
  chronic_conditions text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.medical_records enable row level security;

create policy "medical_records_select_own"
  on public.medical_records for select
  using (auth.uid() = user_id);

create policy "medical_records_insert_own"
  on public.medical_records for insert
  with check (auth.uid() = user_id);

create policy "medical_records_update_own"
  on public.medical_records for update
  using (auth.uid() = user_id);

create policy "hospital_staff_view_medical_records"
  on public.medical_records for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'hospital_staff'
    )
  );

-- 4. Create alerts table
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id),
  user_latitude decimal(10, 8) not null,
  user_longitude decimal(11, 8) not null,
  status text default 'pending',
  hospital_response text,
  hospital_notes text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.alerts enable row level security;

create policy "alerts_select_own"
  on public.alerts for select
  using (auth.uid() = user_id);

create policy "alerts_insert_own"
  on public.alerts for insert
  with check (auth.uid() = user_id);

create policy "hospital_staff_view_alerts"
  on public.alerts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'hospital_staff' and p.hospital_id = alerts.hospital_id
    )
  );

create policy "hospital_staff_update_alerts"
  on public.alerts for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'hospital_staff' and p.hospital_id = alerts.hospital_id
    )
  );

-- 5. Create organ_donations table
create table if not exists public.organ_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  is_donor boolean default false,
  organs text[],
  blood_type text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.organ_donations enable row level security;

create policy "organ_donations_select_own"
  on public.organ_donations for select
  using (auth.uid() = user_id);

create policy "organ_donations_insert_own"
  on public.organ_donations for insert
  with check (auth.uid() = user_id);

create policy "organ_donations_update_own"
  on public.organ_donations for update
  using (auth.uid() = user_id);

create policy "hospital_staff_view_organ_donations"
  on public.organ_donations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_role = 'hospital_staff'
    )
  );

-- 6. Create trigger for auto-creating profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, user_role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Seed hospitals
insert into public.hospitals (name, email, phone, address, latitude, longitude, alert_radius_km)
values
  ('Central Medical Hospital', 'central@hospital.com', '+1-555-0101', '123 Main St', 40.7128, -74.0060, 5),
  ('St. Mary''s Hospital', 'stmary@hospital.com', '+1-555-0102', '456 Oak Ave', 40.7580, -73.9855, 5),
  ('Emergency Care Center', 'emergency@hospital.com', '+1-555-0103', '789 Pine Rd', 40.7489, -73.9680, 5),
  ('City General Hospital', 'citygeneral@hospital.com', '+1-555-0104', '321 Elm St', 40.7614, -73.9776, 5),
  ('Metropolitan Medical', 'metro@hospital.com', '+1-555-0105', '654 Maple Dr', 40.7505, -73.9934, 5)
on conflict do nothing;
