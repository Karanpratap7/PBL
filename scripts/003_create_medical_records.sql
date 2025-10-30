-- Create medical records table
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  medications text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.medical_records enable row level security;

-- Users can view and manage their own medical records
create policy "medical_records_select_own"
  on public.medical_records for select
  using (auth.uid() = user_id);

create policy "medical_records_insert_own"
  on public.medical_records for insert
  with check (auth.uid() = user_id);

create policy "medical_records_update_own"
  on public.medical_records for update
  using (auth.uid() = user_id);

create policy "medical_records_delete_own"
  on public.medical_records for delete
  using (auth.uid() = user_id);

-- Hospital staff can view medical records of users who sent alerts to their hospital
create policy "hospital_staff_view_records"
  on public.medical_records for select
  using (
    exists (
      select 1 from public.alerts a
      join public.profiles p on p.id = auth.uid()
      where a.user_id = medical_records.user_id
        and a.hospital_id = p.hospital_id
        and p.user_role = 'hospital_staff'
        and a.status = 'accepted'
    )
  );
