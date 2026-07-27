import type {
  Property,
  Room,
  RoomCategory,
  Tariff,
  ExtraService,
  Booking,
  Channel,
  BookingEngineRoom,
  SystemService,
  Invoice,
  AppNotification,
} from './types';

// ---- Super Admin: properties ----
export const properties: Property[] = [
  { id: 'p1', name: 'Tashkent Grand Hotel', type: 'Hotel', city: 'Tashkent', rooms: 184, plan: 'Enterprise', status: 'Active', mrr: 480, createdAt: '2023-02-12', admin: 'Akmal Rakhimov', phone: '+998 71 120 45 67', email: 'akmal@grandhotel.uz' },
  { id: 'p2', name: 'Registan Boutique Samarkand', type: 'Boutique Hotel', city: 'Samarkand', rooms: 42, plan: 'Pro', status: 'Active', mrr: 180, createdAt: '2023-04-08', admin: 'Dilnoza Karimova', phone: '+998 66 233 11 22', email: 'info@registan.uz' },
  { id: 'p3', name: 'Bukhara Silk Road Inn', type: 'Hotel', city: 'Bukhara', rooms: 68, plan: 'Pro', status: 'Active', mrr: 210, createdAt: '2023-06-21', admin: 'Sardor Yusupov', phone: '+998 65 222 33 44', email: 'sardor@silkroad.uz' },
  { id: 'p4', name: 'Khiva Citadel Guesthouse', type: 'Guesthouse', city: 'Khiva', rooms: 18, plan: 'Basic', status: 'Active', mrr: 60, createdAt: '2023-09-03', admin: 'Madina Tosheva', phone: '+998 62 345 67 89', email: 'madina@citadel.uz' },
  { id: 'p5', name: 'Tashkent City Capsule Hostel', type: 'Hostel', city: 'Tashkent', rooms: 56, plan: 'Basic', status: 'Trial', mrr: 0, createdAt: '2024-01-15', admin: 'Bekzod Aliyev', phone: '+998 90 555 12 34', email: 'bekzod@capsule.uz' },
  { id: 'p6', name: 'Amir Timur Plaza Hotel', type: 'Hotel', city: 'Tashkent', rooms: 124, plan: 'Enterprise', status: 'Active', mrr: 420, createdAt: '2022-11-30', admin: 'Nodira Islamova', phone: '+998 71 200 80 90', email: 'nodira@amirtimur.uz' },
  { id: 'p7', name: 'Samarkand Regal Resort & Spa', type: 'Resort', city: 'Samarkand', rooms: 96, plan: 'Enterprise', status: 'Active', mrr: 360, createdAt: '2023-07-18', admin: 'Jasur Makhmudov', phone: '+998 66 900 11 00', email: 'jasur@regalresort.uz' },
  { id: 'p8', name: 'Charvak Lakeside Resort', type: 'Resort', city: 'Tashkent Region', rooms: 58, plan: 'Pro', status: 'Onboarding', mrr: 0, createdAt: '2024-02-20', admin: 'Gulnara Ergasheva', phone: '+998 97 777 88 99', email: 'gulnara@charvak.uz' },
  { id: 'p9', name: 'Bukhara Minara Boutique', type: 'Boutique Hotel', city: 'Bukhara', rooms: 28, plan: 'Basic', status: 'Suspended', mrr: 0, createdAt: '2023-12-05', admin: 'Rustam Sobirov', phone: '+998 65 111 22 33', email: 'rustam@minara.uz' },
  { id: 'p10', name: 'Tashkent Modern Business Hotel', type: 'Hotel', city: 'Tashkent', rooms: 110, plan: 'Pro', status: 'Active', mrr: 240, createdAt: '2023-03-14', admin: 'Aziza Yusupova', phone: '+998 71 140 50 60', email: 'aziza@modern.uz' },
  { id: 'p11', name: 'Samarkand Old Town Hostel', type: 'Hostel', city: 'Samarkand', rooms: 40, plan: 'Basic', status: 'Active', mrr: 70, createdAt: '2023-08-22', admin: 'Otabek Tursunov', phone: '+998 66 456 78 90', email: 'otabek@oldtown.uz' },
  { id: 'p12', name: 'Khiva Oasis Guesthouse', type: 'Guesthouse', city: 'Khiva', rooms: 14, plan: 'Basic', status: 'Active', mrr: 50, createdAt: '2024-01-08', admin: 'Lola Nazarova', phone: '+998 62 678 90 12', email: 'lola@oasis.uz' },
];

