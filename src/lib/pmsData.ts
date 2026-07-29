import { supabase } from './supabase';
import { todayISO, addDaysISO, nightsBetween } from '../utils';
import type {
  RoomCategory,
  Room,
  Tariff,
  ExtraService,
  Booking,
  BookingGuest,
  BookingStatus,
  RoomStatus,
} from '../types';

// ── Row types from Supabase ──
interface CategoryRow {
  id: string;
  name: string;
  base_adults: number;
  base_kids: number;
  max_adults: number;
  max_children: number;
  total_quantity: number;
  room_ids: string[];
  description: string | null;
}
interface RoomRow {
  id: string;
  label: string;
  category_id: string;
  type: string;
  floor: number;
  base_rate: number;
  status: string;
}
interface TariffRow {
  id: string;
  name: string;
  category_id: string;
  cancellation: string;
  meal_plan: string;
  meal_cost: number;
  daily_rate: number;
  min_stay: number;
  active: boolean;
}
interface ServiceRow {
  id: string;
  name: string;
  unit_price: number;
  calc_type: string;
  vat: number;
  active: boolean;
}
interface BookingRow {
  id: string;
  room_id: string;
  guest_name: string;
  guest_country: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
  channel: string;
  phone: string;
  tariff_id: string | null;
  payment_status: string;
  service_ids: string[];
  adults: number;
  children: number;
}
interface GuestRow {
  id: string;
  booking_id: string;
  full_name: string;
  guest_type: 'adult' | 'child';
  phone: string;
}

// ── Mappers: DB rows → app types ──
function mapCategory(r: CategoryRow): RoomCategory {
  return {
    id: r.id,
    name: r.name,
    baseAdults: r.base_adults,
    baseKids: r.base_kids,
    maxAdults: r.max_adults,
    maxChildren: r.max_children,
    totalQuantity: r.total_quantity,
    roomIds: r.room_ids ?? [],
    description: r.description ?? undefined,
  };
}

function mapRoom(r: RoomRow): Room {
  return {
    id: r.id,
    label: r.label,
    categoryId: r.category_id,
    type: r.type,
    floor: r.floor,
    baseRate: r.base_rate,
    status: r.status as RoomStatus,
  };
}

function mapTariff(r: TariffRow): Tariff {
  return {
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    cancellation: r.cancellation as Tariff['cancellation'],
    mealPlan: r.meal_plan as Tariff['mealPlan'],
    mealCost: r.meal_cost,
    dailyRate: r.daily_rate,
    minStay: r.min_stay,
    active: r.active,
  };
}

function mapService(r: ServiceRow): ExtraService {
  return {
    id: r.id,
    name: r.name,
    unitPrice: r.unit_price,
    calcType: r.calc_type as ExtraService['calcType'],
    vat: r.vat,
    active: r.active,
  };
}

function mapBooking(r: BookingRow): Booking {
  const startOffset = nightsBetween(todayISO(), r.check_in_date);
  return {
    id: r.id,
    roomId: r.room_id,
    guestName: r.guest_name,
    guestCountry: r.guest_country,
    startOffset,
    nights: nightsBetween(r.check_in_date, r.check_out_date),
    status: r.status as BookingStatus,
    total: r.total_price,
    channel: r.channel,
    phone: r.phone,
    tariffId: r.tariff_id ?? undefined,
    paymentStatus: r.payment_status as Booking['paymentStatus'],
    serviceIds: r.service_ids ?? [],
    adults: r.adults,
    children: r.children,
  };
}

function mapGuests(bookingId: string, rows: GuestRow[]): BookingGuest[] {
  return rows
    .filter((g) => g.booking_id === bookingId)
    .map((g) => ({ name: g.full_name, type: g.guest_type }));
}

// ── Full data load ──
export interface PmsData {
  rooms: Room[];
  categories: RoomCategory[];
  bookings: Booking[];
  tariffs: Tariff[];
  services: ExtraService[];
}

