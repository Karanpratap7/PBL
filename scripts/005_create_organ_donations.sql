-- Create organ donation preferences table
create table if not exists public.organ_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  is_donor boolean default false,
  organs text[], -- Array of organs willing to donate
  blood_type_for_donation text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.organ_donations enable row level security;

-- Users can view and manage their own organ donation preferences
create policy "organ_donations_select_own"
  on public.organ_donations for select
  using (auth.uid() = user_id);

create policy "organ_donations_insert_own"
  on public.organ_donations for insert
  with check (auth.uid() = user_id);

create policy "organ_donations_update_own"
  on public.organ_donations for update
  using (auth.uid() = user_id);

create policy "organ_donations_delete_own"
  on public.organ_donations for delete
  using (auth.uid() = user_id);

-- Hospital staff can view organ donation info of users who sent alerts
create policy "organ_donations_hospital_view"
  on public.organ_donations for select
  using (
    exists (
      select 1 from public.alerts a
      join public.profiles p on p.id = auth.uid()
      where a.user_id = organ_donations.user_id
        and a.hospital_id = p.hospital_id
        and p.user_role = 'hospital_staff'
        and a.status = 'accepted'
    )
  );