// ---- PMS: room categories ----
export const roomCategories: RoomCategory[] = [
  { id: 'cat1', name: 'Standard King', baseAdults: 2, baseKids: 1, totalQuantity: 2, roomIds: ['r1', 'r2'], description: 'Cozy room with a king-size bed and city view.' },
  { id: 'cat2', name: 'Deluxe Twin', baseAdults: 2, baseKids: 2, totalQuantity: 2, roomIds: ['r3', 'r4'], description: 'Spacious twin room with premium bedding.' },
  { id: 'cat3', name: 'Executive Suite', baseAdults: 3, baseKids: 2, totalQuantity: 2, roomIds: ['r5', 'r6'], description: 'Elegant suite with separate living room.' },
  { id: 'cat4', name: 'VIP Villa', baseAdults: 6, baseKids: 4, totalQuantity: 2, roomIds: ['r7', 'r8'], description: 'Luxurious standalone villa with private pool.' },
];

// ---- PMS: rooms (linked to categories) ----
export const rooms: Room[] = [
  { id: 'r1', label: '101', categoryId: 'cat1', type: 'Standard', floor: 1, baseRate: 480000, status: 'Clean' },
  { id: 'r2', label: '102', categoryId: 'cat1', type: 'Standard', floor: 1, baseRate: 480000, status: 'Dirty' },
  { id: 'r3', label: '103', categoryId: 'cat2', type: 'Deluxe', floor: 1, baseRate: 720000, status: 'Clean' },
  { id: 'r4', label: '201', categoryId: 'cat2', type: 'Deluxe', floor: 2, baseRate: 720000, status: 'Inspected' },
  { id: 'r5', label: '202', categoryId: 'cat3', type: 'Suite', floor: 2, baseRate: 1200000, status: 'Clean' },
  { id: 'r6', label: '203', categoryId: 'cat3', type: 'Suite', floor: 2, baseRate: 1200000, status: 'Maintenance' },
  { id: 'r7', label: 'Villa 1', categoryId: 'cat4', type: 'Villa', floor: 0, baseRate: 2400000, status: 'Clean' },
  { id: 'r8', label: 'Villa 2', categoryId: 'cat4', type: 'Villa', floor: 0, baseRate: 2400000, status: 'Clean' },
];

// ---- PMS: tariffs / rate plans ----
export const tariffs: Tariff[] = [
  { id: 't1', name: 'Standard Flex with Breakfast', categoryId: 'cat1', cancellation: 'Flexible', mealPlan: 'Breakfast', mealCost: 45000, dailyRate: 520000, minStay: 1, active: true },
  { id: 't2', name: 'Non-Refundable Promo', categoryId: 'cat1', cancellation: 'Non-Refundable', mealPlan: 'None', mealCost: 0, dailyRate: 420000, minStay: 2, active: true },
  { id: 't3', name: 'Deluxe Flex', categoryId: 'cat2', cancellation: 'Flexible', mealPlan: 'Breakfast', mealCost: 55000, dailyRate: 780000, minStay: 1, active: true },
  { id: 't4', name: 'Corporate Rate', categoryId: 'cat2', cancellation: 'Moderate', mealPlan: 'Breakfast', mealCost: 55000, dailyRate: 690000, minStay: 1, active: true },
  { id: 't5', name: 'Suite Half Board', categoryId: 'cat3', cancellation: 'Moderate', mealPlan: 'Half Board', mealCost: 110000, dailyRate: 1350000, minStay: 2, active: true },
  { id: 't6', name: 'VIP All-Inclusive', categoryId: 'cat4', cancellation: 'Strict', mealPlan: 'Full Board', mealCost: 180000, dailyRate: 2800000, minStay: 2, active: true },
];

// ---- PMS: extra services ----
export const extraServices: ExtraService[] = [
  { id: 's1', name: 'Airport Transfer', unitPrice: 150000, calcType: 'One-Time', vat: 12, active: true },
  { id: 's2', name: 'Buffet Breakfast', unitPrice: 55000, calcType: 'Per Person', vat: 12, active: true },
  { id: 's3', name: 'Laundry Service', unitPrice: 35000, calcType: 'One-Time', vat: 12, active: true },
  { id: 's4', name: 'Spa Access', unitPrice: 120000, calcType: 'Per Night', vat: 12, active: true },
  { id: 's5', name: 'Extra Bed', unitPrice: 90000, calcType: 'Per Night', vat: 12, active: true },
  { id: 's6', name: 'Late Check-out', unitPrice: 60000, calcType: 'One-Time', vat: 12, active: true },
];

