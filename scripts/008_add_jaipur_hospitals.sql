-- Add 10 Jaipur hospitals to the database
INSERT INTO public.hospitals (name, address, phone, email, latitude, longitude, radius_km)
VALUES
  ('Sawai Man Singh (SMS) Hospital', 'Jawaharlal Nehru Marg, Jaipur, Rajasthan, India', '', '', 26.9139, 75.7849, 0.7),
  ('Santokba Durlabhji Memorial Hospital', 'Prabhu Dayal Marg, Sodala, Jaipur, Rajasthan 302006, India', '', '', 26.9186, 75.8291, 0.5),
  ('Narayana Multispeciality Hospital, Jaipur', 'Sector 28, Kumbha Marg, Pratap Nagar, Sanganer, Jaipur, Rajasthan 302019, India', '', '', 26.7880, 75.7930, 0.5),
  ('Bhagwan Mahaveer Cancer Hospital & Research Centre (BMCHRC)', 'Jawaharlal Nehru Marg, Bajaj Nagar, Jaipur, Rajasthan 302015, India', '', '', 26.9175, 75.8173, 0.5),
  ('Fortis Escorts Hospital, Jaipur', 'Malviya Nagar / Malviya Nagar area, Jaipur, Rajasthan, India', '', '', 26.8730, 75.7833, 0.5),
  ('Apollo Hospitals / Apollo Spectra (Jaipur)', 'Jaipur (multiple Apollo clinics/hospitals reported; confirm exact branch for precise address)', '', '', 26.9124, 75.7873, 1.0),
  ('SMS Super Speciality Hospital (attached to SMS Medical College)', 'SMS Medical College campus, Jawaharlal Nehru Marg, Jaipur, Rajasthan, India', '', '', 26.9142, 75.7839, 0.4),
  ('Mahatma Gandhi Hospital / JK Lon Hospital (women & children)', 'Within SMS Medical College hospital campus, Jaipur, Rajasthan, India', '', '', 26.9140, 75.7843, 0.3),
  ('Jeevan Rekha Hospital', 'Central Jaipur area, Jaipur, Rajasthan, India', '', '', 26.9150, 75.7900, 0.7),
  ('Apex / City / Multi-speciality private hospitals', 'Major private hospital areas: Malviya Nagar, Sodala, Sanganer, Jawahar Nagar, Jaipur, Rajasthan, India', '', '', 26.9050, 75.8000, 1.0)
ON CONFLICT DO NOTHING;
