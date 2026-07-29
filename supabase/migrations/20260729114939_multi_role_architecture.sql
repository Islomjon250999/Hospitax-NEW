/*
# Multi-Role Architecture: Hotels, Staff, Connection Requests

1. New Tables
- `hotels` — represents a hotel/property on the platform. Linked to existing PMS data (rooms, bookings, etc.) conceptually as the tenant. Columns: id, name, type, city, rooms_count, plan, status, mrr, created_at, admin_name, phone, email, address, subscription_status, trial_ends_at.
- `staff` — platform/hotel staff accounts with role-based access. Columns: id, hotel_id (nullable for platform-level staff), full_name, email, role, phone, active, created_at.
- `connection_requests` — leads from the landing page application form. Columns: id, hotel_name, contact_name, phone, email, city, room_count, message, status, created_at.

2. Security
- Enable RLS on all three new tables.
- Use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` since this is a demo platform with a mock auth layer (no real Supabase auth sessions). The frontend uses the anon key exclusively.
- This is intentionally permissive because role enforcement is handled in the frontend mock auth layer, not via Supabase auth.

3. Important Notes
- `hotels` is seeded from the existing `properties` mock data (12 hotels).
- `staff` is seeded with demo accounts for each role: ceo, super_admin, manager, receptionist, housekeeping.
- `connection_requests` starts empty.
- Existing tables (categories, rooms, bookings, tariffs, extra_services, guests) remain unchanged.
*/