// ---- PMS: bookings (with tariff & payment) ----
export const bookings: Booking[] = [
  { id: 'b1', roomId: 'r1', guestName: 'Andrey Volkov', guestCountry: 'Russia', startOffset: 0, nights: 3, status: 'Checked-in', total: 1560000, channel: 'Booking.com', phone: '+7 905 123 45 67', tariffId: 't1', paymentStatus: 'Paid', serviceIds: ['s2'] },
  { id: 'b2', roomId: 'r2', guestName: 'Li Wei', guestCountry: 'China', startOffset: 1, nights: 2, status: 'Confirmed', total: 840000, channel: 'Agoda', phone: '+86 138 0013 8000', tariffId: 't2', paymentStatus: 'Partial', serviceIds: [] },
  { id: 'b3', roomId: 'r3', guestName: 'Sarah Mitchell', guestCountry: 'UK', startOffset: -1, nights: 5, status: 'Checked-in', total: 3900000, channel: 'Direct', phone: '+44 7700 900123', tariffId: 't3', paymentStatus: 'Paid', serviceIds: ['s2', 's4'] },
  { id: 'b4', roomId: 'r4', guestName: 'Yusuf Demir', guestCountry: 'Turkey', startOffset: 2, nights: 4, status: 'Pending', total: 2760000, channel: 'Expedia', phone: '+90 532 123 45 67', tariffId: 't4', paymentStatus: 'Unpaid', serviceIds: [] },
  { id: 'b5', roomId: 'r5', guestName: 'Hans Müller', guestCountry: 'Germany', startOffset: 0, nights: 7, status: 'Checked-in', total: 9450000, channel: 'Booking.com', phone: '+49 151 23456789', tariffId: 't5', paymentStatus: 'Paid', serviceIds: ['s2', 's4', 's5'] },
  { id: 'b6', roomId: 'r6', guestName: 'Aziz Karimov', guestCountry: 'Uzbekistan', startOffset: -3, nights: 6, status: 'Checked-out', total: 8100000, channel: 'Direct', phone: '+998 90 123 45 67', tariffId: 't5', paymentStatus: 'Paid', serviceIds: ['s2'] },
  { id: 'b7', roomId: 'r7', guestName: 'Elena Rossi', guestCountry: 'Italy', startOffset: 1, nights: 5, status: 'Confirmed', total: 14000000, channel: 'Trip.com', phone: '+39 333 1234567', tariffId: 't6', paymentStatus: 'Partial', serviceIds: ['s1', 's2', 's4'] },
  { id: 'b8', roomId: 'r8', guestName: 'James Park', guestCountry: 'South Korea', startOffset: 3, nights: 3, status: 'Pending', total: 8400000, channel: 'Airbnb', phone: '+82 10 1234 5678', tariffId: 't6', paymentStatus: 'Unpaid', serviceIds: ['s1'] },
  { id: 'b9', roomId: 'r1', guestName: 'Fatima Al-Sayed', guestCountry: 'UAE', startOffset: 4, nights: 2, status: 'Confirmed', total: 1040000, channel: 'Direct', phone: '+971 50 123 4567', tariffId: 't1', paymentStatus: 'Paid', serviceIds: ['s2', 's3'] },
  { id: 'b10', roomId: 'r3', guestName: 'Olga Petrova', guestCountry: 'Kazakhstan', startOffset: 6, nights: 3, status: 'Confirmed', total: 2340000, channel: 'Booking.com', phone: '+7 701 123 45 67', tariffId: 't3', paymentStatus: 'Partial', serviceIds: ['s2'] },
  { id: 'b11', roomId: 'r2', guestName: 'Maintenance', guestCountry: '-', startOffset: -1, nights: 2, status: 'Blocked', total: 0, channel: 'Direct', phone: '-', paymentStatus: 'Unpaid', serviceIds: [] },
];