export async function loadPmsData(): Promise<PmsData> {
  const [catRes, roomRes, tariffRes, svcRes, bookRes, guestRes] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('rooms').select('*'),
    supabase.from('tariffs').select('*'),
    supabase.from('extra_services').select('*'),
    supabase.from('bookings').select('*'),
    supabase.from('guests').select('*'),
  ]);

  if (catRes.error) throw catRes.error;
  if (roomRes.error) throw roomRes.error;
  if (tariffRes.error) throw tariffRes.error;
  if (svcRes.error) throw svcRes.error;
  if (bookRes.error) throw bookRes.error;
  if (guestRes.error) throw guestRes.error;

  const guests = (guestRes.data ?? []) as GuestRow[];
  const bookings = ((bookRes.data ?? []) as BookingRow[]).map((b) => {
    const base = mapBooking(b);
    const g = mapGuests(b.id, guests);
    return g.length > 0 ? { ...base, guests: g } : base;
  });

  return {
    categories: ((catRes.data ?? []) as CategoryRow[]).map(mapCategory),
    rooms: ((roomRes.data ?? []) as RoomRow[]).map(mapRoom),
    tariffs: ((tariffRes.data ?? []) as TariffRow[]).map(mapTariff),
    services: ((svcRes.data ?? []) as ServiceRow[]).map(mapService),
    bookings,
  };
}

// ── Availability query ──
// Returns the set of room IDs that are NOT available for the given date range.
// A room is unavailable if it has ANY booking whose dates overlap:
//   existing.check_in_date < requested.check_out_date AND existing.check_out_date > requested.check_in_date
export async function getUnavailableRoomIds(
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string,
): Promise<Set<string>> {
  let q = supabase
    .from('bookings')
    .select('room_id')
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn)
    .neq('status', 'Checked-out');
  if (excludeBookingId) q = q.neq('id', excludeBookingId);
  const { data, error } = await q;
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.room_id as string));
}

// ── Booking CRUD ──
export interface BookingInput {
  guestName: string;
  guestCountry: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  total: number;
  channel: string;
  phone: string;
  tariffId?: string;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  serviceIds: string[];
  adults: number;
  children: number;
  guests: BookingGuest[];
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const id = 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const row = {
    id,
    room_id: input.roomId,
    guest_name: input.guestName,
    guest_country: input.guestCountry,
    check_in_date: input.checkInDate,
    check_out_date: input.checkOutDate,
    status: input.status,
    total_price: input.total,
    channel: input.channel,
    phone: input.phone,
    tariff_id: input.tariffId ?? null,
    payment_status: input.paymentStatus,
    service_ids: input.serviceIds,
    adults: input.adults,
    children: input.children,
  };
  const { error } = await supabase.from('bookings').insert(row);
  if (error) throw error;

  if (input.guests.length > 0) {
    const guestRows = input.guests.map((g, i) => ({
      id: id + '_g' + i,
      booking_id: id,
      full_name: g.name,
      guest_type: g.type,
      phone: input.phone,
    }));
    const { error: gErr } = await supabase.from('guests').insert(guestRows);
    if (gErr) throw gErr;
  }

  return mapBooking(row as BookingRow);
}