-- ── Hotels table ──
CREATE TABLE IF NOT EXISTS hotels (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Hotel',
  city text NOT NULL DEFAULT 'Tashkent',
  rooms_count integer NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT 'Basic',
  status text NOT NULL DEFAULT 'Active',
  mrr numeric NOT NULL DEFAULT 0,
  admin_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  subscription_status text NOT NULL DEFAULT 'Active',
  trial_ends_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_hotels" ON hotels;
CREATE POLICY "anon_select_hotels" ON hotels FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_hotels" ON hotels;
CREATE POLICY "anon_insert_hotels" ON hotels FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_hotels" ON hotels;
CREATE POLICY "anon_update_hotels" ON hotels FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_hotels" ON hotels;
CREATE POLICY "anon_delete_hotels" ON hotels FOR DELETE
  TO anon, authenticated USING (true);

-- ── Staff table ──
CREATE TABLE IF NOT EXISTS staff (
  id text PRIMARY KEY,
  hotel_id text,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'receptionist',
  phone text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_staff" ON staff;
CREATE POLICY "anon_select_staff" ON staff FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_staff" ON staff;
CREATE POLICY "anon_insert_staff" ON staff FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_staff" ON staff;
CREATE POLICY "anon_update_staff" ON staff FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_staff" ON staff;
CREATE POLICY "anon_delete_staff" ON staff FOR DELETE
  TO anon, authenticated USING (true);

-- ── Connection requests table ──
CREATE TABLE IF NOT EXISTS connection_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hotel_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT 'Tashkent',
  room_count integer NOT NULL DEFAULT 0,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_requests" ON connection_requests;
CREATE POLICY "anon_select_requests" ON connection_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_requests" ON connection_requests;
CREATE POLICY "anon_insert_requests" ON connection_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_requests" ON connection_requests;
CREATE POLICY "anon_update_requests" ON connection_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_requests" ON connection_requests;
CREATE POLICY "anon_delete_requests" ON connection_requests FOR DELETE
  TO anon, authenticated USING (true);

-- ── Seed hotels from mock data ──
INSERT INTO hotels (id, name, type, city, rooms_count, plan, status, mrr, admin_name, phone, email, subscription_status, created_at) VALUES
  ('p1', 'Tashkent Grand Hotel', 'Hotel', 'Tashkent', 184, 'Enterprise', 'Active', 480, 'Akmal Rakhimov', '+998 71 120 45 67', 'akmal@grandhotel.uz', 'Active', '2023-02-12'),
  ('p2', 'Registan Boutique Samarkand', 'Boutique Hotel', 'Samarkand', 42, 'Pro', 'Active', 180, 'Dilnoza Karimova', '+998 66 233 11 22', 'info@registan.uz', 'Active', '2023-04-08'),
  ('p3', 'Bukhara Silk Road Inn', 'Hotel', 'Bukhara', 68, 'Pro', 'Active', 210, 'Sardor Yusupov', '+998 65 222 33 44', 'sardor@silkroad.uz', 'Active', '2023-06-21'),
  ('p4', 'Khiva Citadel Guesthouse', 'Guesthouse', 'Khiva', 18, 'Basic', 'Active', 60, 'Madina Tosheva', '+998 62 345 67 89', 'madina@citadel.uz', 'Active', '2023-09-03'),
  ('p5', 'Tashkent City Capsule Hostel', 'Hostel', 'Tashkent', 56, 'Basic', 'Trial', 0, 'Bekzod Aliyev', '+998 90 555 12 34', 'bekzod@capsule.uz', 'Trial', '2024-01-15'),
  ('p6', 'Amir Timur Plaza Hotel', 'Hotel', 'Tashkent', 124, 'Enterprise', 'Active', 420, 'Nodira Islamova', '+998 71 200 80 90', 'nodira@amirtimur.uz', 'Active', '2022-11-30'),
  ('p7', 'Samarkand Regal Resort & Spa', 'Resort', 'Samarkand', 96, 'Enterprise', 'Active', 360, 'Jasur Makhmudov', '+998 66 900 11 00', 'jasur@regalresort.uz', 'Active', '2023-07-18'),
  ('p8', 'Charvak Lakeside Resort', 'Resort', 'Tashkent Region', 58, 'Pro', 'Onboarding', 0, 'Gulnara Ergasheva', '+998 97 777 88 99', 'gulnara@charvak.uz', 'Onboarding', '2024-02-20'),
  ('p9', 'Bukhara Minara Boutique', 'Boutique Hotel', 'Bukhara', 28, 'Basic', 'Suspended', 0, 'Rustam Sobirov', '+998 65 111 22 33', 'rustam@minara.uz', 'Suspended', '2023-12-05'),
  ('p10', 'Tashkent Modern Business Hotel', 'Hotel', 'Tashkent', 110, 'Pro', 'Active', 240, 'Aziza Yusupova', '+998 71 140 50 60', 'aziza@modern.uz', 'Active', '2023-03-14'),
  ('p11', 'Samarkand Old Town Hostel', 'Hostel', 'Samarkand', 40, 'Basic', 'Active', 70, 'Otabek Tursunov', '+998 66 456 78 90', 'otabek@oldtown.uz', 'Active', '2023-08-22'),
  ('p12', 'Khiva Oasis Guesthouse', 'Guesthouse', 'Khiva', 14, 'Basic', 'Active', 50, 'Lola Nazarova', '+998 62 678 90 12', 'lola@oasis.uz', 'Active', '2024-01-08')
ON CONFLICT (id) DO NOTHING;

-- ── Seed staff with demo accounts for each role ──
INSERT INTO staff (id, hotel_id, full_name, email, role, phone, active) VALUES
  ('staff_ceo', NULL, 'Akmal Rakhimov', 'ceo@hospitalx.uz', 'ceo', '+998 90 111 22 33', true),
  ('staff_superadmin', NULL, 'Sardor Yusupov', 'admin@hospitalx.uz', 'super_admin', '+998 90 222 33 44', true),
  ('staff_manager', 'p1', 'Dilnoza Karimova', 'manager@grandhotel.uz', 'manager', '+998 90 333 44 55', true),
  ('staff_reception', 'p1', 'Bekzod Aliyev', 'reception@grandhotel.uz', 'receptionist', '+998 90 444 55 66', true),
  ('staff_housekeeping', 'p1', 'Madina Tosheva', 'housekeeping@grandhotel.uz', 'housekeeping', '+998 90 555 66 77', true)
ON CONFLICT (id) DO NOTHING;
