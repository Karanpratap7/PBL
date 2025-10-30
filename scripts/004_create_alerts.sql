-- Create alerts table for geolocation-based alerts
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  user_latitude decimal(10, 8) not null,
  user_longitude decimal(11, 8) not null,
  status text not null default 'pending', -- 'pending', 'accepted', 'rejected'
  responded_by uuid references public.profiles(id),
  response_notes text,
  created_at timestamp with time zone default now(),
  responded_at timestamp with time zone default now()
);

alter table public.alerts enable row level security;

-- Users can view their own alerts
create policy "alerts_select_own"
  on public.alerts for select
  using (auth.uid() = user_id);

create policy "alerts_insert_own"
  on public.alerts for insert
  with check (auth.uid() = user_id);

-- Hospital staff can view alerts sent to their hospital
create policy "alerts_select_hospital"
  on public.alerts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.user_role = 'hospital_staff'
        and p.hospital_id = alerts.hospital_id
    )
  );

-- Hospital staff can update alert status
create policy "alerts_update_hospital"
  on public.alerts for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.user_role = 'hospital_staff'
        and p.hospital_id = alerts.hospital_id
    )
  );
