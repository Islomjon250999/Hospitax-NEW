import { supabase } from './supabase';
import type { Hotel, StaffAccount, ConnectionRequest, UserRole } from '../types';

interface HotelRow {
  id: string;
  name: string;
  type: string;
  city: string;
  rooms_count: number;
  plan: string;
  status: string;
  mrr: number;
  admin_name: string;
  phone: string;
  email: string;
  address: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
}

interface StaffRow {
  id: string;
  hotel_id: string | null;
  full_name: string;
  email: string;
  role: string;
  phone: string;
  active: boolean;
  created_at: string;
}

interface RequestRow {
  id: string;
  hotel_name: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  room_count: number;
  message: string;
  status: string;
  created_at: string;
}

function mapHotel(r: HotelRow): Hotel {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    city: r.city,
    roomsCount: r.rooms_count,
    plan: r.plan,
    status: r.status,
    mrr: Number(r.mrr),
    adminName: r.admin_name,
    phone: r.phone,
    email: r.email,
    address: r.address,
    subscriptionStatus: r.subscription_status,
    trialEndsAt: r.trial_ends_at,
    createdAt: r.created_at,
  };
}

function mapStaff(r: StaffRow): StaffAccount {
  return {
    id: r.id,
    hotelId: r.hotel_id,
    fullName: r.full_name,
    email: r.email,
    role: r.role as UserRole,
    phone: r.phone,
    active: r.active,
  };
}

function mapRequest(r: RequestRow): ConnectionRequest {
  return {
    id: r.id,
    hotelName: r.hotel_name,
    contactName: r.contact_name,
    phone: r.phone,
    email: r.email,
    city: r.city,
    roomCount: r.room_count,
    message: r.message,
    status: r.status as ConnectionRequest['status'],
    createdAt: r.created_at,
  };
}

// ── Hotels CRUD ──
export async function loadHotels(): Promise<Hotel[]> {
  const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as HotelRow[]).map(mapHotel);
}

export async function createHotel(h: Omit<Hotel, 'id' | 'createdAt'>): Promise<Hotel> {
  const id = 'p' + Date.now().toString(36);
  const row = {
    id,
    name: h.name,
    type: h.type,
    city: h.city,
    rooms_count: h.roomsCount,
    plan: h.plan,
    status: h.status,
    mrr: h.mrr,
    admin_name: h.adminName,
    phone: h.phone,
    email: h.email,
    address: h.address,
    subscription_status: h.subscriptionStatus,
    trial_ends_at: h.trialEndsAt,
  };
  const { error } = await supabase.from('hotels').insert(row);
  if (error) throw error;
  return mapHotel({ ...row, created_at: new Date().toISOString() } as HotelRow);
}

export async function updateHotel(id: string, updates: Partial<Hotel>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.city !== undefined) row.city = updates.city;
  if (updates.roomsCount !== undefined) row.rooms_count = updates.roomsCount;
  if (updates.plan !== undefined) row.plan = updates.plan;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.mrr !== undefined) row.mrr = updates.mrr;
  if (updates.adminName !== undefined) row.admin_name = updates.adminName;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.address !== undefined) row.address = updates.address;
  if (updates.subscriptionStatus !== undefined) row.subscription_status = updates.subscriptionStatus;
  if (updates.trialEndsAt !== undefined) row.trial_ends_at = updates.trialEndsAt;
  const { error } = await supabase.from('hotels').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteHotel(id: string): Promise<void> {
  const { error } = await supabase.from('hotels').delete().eq('id', id);
  if (error) throw error;
}

// ── Staff CRUD ──
export async function loadStaff(): Promise<StaffAccount[]> {
  const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as StaffRow[]).map(mapStaff);
}

export async function createStaff(s: Omit<StaffAccount, 'id'>): Promise<StaffAccount> {
  const id = 'staff_' + Date.now().toString(36);
  const row = {
    id,
    hotel_id: s.hotelId,
    full_name: s.fullName,
    email: s.email,
    role: s.role,
    phone: s.phone,
    active: s.active,
  };
  const { error } = await supabase.from('staff').insert(row);
  if (error) throw error;
  return mapStaff({ ...row, created_at: new Date().toISOString() } as StaffRow);
}

export async function updateStaff(id: string, updates: Partial<StaffAccount>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.hotelId !== undefined) row.hotel_id = updates.hotelId;
  if (updates.fullName !== undefined) row.full_name = updates.fullName;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.role !== undefined) row.role = updates.role;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.active !== undefined) row.active = updates.active;
  const { error } = await supabase.from('staff').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteStaff(id: string): Promise<void> {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw error;
}

// ── Connection Requests ──
export async function loadConnectionRequests(): Promise<ConnectionRequest[]> {
  const { data, error } = await supabase.from('connection_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RequestRow[]).map(mapRequest);
}

export async function createConnectionRequest(r: Omit<ConnectionRequest, 'id' | 'createdAt' | 'status'>): Promise<void> {
  const row = {
    hotel_name: r.hotelName,
    contact_name: r.contactName,
    phone: r.phone,
    email: r.email,
    city: r.city,
    room_count: r.roomCount,
    message: r.message,
    status: 'New',
  };
  const { error } = await supabase.from('connection_requests').insert(row);
  if (error) throw error;
}

export async function updateRequestStatus(id: string, status: ConnectionRequest['status']): Promise<void> {
  const { error } = await supabase.from('connection_requests').update({ status }).eq('id', id);
  if (error) throw error;
}