export async function updateBooking(id: string, input: BookingInput): Promise<Booking> {
  const row = {
    room_id: input.roomId,
    guest_name: input.guestName,
    guest_country: input.guestCountry,
    check_in_date: input.checkInDate,
    check_out_date: input.checkOutDate,
    status: input.status,
    total_price: input.total,
    channel: input.channel,
    phone: input.phone,
    tariff_id: input.tariffId ?? null,
    payment_status: input.paymentStatus,
    service_ids: input.serviceIds,
    adults: input.adults,
    children: input.children,
  };
  const { error } = await supabase.from('bookings').update(row).eq('id', id);
  if (error) throw error;

  // Replace guests
  await supabase.from('guests').delete().eq('booking_id', id);
  if (input.guests.length > 0) {
    const guestRows = input.guests.map((g, i) => ({
      id: id + '_g' + i,
      booking_id: id,
      full_name: g.name,
      guest_type: g.type,
      phone: input.phone,
    }));
    const { error: gErr } = await supabase.from('guests').insert(guestRows);
    if (gErr) throw gErr;
  }

  return mapBooking({ ...row, id, guest_country: input.guestCountry } as BookingRow);
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function updateRoomStatus(id: string, status: RoomStatus): Promise<void> {
  const { error } = await supabase.from('rooms').update({ status }).eq('id', id);
  if (error) throw error;
}

// ── Room CRUD ──
export async function createRoom(room: Room): Promise<Room> {
  const row = {
    id: room.id,
    label: room.label,
    category_id: room.categoryId,
    type: room.type,
    floor: room.floor,
    base_rate: room.baseRate,
    status: room.status,
  };
  const { error } = await supabase.from('rooms').insert(row);
  if (error) throw error;
  return room;
}

export async function updateRoom(room: Room): Promise<Room> {
  const row = {
    label: room.label,
    category_id: room.categoryId,
    type: room.type,
    floor: room.floor,
    base_rate: room.baseRate,
    status: room.status,
  };
  const { error } = await supabase.from('rooms').update(row).eq('id', room.id);
  if (error) throw error;
  return room;
}

export async function deleteRoom(id: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw error;
}

// ── Category CRUD ──
export async function createCategory(cat: RoomCategory): Promise<RoomCategory> {
  const row = {
    id: cat.id,
    name: cat.name,
    base_adults: cat.baseAdults,
    base_kids: cat.baseKids,
    max_adults: cat.maxAdults,
    max_children: cat.maxChildren,
    total_quantity: cat.totalQuantity,
    room_ids: cat.roomIds,
    description: cat.description ?? null,
  };
  const { error } = await supabase.from('categories').insert(row);
  if (error) throw error;
  return cat;
}

export async function updateCategory(cat: RoomCategory): Promise<RoomCategory> {
  const row = {
    name: cat.name,
    base_adults: cat.baseAdults,
    base_kids: cat.baseKids,
    max_adults: cat.maxAdults,
    max_children: cat.maxChildren,
    total_quantity: cat.totalQuantity,
    room_ids: cat.roomIds,
    description: cat.description ?? null,
  };
  const { error } = await supabase.from('categories').update(row).eq('id', cat.id);
  if (error) throw error;
  return cat;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ── Tariff CRUD ──
export async function createTariff(tariff: Tariff): Promise<Tariff> {
  const row = {
    id: tariff.id,
    name: tariff.name,
    category_id: tariff.categoryId,
    cancellation: tariff.cancellation,
    meal_plan: tariff.mealPlan,
    meal_cost: tariff.mealCost,
    daily_rate: tariff.dailyRate,
    min_stay: tariff.minStay,
    active: tariff.active,
  };
  const { error } = await supabase.from('tariffs').insert(row);
  if (error) throw error;
  return tariff;
}

export async function updateTariff(tariff: Tariff): Promise<Tariff> {
  const row = {
    name: tariff.name,
    category_id: tariff.categoryId,
    cancellation: tariff.cancellation,
    meal_plan: tariff.mealPlan,
    meal_cost: tariff.mealCost,
    daily_rate: tariff.dailyRate,
    min_stay: tariff.minStay,
    active: tariff.active,
  };
  const { error } = await supabase.from('tariffs').update(row).eq('id', tariff.id);
  if (error) throw error;
  return tariff;
}

export async function deleteTariff(id: string): Promise<void> {
  const { error } = await supabase.from('tariffs').delete().eq('id', id);
  if (error) throw error;
}

// ── Extra Service CRUD ──
export async function createService(svc: ExtraService): Promise<ExtraService> {
  const row = {
    id: svc.id,
    name: svc.name,
    unit_price: svc.unitPrice,
    calc_type: svc.calcType,
    vat: svc.vat,
    active: svc.active,
  };
  const { error } = await supabase.from('extra_services').insert(row);
  if (error) throw error;
  return svc;
}

export async function updateService(svc: ExtraService): Promise<ExtraService> {
  const row = {
    name: svc.name,
    unit_price: svc.unitPrice,
    calc_type: svc.calcType,
    vat: svc.vat,
    active: svc.active,
  };
  const { error } = await supabase.from('extra_services').update(row).eq('id', svc.id);
  if (error) throw error;
  return svc;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('extra_services').delete().eq('id', id);
  if (error) throw error;
}

// Re-export utilities used by callers
export { todayISO, addDaysISO };