// ---- Channel Manager: 9 channels ----
export const channels: Channel[] = [
  { id: 'c1', name: 'Booking.com', initials: 'B', color: 'bg-blue-600', textColor: 'text-white', region: 'Global', connected: true, syncActive: true, rateParity: 98.4, lastSyncMin: 3, listings: 184, bookings30d: 412, commission: 15 },
  { id: 'c2', name: 'Airbnb', initials: 'Ab', color: 'bg-rose-500', textColor: 'text-white', region: 'Global', connected: true, syncActive: true, rateParity: 95.1, lastSyncMin: 8, listings: 36, bookings30d: 87, commission: 3 },
  { id: 'c3', name: 'Agoda', initials: 'Ag', color: 'bg-rose-600', textColor: 'text-white', region: 'Asia-Pacific', connected: true, syncActive: true, rateParity: 96.7, lastSyncMin: 5, listings: 184, bookings30d: 156, commission: 17 },
  { id: 'c4', name: 'Expedia', initials: 'Ex', color: 'bg-amber-500', textColor: 'text-white', region: 'Global', connected: true, syncActive: false, rateParity: 89.2, lastSyncMin: 142, listings: 184, bookings30d: 64, commission: 18 },
  { id: 'c5', name: 'Trip.com', initials: 'Tc', color: 'bg-sky-500', textColor: 'text-white', region: 'Asia-Pacific', connected: true, syncActive: true, rateParity: 94.3, lastSyncMin: 6, listings: 184, bookings30d: 118, commission: 15 },
  { id: 'c6', name: 'Ostrovok.ru', initials: 'Os', color: 'bg-orange-500', textColor: 'text-white', region: 'CIS / Russia', connected: true, syncActive: true, rateParity: 97.2, lastSyncMin: 4, listings: 184, bookings30d: 203, commission: 12 },
  { id: 'c7', name: 'Bronevik', initials: 'Br', color: 'bg-red-700', textColor: 'text-white', region: 'CIS / Russia', connected: true, syncActive: false, rateParity: 91.0, lastSyncMin: 88, listings: 184, bookings30d: 41, commission: 12 },
  { id: 'c8', name: 'Hotelios', initials: 'Ht', color: 'bg-teal-500', textColor: 'text-white', region: 'Central Asia', connected: false, syncActive: false, rateParity: 0, lastSyncMin: 0, listings: 0, bookings30d: 0, commission: 8 },
  { id: 'c9', name: 'Mybooking', initials: 'My', color: 'bg-violet-500', textColor: 'text-white', region: 'Central Asia', connected: false, syncActive: false, rateParity: 0, lastSyncMin: 0, listings: 0, bookings30d: 0, commission: 10 },
];

// ---- Booking Engine ----
export const engineRooms: BookingEngineRoom[] = [
  {
    id: 'e1',
    name: 'Standard Double Room',
    desc: 'Cozy room with a city view, perfect for business or leisure travelers.',
    price: 480000,
    capacity: 2,
    size: 24,
    beds: '1 Queen bed',
    image: 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1200',
    amenities: ['Free WiFi', 'Air conditioning', 'Smart TV', 'Mini bar', 'City view'],
    available: 12,
  },
  {
    id: 'e2',
    name: 'Deluxe Twin Room',
    desc: 'Spacious twin room with premium bedding and a sitting area.',
    price: 720000,
    capacity: 2,
    size: 32,
    beds: '2 Single beds',
    image: 'https://images.pexels.com/photos/3144580/pexels-photo-3144580.jpeg?auto=compress&cs=tinysrgb&w=1200',
    amenities: ['Free WiFi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Work desk', 'Garden view'],
    available: 8,
  },
  {
    id: 'e3',
    name: 'Executive Suite',
    desc: 'Elegant suite with a separate living room and panoramic city views.',
    price: 1200000,
    capacity: 3,
    size: 48,
    beds: '1 King bed + sofa bed',
    image: 'https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg?auto=compress&cs=tinysrgb&w=1200',
    amenities: ['Free WiFi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Living area', 'Panoramic view', 'Espresso machine'],
    available: 5,
  },
  {
    id: 'e4',
    name: 'Private Villa with Pool',
    desc: 'Luxurious standalone villa with a private pool and terrace.',
    price: 2400000,
    capacity: 6,
    size: 120,
    beds: '3 King beds',
    image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=1200',
    amenities: ['Private pool', 'Free WiFi', 'Air conditioning', 'Smart TV', 'Full kitchen', 'Terrace', 'Garden', 'Daily housekeeping'],
    available: 2,
  },
];

