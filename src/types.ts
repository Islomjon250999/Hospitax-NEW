// ---- Shared domain types for HospitaX multi-tenant platform ----

export type ViewMode = 'admin' | 'client';
export type AdminTab = 'overview' | 'tenants' | 'billing' | 'settings';
export type ClientTab = 'pms' | 'chm' | 'be';
export type PmsSubTab = 'shaxmatka' | 'roomtypes' | 'tariffs' | 'services';

export type SubscriptionPlan = 'Basic' | 'Pro' | 'Enterprise';
export type PropertyStatus = 'Active' | 'Trial' | 'Suspended' | 'Onboarding';
export type City = 'Tashkent' | 'Samarkand' | 'Bukhara' | 'Khiva' | 'Tashkent Region';

export interface Property {
  id: string;
  name: string;
  type: 'Hotel' | 'Boutique Hotel' | 'Hostel' | 'Resort' | 'Guesthouse';
  city: City;
  rooms: number;
  plan: SubscriptionPlan;
  status: PropertyStatus;
  mrr: number; // monthly recurring revenue in USD
  createdAt: string;
  admin: string;
  phone: string;
  email: string;
}

export type BookingStatus = 'Confirmed' | 'Checked-in' | 'Pending' | 'Checked-out' | 'Blocked';

export type RoomStatus = 'Clean' | 'Dirty' | 'Inspected' | 'Maintenance';

export interface RoomCategory {
  id: string;
  name: string;
  baseAdults: number;
  baseKids: number;
  totalQuantity: number;
  roomIds: string[]; // assigned room ids
  description?: string;
}

export interface Room {
  id: string;
  label: string;
  categoryId: string;
  type: string;
  floor: number;
  baseRate: number; // UZS per night
  status: RoomStatus;
}

export type CancellationPolicy = 'Flexible' | 'Moderate' | 'Strict' | 'Non-Refundable';
export type MealPlan = 'None' | 'Breakfast' | 'Half Board' | 'Full Board';

export interface Tariff {
  id: string;
  name: string;
  categoryId: string;
  cancellation: CancellationPolicy;
  mealPlan: MealPlan;
  mealCost: number; // UZS per person per night
  dailyRate: number; // UZS per night
  minStay: number; // nights
  active: boolean;
}

export type ServiceCalcType = 'Per Night' | 'Per Person' | 'One-Time';

export interface ExtraService {
  id: string;
  name: string;
  unitPrice: number; // UZS
  calcType: ServiceCalcType;
  vat: number; // %
  active: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  guestName: string;
  guestCountry: string;
  startOffset: number;
  nights: number;
  status: BookingStatus;
  total: number; // UZS
  channel: string;
  phone: string;
  tariffId?: string;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  serviceIds?: string[];
}

export interface Channel {
  id: string;
  name: string;
  initials: string;
  color: string; // tailwind bg class
  textColor: string;
  region: string;
  connected: boolean;
  syncActive: boolean;
  rateParity: number;
  lastSyncMin: number;
  listings: number;
  bookings30d: number;
  commission: number; // %
}

export interface BookingEngineRoom {
  id: string;
  name: string;
  desc: string;
  price: number;
  capacity: number;
  size: number;
  beds: string;
  image: string;
  amenities: string[];
  available: number;
}

export interface Invoice {
  id: string;
  propertyId: string;
  propertyName: string;
  amount: number; // USD
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  plan: SubscriptionPlan;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'booking' | 'sync' | 'billing' | 'system';
}

export interface SystemService {
  name: string;
  status: 'Operational' | 'Degraded' | 'Maintenance';
  uptime: number;
  latencyMs: number;
}
