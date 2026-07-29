/*
# Add Unassigned Bookings from Public Website

1. New Data
- Adds several "unassigned" bookings to the `bookings` table. These represent bookings
  that arrived from the public booking widget (website) but have not yet been assigned
  to a specific room. They use `room_id = 'unassigned'` as a sentinel value.

2. Important Notes
- These bookings have tariffs linked to specific room categories, so the chessboard
  can display them in the "Ne naznachonniy / Unassigned" row of the correct category.
- The bookings table does NOT have a foreign key constraint that would prevent
  room_id='unassigned' since the FK is on rooms.id and 'unassigned' won't match.
  We insert with the FK column but the value won't reference a real room.
  Actually, since there IS a FK constraint (bookings_room_id_fkey → rooms.id),
  we need to create an 'unassigned' room record first, OR we need to make
  the room_id nullable. Let's create a placeholder room instead.
*/

-- Create a placeholder "unassigned" room that unassigned bookings can reference
INSERT INTO rooms (id, label, category_id, type, floor, base_rate, status)
VALUES ('unassigned', 'Unassigned', 'cat1', 'Unassigned', 0, 0, 'Maintenance')
ON CONFLICT (id) DO NOTHING;

-- Add unassigned bookings (from public website, not yet assigned to a real room)
INSERT INTO bookings (id, room_id, guest_name, guest_country, check_in_date, check_out_date, status, total_price, channel, phone, tariff_id, payment_status, service_ids, adults, children) VALUES
  ('b_un1', 'unassigned', 'Daniyar Akhmetov', 'Kazakhstan', (CURRENT_DATE + 1)::text::date, (CURRENT_DATE + 4)::text::date, 'Pending', 2340000, 'Direct', '+7 701 555 12 34', 't3', 'Unpaid', '{}', 2, 0),
  ('b_un2', 'unassigned', 'Maria Garcia', 'Spain', (CURRENT_DATE + 2)::text::date, (CURRENT_DATE + 5)::text::date, 'Pending', 1560000, 'Direct', '+34 600 123 456', 't1', 'Unpaid', '{}', 2, 1),
  ('b_un3', 'unassigned', 'Rustam Nazarov', 'Uzbekistan', (CURRENT_DATE + 3)::text::date, (CURRENT_DATE + 6)::text::date, 'Pending', 4050000, 'Direct', '+998 90 333 22 11', 't5', 'Partial', '{}', 3, 1),
  ('b_un4', 'unassigned', 'Chen Wei', 'China', (CURRENT_DATE)::text::date, (CURRENT_DATE + 2)::text::date, 'Pending', 960000, 'Direct', '+86 139 0011 2233', 't2', 'Unpaid', '{}', 1, 0)
ON CONFLICT (id) DO NOTHING;
