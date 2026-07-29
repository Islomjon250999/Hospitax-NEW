/*
# PMS Schema: Categories, Rooms, Tariffs, Services, Bookings, Guests

## Overview
Creates the complete relational data model for the Property Management System.
Text primary keys are used for compatibility with existing application IDs.

## New Tables

1. categories — Room categories (room types)
   - id (text, PK)
   - name, base_adults, base_kids, max_adults, max_children, total_quantity
   - room_ids (text[]) — denormalized list of room IDs
   - description, created_at

2. rooms — Individual hotel rooms
   - id (text, PK)
   - label (room number), category_id (FK→categories)
   - type, floor, base_rate (bigint UZS), status (Clean/Dirty/Inspected/Maintenance)

3. tariffs — Rate plans linked to categories
   - id, name, category_id (FK), cancellation, meal_plan, meal_cost, daily_rate, min_stay, active

4. extra_services — Add-on services
   - id, name, unit_price, calc_type (One-Time/Per Night/Per Person), vat, active

5. bookings — Reservation records
   - id, room_id (FK), guest_name, guest_country
   - check_in_date (date), check_out_date (date)
   - status (Confirmed/Checked-in/Pending/Checked-out/Blocked)
   - total_price (bigint), channel, phone, tariff_id (FK nullable)
   - payment_status (Paid/Partial/Unpaid), service_ids (text[])
   - adults, children, created_at

6. guests — Individual guest records per booking
   - id, booking_id (FK CASCADE), full_name, guest_type (adult/child), phone

## Security
- RLS enabled on all tables.
- All tables allow anon + authenticated full CRUD (single-tenant, no-auth app).
- USING (true) is intentional: data is intentionally shared within this single-tenant app.

## Indexes
- rooms.category_id, bookings.room_id, bookings.check_in_date, bookings.check_out_date
- guests.booking_id, tariffs.category_id
*/

-- ── categories ──
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  base_adults int NOT NULL DEFAULT 2,
  base_kids int NOT NULL DEFAULT 1,
  max_adults int NOT NULL DEFAULT 3,
  max_children int NOT NULL DEFAULT 2,
  total_quantity int NOT NULL DEFAULT 0,
  room_ids text[] NOT NULL DEFAULT '{}',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- ── rooms ──
CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  label text NOT NULL,
  category_id text NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type text NOT NULL DEFAULT '',
  floor int NOT NULL DEFAULT 1,
  base_rate bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Clean' CHECK (status IN ('Clean','Dirty','Inspected','Maintenance')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_rooms" ON rooms;
CREATE POLICY "anon_select_rooms" ON rooms FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_rooms" ON rooms;
CREATE POLICY "anon_insert_rooms" ON rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_rooms" ON rooms;
CREATE POLICY "anon_update_rooms" ON rooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_rooms" ON rooms;
CREATE POLICY "anon_delete_rooms" ON rooms FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category_id);

-- ── tariffs ──
CREATE TABLE IF NOT EXISTS tariffs (
  id text PRIMARY KEY,
  name text NOT NULL,
  category_id text NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  cancellation text NOT NULL DEFAULT 'Flexible',
  meal_plan text NOT NULL DEFAULT 'None',
  meal_cost bigint NOT NULL DEFAULT 0,
  daily_rate bigint NOT NULL DEFAULT 0,
  min_stay int NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_tariffs" ON tariffs;
CREATE POLICY "anon_select_tariffs" ON tariffs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tariffs" ON tariffs;
CREATE POLICY "anon_insert_tariffs" ON tariffs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tariffs" ON tariffs;
CREATE POLICY "anon_update_tariffs" ON tariffs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tariffs" ON tariffs;
CREATE POLICY "anon_delete_tariffs" ON tariffs FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_tariffs_category ON tariffs(category_id);

-- ── extra_services ──
CREATE TABLE IF NOT EXISTS extra_services (
  id text PRIMARY KEY,
  name text NOT NULL,
  unit_price bigint NOT NULL DEFAULT 0,
  calc_type text NOT NULL DEFAULT 'One-Time' CHECK (calc_type IN ('One-Time','Per Night','Per Person')),
  vat int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE extra_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_services" ON extra_services;
CREATE POLICY "anon_select_services" ON extra_services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_services" ON extra_services;
CREATE POLICY "anon_insert_services" ON extra_services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_services" ON extra_services;
CREATE POLICY "anon_update_services" ON extra_services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_services" ON extra_services;
CREATE POLICY "anon_delete_services" ON extra_services FOR DELETE TO anon, authenticated USING (true);

-- ── bookings ──
CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  guest_name text NOT NULL,
  guest_country text NOT NULL DEFAULT '-',
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  status text NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed','Checked-in','Pending','Checked-out','Blocked')),
  total_price bigint NOT NULL DEFAULT 0,
  channel text NOT NULL DEFAULT 'Direct',
  phone text NOT NULL DEFAULT '',
  tariff_id text REFERENCES tariffs(id) ON DELETE SET NULL,
  payment_status text NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid','Partial','Unpaid')),
  service_ids text[] NOT NULL DEFAULT '{}',
  adults int NOT NULL DEFAULT 1,
  children int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_checkout ON bookings(check_out_date);

-- ── guests ──
CREATE TABLE IF NOT EXISTS guests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  guest_type text NOT NULL DEFAULT 'adult' CHECK (guest_type IN ('adult','child')),
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_guests" ON guests;
CREATE POLICY "anon_select_guests" ON guests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_guests" ON guests;
CREATE POLICY "anon_insert_guests" ON guests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_guests" ON guests;
CREATE POLICY "anon_update_guests" ON guests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_guests" ON guests;
CREATE POLICY "anon_delete_guests" ON guests FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_guests_booking ON guests(booking_id);