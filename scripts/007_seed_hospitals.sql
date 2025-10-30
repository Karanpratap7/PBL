-- Seed some sample hospitals
insert into public.hospitals (name, address, phone, email, latitude, longitude, radius_km)
values
  ('City General Hospital', '123 Main St, Downtown', '555-0001', 'info@cityhospital.com', 40.7128, -74.0060, 5),
  ('St. Mary Medical Center', '456 Oak Ave, Midtown', '555-0002', 'contact@stmary.com', 40.7580, -73.9855, 5),
  ('Emergency Care Clinic', '789 Pine Rd, Uptown', '555-0003', 'emergency@carecare.com', 40.7614, -73.9776, 3)
on conflict do nothing;