// ---- Invoices ----
export const invoices: Invoice[] = [
  { id: 'INV-2024-0142', propertyId: 'p1', propertyName: 'Tashkent Grand Hotel', amount: 480, status: 'Paid', date: '2024-07-01', plan: 'Enterprise' },
  { id: 'INV-2024-0141', propertyId: 'p6', propertyName: 'Amir Timur Plaza Hotel', amount: 420, status: 'Paid', date: '2024-07-01', plan: 'Enterprise' },
  { id: 'INV-2024-0140', propertyId: 'p7', propertyName: 'Samarkand Regal Resort & Spa', amount: 360, status: 'Pending', date: '2024-07-05', plan: 'Enterprise' },
  { id: 'INV-2024-0139', propertyId: 'p10', propertyName: 'Tashkent Modern Business Hotel', amount: 240, status: 'Pending', date: '2024-07-08', plan: 'Pro' },
  { id: 'INV-2024-0138', propertyId: 'p3', propertyName: 'Bukhara Silk Road Inn', amount: 210, status: 'Paid', date: '2024-07-01', plan: 'Pro' },
  { id: 'INV-2024-0137', propertyId: 'p2', propertyName: 'Registan Boutique Samarkand', amount: 180, status: 'Paid', date: '2024-07-01', plan: 'Pro' },
  { id: 'INV-2024-0136', propertyId: 'p11', propertyName: 'Samarkand Old Town Hostel', amount: 70, status: 'Overdue', date: '2024-06-15', plan: 'Basic' },
  { id: 'INV-2024-0135', propertyId: 'p4', propertyName: 'Khiva Citadel Guesthouse', amount: 60, status: 'Paid', date: '2024-07-01', plan: 'Basic' },
];

// ---- Notifications ----
export const notifications: AppNotification[] = [
  { id: 'n1', title: 'New booking received', body: 'Elena Rossi booked Villa 1 for 5 nights via Trip.com', time: '5 min ago', read: false, type: 'booking' },
  { id: 'n2', title: 'Channel sync completed', body: 'Booking.com synced 184 listings — 98.4% rate parity', time: '12 min ago', read: false, type: 'sync' },
  { id: 'n3', title: 'Invoice paid', body: 'INV-2024-0142 — Tashkent Grand Hotel — $480', time: '1 hour ago', read: false, type: 'billing' },
  { id: 'n4', title: 'Rate parity alert', body: 'Expedia rate parity dropped to 89.2% — action needed', time: '3 hours ago', read: true, type: 'sync' },
  { id: 'n5', title: 'New property onboarded', body: 'Charvak Lakeside Resort joined the platform', time: 'Yesterday', read: true, type: 'system' },
];

// ---- System health ----
export const systemServices: SystemService[] = [
  { name: 'API Gateway', status: 'Operational', uptime: 99.98, latencyMs: 42 },
  { name: 'PMS Core', status: 'Operational', uptime: 99.95, latencyMs: 58 },
  { name: 'Channel Sync Engine', status: 'Operational', uptime: 99.89, latencyMs: 120 },
  { name: 'Booking Engine CDN', status: 'Operational', uptime: 99.99, latencyMs: 18 },
  { name: 'Payments (Uzcard/Humo)', status: 'Degraded', uptime: 98.72, latencyMs: 340 },
  { name: 'Notifications (SMS/Telegram)', status: 'Operational', uptime: 99.91, latencyMs: 210 },
];

export const mrrSeries = [
  { month: 'Jan', value: 82000 },
  { month: 'Feb', value: 95400 },
  { month: 'Mar', value: 108200 },
  { month: 'Apr', value: 121600 },
  { month: 'May', value: 138900 },
  { month: 'Jun', value: 154300 },
  { month: 'Jul', value: 172800 },
];

export const occupancySeries = [
  { day: 'Mon', value: 68 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 74 },
  { day: 'Thu', value: 81 },
  { day: 'Fri', value: 89 },
  { day: 'Sat', value: 94 },
  { day: 'Sun', value: 85 },
];

export const channelMix = [
  { name: 'Booking.com', value: 38, color: '#2563eb' },
  { name: 'Direct', value: 24, color: '#4f46e5' },
  { name: 'Ostrovok.ru', value: 12, color: '#f97316' },
  { name: 'Trip.com', value: 10, color: '#0ea5e9' },
  { name: 'Agoda', value: 8, color: '#e11d48' },
  { name: 'Airbnb', value: 5, color: '#f43f5e' },
  { name: 'Expedia', value: 3, color: '#f59e0b' },
];
