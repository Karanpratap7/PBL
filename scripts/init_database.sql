-- ============================================================================
-- Healthcare Alert App - Complete Database Schema
-- ============================================================================
-- Execute this entire script in Supabase SQL Editor to set up the database

-- ============================================================================
-- 1. Create hospitals table FIRST (no dependencies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  radius_km decimal(5, 2) DEFAULT 5,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospitals_select_all"
  ON public.hospitals FOR SELECT
  USING (true);

-- ============================================================================
-- 2. Create profiles table (references hospitals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  date_of_birth date,
  gender text,
  user_role text NOT NULL DEFAULT 'user',
  hospital_id uuid REFERENCES public.hospitals(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- 3. Create medical records table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  medications text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical_records_select_own"
  ON public.medical_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "medical_records_insert_own"
  ON public.medical_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "medical_records_update_own"
  ON public.medical_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "medical_records_delete_own"
  ON public.medical_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Create alerts table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  user_latitude decimal(10, 8) NOT NULL,
  user_longitude decimal(11, 8) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  responded_by uuid REFERENCES public.profiles(id),
  response_notes text,
  created_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_select_own"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "alerts_insert_own"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_select_hospital"
  ON public.alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.user_role = 'hospital_staff'
        AND p.hospital_id = alerts.hospital_id
    )
  );

CREATE POLICY "alerts_update_hospital"
  ON public.alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.user_role = 'hospital_staff'
        AND p.hospital_id = alerts.hospital_id
    )
  );

-- ============================================================================
-- 5. Create organ donations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organ_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_donor boolean DEFAULT false,
  organs text[],
  blood_type_for_donation text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.organ_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organ_donations_select_own"
  ON public.organ_donations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "organ_donations_insert_own"
  ON public.organ_donations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "organ_donations_update_own"
  ON public.organ_donations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "organ_donations_delete_own"
  ON public.organ_donations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. Create trigger for auto-profile creation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'user_role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. Seed sample hospitals
-- ============================================================================
INSERT INTO public.hospitals (name, address, phone, email, latitude, longitude, radius_km)
VALUES
  ('City General Hospital', '123 Main St, Downtown', '555-0001', 'info@cityhospital.com', 40.7128, -74.0060, 5),
  ('St. Mary Medical Center', '456 Oak Ave, Midtown', '555-0002', 'contact@stmary.com', 40.7580, -73.9855, 5),
  ('Emergency Care Clinic', '789 Pine Rd, Uptown', '555-0003', 'emergency@carecare.com', 40.7614, -73.9776, 3)
ON CONFLICT DO NOTHING;
