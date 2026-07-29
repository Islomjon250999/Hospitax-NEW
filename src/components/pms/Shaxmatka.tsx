import { useMemo, useState, useRef, useEffect, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Calendar,
  Plus,
  Search,
  Filter,
  BedDouble,
  CheckCircle2,
  UserCheck,
  DoorOpen,
  Trash2,
  TrendingUp,
  Users,
  Baby,
  LogIn,
  LogOut,
  Eye,
  AlertCircle,
  AlertTriangle,
  Inbox,
} from 'lucide-react';
import type { Booking, BookingGuest, BookingStatus, Room, RoomCategory, Tariff, ExtraService, RoomStatus } from '../../types';
import { UZS, UZS_SHORT, formatDate, pct, todayISO, addDaysISO, nightsBetween, prettyDate, hasDateConflict, exceedsCapacity, exceedsBase, type CurrencyLang } from '../../utils';
import { Modal } from '../ui';
import { useToast } from '../../toast';
import { useLang } from '../../i18n';
import { GroupBookingModal } from './GroupBookingModal';
import { EditBookingModal } from './EditBookingModal';
import { createBooking, updateBooking, deleteBooking as dbDeleteBooking, updateBookingStatus, updateRoomStatus, type BookingInput } from '../../lib/pmsData';
import { useRoomAvailability } from '../../lib/useAvailability';

const DAYS = 14;

const BAR_H = 34;
const BAR_GAP = 6;
const BAR_PAD = 8;
const ROW_MIN_H = 56;

interface LaneResult {
  lanes: Map<string, number>;
  count: number;
}

function assignLanes(bookings: Booking[]): LaneResult {
  const sorted = [...bookings].sort(
    (a, b) => a.startOffset - b.startOffset || (a.startOffset + a.nights) - (b.startOffset + b.nights),
  );
  const laneEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const b of sorted) {
    const end = b.startOffset + b.nights;
    let lane = laneEnds.findIndex((e) => e <= b.startOffset);
    if (lane === -1) {
      laneEnds.push(end);
      lane = laneEnds.length - 1;
    } else {
      laneEnds[lane] = end;
    }
    lanes.set(b.id, lane);
  }
  return { lanes, count: laneEnds.length };
}

let bookingCounter = 200;

interface PmsData {
  rooms: Room[];
  categories: RoomCategory[];
  bookings: Booking[];
  tariffs: Tariff[];
  services: ExtraService[];
}

export function Shaxmatka({
  data,
  onReload,
}: {
  data: PmsData;
  onReload: () => void;
}) {
  const { lang, t } = useLang();
  const [startOffset, setStartOffset] = useState(0);
  const _lang = lang as CurrencyLang;
  const [selected, setSelected] = useState<Booking | null>(null);
  const [quickBooking, setQuickBooking] = useState<{ roomId: string; dayOffset: number; nights: number } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [hoveredTip, setHoveredTip] = useState<{
    booking: Booking;
    rect: DOMRect;
    placement: 'above' | 'below';
    tariff?: Tariff;
  } | null>(null);
  const [showInhouse, setShowInhouse] = useState(false);
  const [showArrivals, setShowArrivals] = useState(false);
  const [showDepartures, setShowDepartures] = useState(false);
  const [dragStart, setDragStart] = useState<{ roomId: string; dayOffset: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ roomId: string; dayOffset: number } | null>(null);
  const [groupBooking, setGroupBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [statusMenuRoomId, setStatusMenuRoomId] = useState<string | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<DOMRect | null>(null);
  const quickBookingRef = useRef<{ submit: () => void; canSubmit: boolean } | null>(null);
  const toast = useToast();

    const statusStyle: Record<BookingStatus, { bar: string; chip: string; labelKey: string; ring: string }> = {
    'Confirmed': { bar: 'bg-emerald-500', chip: 'text-emerald-700 bg-emerald-50', labelKey: 'status_confirmed', ring: 'ring-emerald-500/30' },
    'Checked-in': { bar: 'bg-indigo-500', chip: 'text-indigo-700 bg-indigo-50', labelKey: 'status_checkedIn', ring: 'ring-indigo-500/30' },
    'Pending': { bar: 'bg-amber-500', chip: 'text-amber-700 bg-amber-50', labelKey: 'status_pending', ring: 'ring-amber-500/30' },
    'Checked-out': { bar: 'bg-slate-400', chip: 'text-slate-600 bg-slate-100', labelKey: 'status_checkedOut', ring: 'ring-slate-400/30' },
    'Blocked': { bar: 'bg-rose-500', chip: 'text-rose-700 bg-rose-50', labelKey: 'status_blocked', ring: 'ring-rose-500/30' },
  };

  const paymentStyle: Record<string, { chip: string; labelKey: string }> = {
    Paid: { chip: 'text-emerald-700 bg-emerald-50', labelKey: 'pay_paid' },
    Partial: { chip: 'text-amber-700 bg-amber-50', labelKey: 'pay_partial' },
    Unpaid: { chip: 'text-rose-700 bg-rose-50', labelKey: 'pay_unpaid' },
  };

  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => formatDate(startOffset + i, _lang)), [startOffset, _lang]);
  const todayIndex = startOffset <= 0 ? -startOffset : -1;

  const visibleRooms = useMemo(() => {
    let r = data.rooms.filter((room) => room.id !== 'unassigned');
    if (filterCategory !== 'all') r = r.filter((room) => room.categoryId === filterCategory);
    return r;
  }, [data.rooms, filterCategory]);

  const visibleBookings = useMemo(() => {
    let b = data.bookings.filter(
      (bk) => bk.startOffset + bk.nights > startOffset && bk.startOffset < startOffset + DAYS,
    );
    if (filterStatus !== 'all') b = b.filter((bk) => bk.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      b = b.filter((bk) => {
        const room = data.rooms.find((r) => r.id === bk.roomId);
        return bk.guestName.toLowerCase().includes(q) || (room?.label.toLowerCase().includes(q) ?? false);
      });
    }
    return b;
  }, [data.bookings, startOffset, filterStatus, search, data.rooms]);

  const groupedRooms = useMemo(() => {
    const map = new Map<string, Room[]>();
    for (const room of visibleRooms) {
      const arr = map.get(room.categoryId) ?? [];
      arr.push(room);
      map.set(room.categoryId, arr);
    }
    return data.categories
      .filter((c) => map.has(c.id))
      .map((c) => ({ category: c, rooms: map.get(c.id)! }));
  }, [visibleRooms, data.categories]);

  // Unassigned bookings grouped by category (via tariff → categoryId)
  const unassignedByCategory = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of data.bookings) {
      if (b.roomId !== 'unassigned') continue;
      const tariff = data.tariffs.find((tm) => tm.id === b.tariffId);
      const catId = tariff?.categoryId;
      if (!catId) continue;
      if (filterCategory !== 'all' && catId !== filterCategory) continue;
      if (b.startOffset + b.nights <= startOffset || b.startOffset >= startOffset + DAYS) continue;
      const arr = map.get(catId) ?? [];
      arr.push(b);
      map.set(catId, arr);
    }
    return map;
  }, [data.bookings, data.tariffs, filterCategory, startOffset]);

  // Available rooms count per day (across all visible rooms)
  const availablePerDay = useMemo(() => {
    return days.map((_, i) => {
      const dayOffset = startOffset + i;
      const occupied = new Set<string>();
      for (const b of data.bookings) {
        if (b.roomId === 'unassigned') continue;
        if (b.startOffset <= dayOffset && dayOffset < b.startOffset + b.nights) {
          occupied.add(b.roomId);
        }
      }
      return visibleRooms.length - occupied.size;
    });
  }, [days, startOffset, data.bookings, visibleRooms]);

  const inhouseBookings = data.bookings.filter(
    (b) => b.status === 'Checked-in' && b.startOffset <= 0 && b.startOffset + b.nights > 0,
  );
  const arrivalBookings = data.bookings.filter(
    (b) => b.startOffset === 0 && b.status !== 'Blocked' && b.status !== 'Checked-in',
  );
  const departureBookings = data.bookings.filter(
    (b) => b.startOffset + b.nights === 0 && b.status === 'Checked-in',
  );
  const inhouseGuests = inhouseBookings.length;
  const occupancy = Math.round((inhouseBookings.length / data.rooms.length) * 100);
  const occupiedRooms = new Set(inhouseBookings.map((b) => b.roomId)).size;
  const occupancyRate = data.rooms.length > 0 ? Math.round((occupiedRooms / data.rooms.length) * 100) : 0;

  const addBooking = async (b: Omit<Booking, 'id'>) => {
    const checkInDate = addDaysISO(todayISO(), b.startOffset);
    const checkOutDate = addDaysISO(checkInDate, b.nights);
    const input: BookingInput = {
      guestName: b.guestName,
      guestCountry: b.guestCountry,
      roomId: b.roomId,
      checkInDate,
      checkOutDate,
      status: b.status,
      total: b.total,
      channel: b.channel,
      phone: b.phone,
      tariffId: b.tariffId,
      paymentStatus: b.paymentStatus,
      serviceIds: b.serviceIds ?? [],
      adults: b.adults ?? 1,
      children: b.children ?? 0,
      guests: b.guests ?? [],
    };
    try {
      await createBooking(input);
      await onReload();
      toast(`${t('qb_create')}: ${b.guestName}`, 'success');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      await onReload();
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
      toast(`${t('bd_updateStatus')}: ${t(statusStyle[status].labelKey)}`, 'success');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await dbDeleteBooking(id);
      await onReload();
      setSelected(null);
      toast(t('bd_cancel'), 'info');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const isCellOccupied = (roomId: string, dayOffset: number) =>
    data.bookings.some(
      (b) => b.roomId === roomId && b.startOffset <= dayOffset && dayOffset < b.startOffset + b.nights,
    );

  const roomStatusDot = (status: Room['status']) => {
    const map: Record<string, string> = {
      Clean: 'bg-emerald-400',
      Dirty: 'bg-amber-400',
      Inspected: 'bg-sky-400',
      Maintenance: 'bg-rose-400',
    };
    return <span className={`h-2 w-2 rounded-full ${map[status] ?? 'bg-ink-300'} shrink-0`} title={t(`room_${status.toLowerCase()}`)} />;
  };

  return (
    <div className="space-y-5">
      {/* ---- KPI summary widgets ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* In-house guests */}
        <div className="card p-5 group hover:shadow-float transition-all duration-200 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-50/60" />
          <div className="relative">
            <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-ink-900 tabular">{inhouseGuests} <span className="text-sm font-medium text-ink-400">{t('kpi_inhouse_guests')}</span></p>
          <p className="text-sm font-medium text-ink-500 mt-1">{t('kpi_inhouse')}</p>
          <button
            onClick={() => setShowInhouse(true)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            <Eye size={13} /> {t('kpi_viewList')}
          </button>
        </div>

        {/* Expected check-ins */}
        <div className="card p-5 group hover:shadow-float transition-all duration-200 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-50/60" />
          <div className="relative">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LogIn size={20} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-ink-900 tabular">{arrivalBookings.length} <span className="text-sm font-medium text-ink-400">{t('kpi_expectedIn_brn')}</span></p>
          <p className="text-sm font-medium text-ink-500 mt-1">{t('kpi_expectedIn')}</p>
          <button
            onClick={() => setShowArrivals(true)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            <Eye size={13} /> {t('kpi_viewArrivals')}
          </button>
        </div>

        {/* Expected check-outs */}
        <div className="card p-5 group hover:shadow-float transition-all duration-200 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-50/60" />
          <div className="relative">
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <LogOut size={20} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-ink-900 tabular">{departureBookings.length} <span className="text-sm font-medium text-ink-400">{t('kpi_expectedOut_brn')}</span></p>
          <p className="text-sm font-medium text-ink-500 mt-1">{t('kpi_expectedOut')}</p>
          <button
            onClick={() => setShowDepartures(true)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors"
          >
            <Eye size={13} /> {t('kpi_viewDepartures')}
          </button>
        </div>

        {/* Rooms & Occupancy */}
        <div className="card p-5 group hover:shadow-float transition-all duration-200 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-50/60" />
          <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full z-10">{t('admin_systemStatus')}</span>
          <div className="relative">
            <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <BedDouble size={20} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-ink-900 tabular">{data.rooms.length} <span className="text-sm font-medium text-ink-400">{t('kpi_totalRooms')}</span></p>
          <div className="mt-1 space-y-0.5">
            <p className="text-sm font-medium text-ink-500">{occupiedRooms} <span className="text-ink-400">{t('kpi_occupiedRooms')}</span></p>
            <p className="text-sm font-medium text-ink-500">{pct(occupancyRate)} <span className="text-ink-400">{t('kpi_occupancyRate')}</span></p>
          </div>
        </div>
      </div>

      {/* ---- Controls bar ---- */}
      <div className="card p-4 flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('shax_searchGuest')}
              className="input !py-2 !pl-9"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input !py-2 w-auto">
            <option value="all">{t('shax_allRoomTypes')}</option>
            {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input !py-2 w-auto">
            <option value="all">{t('shax_allStatuses')}</option>
            {(Object.keys(statusStyle) as BookingStatus[]).map((s) => <option key={s} value={s}>{t(statusStyle[s].labelKey)}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button onClick={() => setStartOffset((s) => s - 7)} className="btn-secondary h-9 w-9 !p-0"><ChevronLeft size={16} /></button>
            <button onClick={() => setStartOffset(0)} className="btn-secondary px-3 py-2 text-xs">{t('shax_today')}</button>
            <button onClick={() => setStartOffset((s) => s + 7)} className="btn-secondary h-9 w-9 !p-0"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <button
            onClick={() => setQuickBooking({ roomId: '', dayOffset: 0, nights: 1 })}
            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap"
          >
            <Plus size={14} /> {t('qb_title')}
          </button>
          <button
            onClick={() => setGroupBooking(true)}
            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold text-ink-700 bg-ink-100 rounded-lg hover:bg-ink-200 transition-colors whitespace-nowrap"
          >
            <Users size={14} /> {t('gb_title')}
          </button>
        </div>
      </div>

      {/* ---- Tape chart ---- */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap border-b border-ink-100">
          <div className="flex items-center gap-1 text-xs text-ink-400">
            <CalendarDays size={14} /> {days[0].dow} {days[0].day} {days[0].month} — {days[DAYS - 1].dow} {days[DAYS - 1].day} {days[DAYS - 1].month}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {(Object.keys(statusStyle) as BookingStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <span className={`h-2.5 w-2.5 rounded-sm ${statusStyle[s].bar}`} /> {t(statusStyle[s].labelKey)}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto grid-no-scrollbar">
          <div className="min-w-[1000px]">
            {/* header row */}
            <div className="grid sticky top-0 z-20 bg-white" style={{ gridTemplateColumns: `240px repeat(${DAYS}, 1fr)` }}>
              <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-400 border-r border-ink-100 sticky left-0 z-10 bg-white">
                {t('shax_room')}
              </div>
              {days.map((d, i) => (
                <div key={i} className={`px-1 py-2 text-center border-r border-ink-50 ${i === todayIndex ? 'bg-indigo-50/60' : ''}`}>
                  <p className="text-[10px] font-semibold uppercase text-ink-400">{d.dow}</p>
                  <p className={`text-sm font-bold tabular ${i === todayIndex ? 'text-indigo-600' : 'text-ink-700'}`}>{d.day}</p>
                </div>
              ))}
            </div>

            {/* Available rooms summary row */}
            <div className="grid bg-emerald-50/40 border-b border-emerald-100" style={{ gridTemplateColumns: `240px repeat(${DAYS}, 1fr)` }}>
              <div className="px-4 py-2 sticky left-0 z-10 bg-emerald-50/40 flex items-center gap-2 border-r border-ink-100">
                <DoorOpen size={13} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">{t('shax_available')}</span>
              </div>
              {availablePerDay.map((count, i) => (
                <div key={i} className={`px-1 py-2 text-center border-r border-emerald-50 ${i === todayIndex ? 'bg-indigo-50/30' : ''}`}>
                  <span className={`text-sm font-bold tabular ${count > 0 ? 'text-emerald-600' : 'text-rose-400'}`}>{count}</span>
                </div>
              ))}
            </div>

            {/* grouped room rows */}
            {groupedRooms.map(({ category, rooms: catRooms }) => {
              const unassigned = unassignedByCategory.get(category.id) ?? [];
              return (
              <div key={category.id}>
                <div className="grid bg-ink-50/60 border-y border-ink-100" style={{ gridTemplateColumns: `240px repeat(${DAYS}, 1fr)` }}>
                  <div className="px-4 py-2 sticky left-0 z-10 bg-ink-50/60 flex items-center gap-2 border-r border-ink-100">
                    <Filter size={12} className="text-indigo-500" />
                    <span className="text-xs font-bold text-ink-700">{category.name}</span>
                    <span className="text-[10px] text-ink-400">({catRooms.length})</span>
                  </div>
                  <div style={{ gridColumn: '2 / -1' }} />
                </div>

                {/* Unassigned bookings row (from public website) */}
                {unassigned.length > 0 && (
                  <div className="relative grid border-b border-amber-100 bg-amber-50/30" style={{ gridTemplateColumns: `240px repeat(${DAYS}, 1fr)`, height: '40px' }}>
                    <div className="sticky left-0 z-10 bg-amber-50/30 px-3 border-r border-ink-100 flex items-center gap-2">
                      <Inbox size={14} className="text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-amber-700 block leading-tight">{t('shax_unassigned')}</span>
                        <span className="text-[9px] text-amber-500">{unassigned.length} {t('shax_fromWebsite')}</span>
                      </div>
                    </div>
                    <div className="relative w-full" style={{ gridColumn: '2 / -1', display: 'grid', gridTemplateColumns: `repeat(${DAYS}, 1fr)`, gridTemplateRows: '100%', overflow: 'hidden' }}>
                      {unassigned.map((b) => {
                        const visStart = startOffset;
                        const visEnd = startOffset + DAYS;
                        const bookStart = b.startOffset;
                        const bookEnd = b.startOffset + b.nights;
                        if (bookEnd <= visStart || bookStart >= visEnd) return null;
                        const displayStart = Math.max(bookStart, visStart);
                        const displayEnd = Math.min(bookEnd, visEnd);
                        const colStart = displayStart - visStart + 1;
                        const span = displayEnd - displayStart;
                        return (
                          <div key={b.id} className="relative h-full" style={{ gridColumn: `${colStart} / span ${span}`, gridRow: 1 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingBooking(b); }}
                              className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-7 flex items-center px-3 bg-gradient-to-r from-amber-400 to-orange-400 text-xs text-white font-medium rounded-lg shadow-sm overflow-hidden whitespace-nowrap hover:brightness-110 hover:shadow-md transition-all ring-1 ring-amber-300 cursor-pointer"
                            >
                              <span className="truncate">{b.guestName}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {catRooms.map((room) => {
                  const roomBookings = visibleBookings.filter((b) => b.roomId === room.id);
                  const { lanes, count } = assignLanes(roomBookings);
                  const rowH = Math.max(ROW_MIN_H, count * (BAR_H + BAR_GAP) + BAR_PAD * 2);
                  const laneBlockH = count > 0 ? count * BAR_H + (count - 1) * BAR_GAP : 0;
                  const laneOffset = (rowH - laneBlockH) / 2;
                  return (
                    <div key={room.id} className="relative grid border-b border-ink-50 hover:bg-ink-50/30 transition-colors" style={{ gridTemplateColumns: `240px repeat(${DAYS}, 1fr)`, height: `${rowH}px` }}>
                      <div className="sticky left-0 z-10 bg-inherit px-3 border-r border-ink-100 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <BedDouble size={14} className="text-ink-400 shrink-0" />
                          <span className="text-sm font-semibold text-ink-800 whitespace-nowrap">{room.label}</span>
                          <span className="text-xs text-ink-300 shrink-0">·</span>
                          <span className="text-xs font-medium text-ink-500 truncate">{category.name}</span>
                        </div>
                        <div className="shrink-0">
                          <button
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-ink-100 transition-colors text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (statusMenuRoomId === room.id) {
                                setStatusMenuRoomId(null);
                                setStatusMenuAnchor(null);
                              } else {
                                setStatusMenuAnchor(e.currentTarget.getBoundingClientRect());
                                setStatusMenuRoomId(room.id);
                              }
                            }}
                          >
                            {roomStatusDot(room.status)}
                            <span className="text-[10px] text-ink-500 hidden lg:inline">{t(`room_${room.status.toLowerCase()}`)}</span>
                          </button>
                        </div>
                      </div>
                      <div className="relative w-full" style={{ gridColumn: '2 / -1', display: 'grid', gridTemplateColumns: `repeat(${DAYS}, 1fr)`, gridTemplateRows: '100%', overflow: 'hidden' }}>
                        {days.map((_, i) => {
                          const dayOffset = startOffset + i;
                          const isInSelection = dragStart && dragEnd && 
                            Math.min(dragStart.dayOffset, dragEnd.dayOffset) <= dayOffset &&
                            dayOffset <= Math.max(dragStart.dayOffset, dragEnd.dayOffset) &&
                            dragStart.roomId === room.id;
                          return (
                            <button
                              key={i}
                              style={{ gridColumn: i + 1, gridRow: 1 }}
                              onMouseDown={() => {
                                if (isCellOccupied(room.id, dayOffset)) return;
                                setDragStart({ roomId: room.id, dayOffset });
                              }}
                              onMouseEnter={() => {
                                if (dragStart?.roomId === room.id && !isCellOccupied(room.id, dayOffset)) {
                                  setDragEnd({ roomId: room.id, dayOffset });
                                }
                              }}
                              onMouseUp={() => {
                                if (dragStart && dragEnd && dragStart.roomId === room.id) {
                                  const checkIn = Math.min(dragStart.dayOffset, dragEnd.dayOffset);
                                  const checkOut = Math.max(dragStart.dayOffset, dragEnd.dayOffset) + 1;
                                  setQuickBooking({ roomId: room.id, dayOffset: checkIn, nights: checkOut - checkIn });
                                  setTimeout(() => {
                                    setDragStart(null);
                                    setDragEnd(null);
                                  }, 50);
                                }
                              }}
                              onClick={() => {
                                if (isCellOccupied(room.id, dayOffset)) return;
                                setQuickBooking({ roomId: room.id, dayOffset, nights: 1 });
                                setDragStart(null);
                                setDragEnd(null);
                              }}
                              className={`relative overflow-hidden z-0 border-r border-ink-50 transition-colors h-full ${
                                isCellOccupied(room.id, dayOffset)
                                  ? 'cursor-not-allowed bg-ink-50/20'
                                  : `cursor-pointer ${i === todayIndex ? 'bg-indigo-50/20' : ''} ${
                                      isInSelection ? 'bg-indigo-100/60' : 'hover:bg-indigo-50/40'
                                    }`
                              }`}
                              aria-label={`Book room ${room.label} on day ${dayOffset}`}
                            />
                          );
                        })}
                        {roomBookings.map((b) => {
                          const visStart = startOffset;
                          const visEnd = startOffset + DAYS;
                          const bookStart = b.startOffset;
                          const bookEnd = b.startOffset + b.nights;
                          if (bookEnd <= visStart || bookStart >= visEnd) return null;
                          const displayStart = Math.max(bookStart, visStart);
                          const displayEnd = Math.min(bookEnd, visEnd);
                          const colStart = displayStart - visStart + 1;
                          const span = displayEnd - displayStart;
                          const st = statusStyle[b.status];
                          const tariff = data.tariffs.find((tm) => tm.id === b.tariffId);
                          const lane = lanes.get(b.id) ?? 0;
                          return (
                            <div key={b.id} className="relative h-full" style={{ gridColumn: `${colStart} / span ${span}`, gridRow: 1 }}>
                              <div className="absolute inset-x-1 z-10" style={{ top: `${laneOffset + lane * (BAR_H + BAR_GAP)}px`, height: `${BAR_H}px` }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setHoveredTip(null); setEditingBooking(b); }}
                                  onMouseEnter={(e) => {
                                    if (statusMenuRoomId) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const spaceBelow = window.innerHeight - rect.bottom;
                                    const placement: 'above' | 'below' =
                                      rect.top > window.innerHeight * 0.5 || spaceBelow < 250 ? 'above' : 'below';
                                    setHoveredTip({ booking: b, rect, placement, tariff });
                                  }}
                                  onMouseLeave={() => setHoveredTip(null)}
                                  className={`w-full h-full flex items-center px-3 py-1.5 ${st.bar} text-xs text-white font-medium rounded-lg shadow-sm overflow-hidden whitespace-nowrap hover:brightness-110 hover:shadow-md transition-all ring-1 ${st.ring} cursor-pointer`}
                                >
                                  <span className="truncate">{b.guestName} — {t(st.labelKey)}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Booking detail modal ---- */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={t('bd_title')} size="lg" icon={<BedDouble size={18} className="text-indigo-600" />}>
        {selected && (
          <BookingDetail
            b={selected}
            rooms={data.rooms}
            tariffs={data.tariffs}
            services={data.services}
            onUpdate={updateStatus}
            onDelete={deleteBooking}
          />
        )}
      </Modal>

      {/* ---- Quick booking modal ---- */}
      <Modal
        open={!!quickBooking}
        onClose={() => setQuickBooking(null)}
        title={t('qb_title')}
        size="lg"
        icon={<Plus size={18} className="text-indigo-600" />}
        footer={
          quickBooking ? (
            <>
              <button onClick={() => setQuickBooking(null)} className="btn-secondary px-5 py-2.5 text-sm">{t('qb_cancel')}</button>
              <button onClick={() => quickBookingRef.current?.submit()} disabled={!quickBookingRef.current?.canSubmit} className="btn-success px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={15} /> {t('qb_create')}
              </button>
            </>
          ) : null
        }
      >
        {quickBooking && (
          <QuickBookingForm
            ref={quickBookingRef}
            roomId={quickBooking.roomId}
            dayOffset={quickBooking.dayOffset}
            nights={quickBooking.nights}
            rooms={data.rooms}
            tariffs={data.tariffs}
            services={data.services}
            categories={data.categories}
            existingBookings={data.bookings}
            onAdd={addBooking}
          />
        )}
      </Modal>

      {/* ---- Group Booking Modal ---- */}
      <GroupBookingModal
        open={groupBooking}
        onClose={() => setGroupBooking(false)}
        rooms={data.rooms}
        categories={data.categories}
        tariffs={data.tariffs}
        existingBookings={data.bookings}
        lang={lang}
        onSubmit={async (bookings) => {
          for (const booking of bookings) {
            await addBooking({
              guestName: booking.guestName,
              guestCountry: 'Uzbekistan',
              startOffset: booking.startOffset,
              nights: booking.nights,
              status: 'Confirmed',
              roomId: booking.roomId,
              channel: 'Direct',
              phone: booking.phoneNumber || '+998 90 000 00 00',
              tariffId: booking.tariffId,
              total: booking.total,
              paymentStatus: booking.paymentStatus,
              adults: booking.adults,
              children: booking.children,
              guests: booking.guests,
            });
          }
          setGroupBooking(false);
          toast(`${bookings.length} ${t('qb_create').toLowerCase()}`, 'success');
        }}
      />

      {/* ---- In-house guests modal ---- */}
      <Modal open={showInhouse} onClose={() => setShowInhouse(false)} title={t('kpi_inhouse')} size="md" icon={<Users size={18} className="text-indigo-600" />}>
        <GuestListModal bookings={inhouseBookings} rooms={data.rooms} emptyText={t('kpi_inhouse')} />
      </Modal>

      {/* ---- Arrivals modal ---- */}
      <Modal open={showArrivals} onClose={() => setShowArrivals(false)} title={t('kpi_expectedIn')} size="md" icon={<LogIn size={18} className="text-emerald-600" />}>
        <GuestListModal bookings={arrivalBookings} rooms={data.rooms} emptyText={t('kpi_expectedIn')} />
      </Modal>

      {/* ---- Departures modal ---- */}
      <Modal open={showDepartures} onClose={() => setShowDepartures(false)} title={t('kpi_expectedOut')} size="md" icon={<LogOut size={18} className="text-amber-600" />}>
        <GuestListModal bookings={departureBookings} rooms={data.rooms} emptyText={t('kpi_expectedOut')} showPayment />
      </Modal>

      {/* ---- Edit Booking Modal ---- */}
      <EditBookingModal
        open={!!editingBooking}
        onClose={() => setEditingBooking(null)}
        booking={editingBooking}
        rooms={data.rooms}
        categories={data.categories}
        tariffs={data.tariffs}
        services={data.services}
        existingBookings={data.bookings}
        lang={lang}
        onSubmit={async (updatedBooking) => {
          try {
            const checkInDate = addDaysISO(todayISO(), updatedBooking.startOffset);
            const checkOutDate = addDaysISO(checkInDate, updatedBooking.nights);
            await updateBooking(updatedBooking.id, {
              guestName: updatedBooking.guestName,
              guestCountry: updatedBooking.guestCountry,
              roomId: updatedBooking.roomId,
              checkInDate,
              checkOutDate,
              status: updatedBooking.status,
              total: updatedBooking.total,
              channel: updatedBooking.channel,
              phone: updatedBooking.phone,
              tariffId: updatedBooking.tariffId,
              paymentStatus: updatedBooking.paymentStatus,
              serviceIds: updatedBooking.serviceIds ?? [],
              adults: updatedBooking.adults ?? 1,
              children: updatedBooking.children ?? 0,
              guests: updatedBooking.guests ?? [],
            });
            await onReload();
            setEditingBooking(null);
            toast(t('gen_save'), 'success');
          } catch {
            toast(t('gen_error'), 'error');
          }
        }}
      />

      {statusMenuRoomId && statusMenuAnchor && (() => {
        const room = data.rooms.find((r) => r.id === statusMenuRoomId);
        if (!room) return null;
        const menuW = 160;
        const left = Math.max(8, Math.min(statusMenuAnchor.right - menuW, window.innerWidth - menuW - 8));
        const showBelow = statusMenuAnchor.bottom + 180 < window.innerHeight;
        return (
          <>
            <div
              className="fixed inset-0 z-[55]"
              onClick={() => { setStatusMenuRoomId(null); setStatusMenuAnchor(null); }}
            />
            <div
              className="fixed z-[60] w-40 card p-1.5 shadow-float animate-scale-in"
              style={{
                left: `${left}px`,
                top: showBelow ? `${statusMenuAnchor.bottom + 4}px` : undefined,
                bottom: showBelow ? undefined : `${window.innerHeight - statusMenuAnchor.top + 4}px`,
              }}
            >
              {(['Clean', 'Dirty', 'Inspected', 'Maintenance'] as RoomStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRoomStatus(room.id, s).then(() => onReload()).catch(() => toast(t('gen_error'), 'error'));
                    setStatusMenuRoomId(null);
                    setStatusMenuAnchor(null);
                  }}
                  className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    room.status === s ? 'bg-ink-100 text-ink-900' : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {roomStatusDot(s)}
                  {t(`room_${s.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </>
        );
      })()}

      {hoveredTip && (
        <BookingTooltip
          key={hoveredTip.booking.id}
          booking={hoveredTip.booking}
          rect={hoveredTip.rect}
          placement={hoveredTip.placement}
          tariff={hoveredTip.tariff}
          rooms={data.rooms}
          categories={data.categories}
        />
      )}
    </div>
  );
}

function GuestListModal({
  bookings,
  rooms,
  emptyText,
  showPayment,
}: {
  bookings: Booking[];
  rooms: Room[];
  emptyText: string;
  showPayment?: boolean;
}) {
  const { lang, t } = useLang();
  const paymentStyle: Record<string, { chip: string; labelKey: string }> = {
    Paid: { chip: 'text-emerald-700 bg-emerald-50', labelKey: 'pay_paid' },
    Partial: { chip: 'text-amber-700 bg-amber-50', labelKey: 'pay_partial' },
    Unpaid: { chip: 'text-rose-700 bg-rose-50', labelKey: 'pay_unpaid' },
  };
  if (bookings.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-ink-400">
        {emptyText} — 0
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {bookings.map((b) => {
        const room = rooms.find((r) => r.id === b.roomId);
        return (
          <div key={b.id} className="flex items-center gap-3 rounded-xl border border-ink-200 p-3 hover:bg-ink-50/50 transition-colors">
            <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
              {room?.label ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-800 truncate">{b.guestName}</p>
              <p className="text-xs text-ink-400">{room?.label} · {b.nights} {t('gen_night')} · {b.guestCountry}</p>
            </div>
            {showPayment && (
              <span className={`chip ${paymentStyle[b.paymentStatus].chip}`}>{t(paymentStyle[b.paymentStatus].labelKey)}</span>
            )}
            <span className="text-sm font-bold text-ink-800 tabular">{UZS(b.total, lang)}</span>
          </div>
        );
      })}
    </div>
  );
}

function BookingTooltip({
  booking: b,
  rect,
  placement,
  tariff,
  rooms,
  categories,
}: {
  booking: Booking;
  rect: DOMRect;
  placement: 'above' | 'below';
  tariff?: Tariff;
  rooms: Room[];
  categories: RoomCategory[];
}) {
  const { lang, t } = useLang();
  const _lang = lang as CurrencyLang;
  const tipRef = useRef<HTMLDivElement>(null);
  const [measuredH, setMeasuredH] = useState(0);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (tipRef.current) {
      setMeasuredH(tipRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    if (measuredH > 0) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [measuredH]);

  const tooltipW = 268;
  const gap = 8;
  const margin = 8;
  const left = Math.max(margin, Math.min(rect.left, window.innerWidth - tooltipW - margin));
  const effectiveH = measuredH || 320;
  const top = placement === 'above'
    ? Math.max(margin, rect.top - effectiveH - gap)
    : Math.min(window.innerHeight - effectiveH - margin, rect.bottom + gap);

  const st = statusStyleTooltip[b.status];
  const room = rooms.find((r) => r.id === b.roomId);
  const cat = categories.find((c) => c.id === room?.categoryId);
  const allGuests = (b.guests && b.guests.length > 0) ? b.guests : [{ name: b.guestName, type: 'adult' as const }];
  const adultCount = b.adults ?? allGuests.filter((g) => g.type === 'adult').length;
  const childCount = b.children ?? allGuests.filter((g) => g.type === 'child').length;
  const checkInDate = addDaysISO(todayISO(), b.startOffset);
  const checkOutDate = addDaysISO(checkInDate, b.nights);

  return (
    <div
      ref={tipRef}
      className="fixed z-[65] w-[268px] card p-3.5 shadow-float text-left pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 120ms ease-out',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-ink-900 truncate">{b.guestName}</p>
        <span className={`chip ${st.chip} shrink-0`}>{t(st.labelKey)}</span>
      </div>

      {allGuests.length > 1 && (
        <div className="mb-2 rounded-lg bg-ink-50 p-2 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">{t('val_allGuests')} ({allGuests.length})</p>
          {allGuests.map((g, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs">
              {g.type === 'adult'
                ? <Users size={11} className="text-indigo-500 shrink-0" />
                : <Baby size={11} className="text-amber-500 shrink-0" />}
              <span className="font-medium text-ink-700 truncate">{g.name || `${t('eb_guest')} ${idx + 1}`}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1 text-xs text-ink-600">
        <div className="flex items-center justify-between">
          <span className="text-ink-400 flex items-center gap-1"><Users size={11} /> {t('val_adults')}</span>
          <span className="font-semibold text-ink-800">{adultCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-400 flex items-center gap-1"><Baby size={11} /> {t('val_children')}</span>
          <span className="font-semibold text-ink-800">{childCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-400">{t('eb_checkInDate')}</span>
          <span className="font-semibold text-ink-800">{prettyDate(checkInDate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-400">{t('eb_checkOutDate')}</span>
          <span className="font-semibold text-ink-800">{prettyDate(checkOutDate)}</span>
        </div>
        <TipRow label={t('bd_nights')} value={`${b.nights} ${t('eb_nightsCalc')}`} />
        {tariff && <TipRow label={t('bd_tariffPlan')} value={tariff.name} />}
        {cat && <TipRow label={t('val_capacityLabel')} value={`${cat.maxAdults + cat.maxChildren}`} />}
        <TipRow label={t('bd_total')} value={UZS(b.total, _lang)} />
        <div className="flex items-center justify-between pt-1">
          <span className="text-ink-400">{t('qb_paymentStatus')}</span>
          <span className={`chip ${paymentStyleTooltip[b.paymentStatus].chip}`}>{t(paymentStyleTooltip[b.paymentStatus].labelKey)}</span>
        </div>
      </div>
    </div>
  );
}

const statusStyleTooltip: Record<BookingStatus, { bar: string; chip: string; labelKey: string; ring: string }> = {
  'Confirmed': { bar: 'bg-emerald-500', chip: 'text-emerald-700 bg-emerald-50', labelKey: 'status_confirmed', ring: 'ring-emerald-500/30' },
  'Checked-in': { bar: 'bg-indigo-500', chip: 'text-indigo-700 bg-indigo-50', labelKey: 'status_checkedIn', ring: 'ring-indigo-500/30' },
  'Pending': { bar: 'bg-amber-500', chip: 'text-amber-700 bg-amber-50', labelKey: 'status_pending', ring: 'ring-amber-500/30' },
  'Checked-out': { bar: 'bg-slate-400', chip: 'text-slate-600 bg-slate-100', labelKey: 'status_checkedOut', ring: 'ring-slate-400/30' },
  'Blocked': { bar: 'bg-rose-500', chip: 'text-rose-700 bg-rose-50', labelKey: 'status_blocked', ring: 'ring-rose-500/30' },
};

const paymentStyleTooltip: Record<string, { chip: string; labelKey: string }> = {
  Paid: { chip: 'text-emerald-700 bg-emerald-50', labelKey: 'pay_paid' },
  Partial: { chip: 'text-amber-700 bg-amber-50', labelKey: 'pay_partial' },
  Unpaid: { chip: 'text-rose-700 bg-rose-50', labelKey: 'pay_unpaid' },
};

function TipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-400">{label}</span>
      <span className="font-semibold text-ink-800">{value}</span>
    </div>
  );
}

function BookingDetail({
  b,
  rooms,
  tariffs,
  services,
  onUpdate,
  onDelete,
}: {
  b: Booking;
  rooms: Room[];
  tariffs: Tariff[];
  services: ExtraService[];
  onUpdate: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
}) {
  const { lang, t } = useLang();
  const room = rooms.find((r) => r.id === b.roomId);
  const tariff = tariffs.find((tm) => tm.id === b.tariffId);
  const attachedServices = services.filter((s) => b.serviceIds?.includes(s.id));
  const statusStyle: Record<BookingStatus, { bar: string; chip: string; labelKey: string }> = {
    'Confirmed': { bar: 'bg-emerald-500', chip: 'text-emerald-700 bg-emerald-50', labelKey: 'status_confirmed' },
    'Checked-in': { bar: 'bg-indigo-500', chip: 'text-indigo-700 bg-indigo-50', labelKey: 'status_checkedIn' },
    'Pending': { bar: 'bg-amber-500', chip: 'text-amber-700 bg-amber-50', labelKey: 'status_pending' },
    'Checked-out': { bar: 'bg-slate-400', chip: 'text-slate-600 bg-slate-100', labelKey: 'status_checkedOut' },
    'Blocked': { bar: 'bg-rose-500', chip: 'text-rose-700 bg-rose-50', labelKey: 'status_blocked' },
  };
  const paymentStyle: Record<string, { chip: string; labelKey: string }> = {
    Paid: { chip: 'text-emerald-700 bg-emerald-50', labelKey: 'pay_paid' },
    Partial: { chip: 'text-amber-700 bg-amber-50', labelKey: 'pay_partial' },
    Unpaid: { chip: 'text-rose-700 bg-rose-50', labelKey: 'pay_unpaid' },
  };
  const st = statusStyle[b.status];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center">
            <BedDouble size={22} />
          </div>
          <div>
            <p className="font-bold text-ink-900">{b.guestName}</p>
            <p className="text-xs text-ink-400">{t('bd_booking')} #{b.id.toUpperCase()} · {t('bd_via')} {b.channel}</p>
          </div>
        </div>
        <span className={`chip ${st.chip}`}>{t(st.labelKey)}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Info label={t('bd_room')} value={room?.label ?? '-'} />
        <Info label={t('bd_type')} value={room?.type ?? '-'} />
        <Info label={t('bd_nights')} value={String(b.nights)} />
        <Info label={t('bd_country')} value={b.guestCountry} />
        <Info label={t('bd_checkIn')} value={`Day ${b.startOffset >= 0 ? '+' : ''}${b.startOffset}`} />
        <Info label={t('bd_checkOut')} value={`Day ${b.startOffset + b.nights >= 0 ? '+' : ''}${b.startOffset + b.nights}`} />
        <Info label={t('bd_phone')} value={b.phone} />
        <Info label={t('bd_total')} value={UZS(b.total, lang)} />
      </div>

      {tariff && (
        <div className="rounded-xl bg-ink-50 p-4">
          <p className="text-[10px] uppercase tracking-wide text-ink-400 font-semibold mb-1">{t('bd_tariffPlan')}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink-900">{tariff.name}</p>
              <p className="text-xs text-ink-400">{tariff.cancellation} · {tariff.mealPlan} · {UZS(tariff.dailyRate, lang)}{t('tfm_perNight')}</p>
            </div>
            <span className={`chip ${paymentStyle[b.paymentStatus].chip}`}>{t(paymentStyle[b.paymentStatus].labelKey)}</span>
          </div>
        </div>
      )}

      {attachedServices.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-2">{t('bd_assignedServices')}</p>
          <div className="flex flex-wrap gap-2">
            {attachedServices.map((s) => (
              <span key={s.id} className="chip bg-indigo-50 text-indigo-700">
                {s.name} · {UZS(s.unitPrice, lang)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-ink-100">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-2">{t('bd_updateStatus')}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onUpdate(b.id, 'Confirmed')} className="btn-secondary px-3 py-2 text-xs"><CheckCircle2 size={14} /> {t('bd_confirm')}</button>
          <button onClick={() => onUpdate(b.id, 'Checked-in')} className="btn-secondary px-3 py-2 text-xs"><UserCheck size={14} /> {t('bd_checkInBtn')}</button>
          <button onClick={() => onUpdate(b.id, 'Checked-out')} className="btn-secondary px-3 py-2 text-xs"><DoorOpen size={14} /> {t('bd_checkOutBtn')}</button>
          <button onClick={() => onUpdate(b.id, 'Pending')} className="btn-secondary px-3 py-2 text-xs">{t('bd_setPending')}</button>
          <button onClick={() => onDelete(b.id)} className="btn px-3 py-2 text-xs bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 size={14} /> {t('bd_cancel')}</button>
        </div>
      </div>
    </div>
  );
}

const QuickBookingForm = forwardRef<{ submit: () => void }, {
  roomId: string;
  dayOffset: number;
  nights: number;
  rooms: Room[];
  tariffs: Tariff[];
  services: ExtraService[];
  categories: RoomCategory[];
  existingBookings: Booking[];
  onAdd: (b: Omit<Booking, 'id'>) => void;
}>(function QuickBookingForm({
  roomId,
  dayOffset,
  rooms,
  tariffs,
  services,
  categories,
  existingBookings,
  onAdd,
  nights: initNights,
}, ref) {
  const { lang, t } = useLang();
  const [selectedRoomId, setSelectedRoomId] = useState(roomId);
  const [guest, setGuest] = useState('');
  const [checkIn, setCheckIn] = useState(addDaysISO(todayISO(), dayOffset));
  const [checkOut, setCheckOut] = useState(addDaysISO(addDaysISO(todayISO(), dayOffset), initNights > 0 ? initNights : 1));
  const [country, setCountry] = useState('Uzbekistan');
  const [channel, setChannel] = useState('Direct');
  const [phone, setPhone] = useState('');
  const [tariffId, setTariffId] = useState(() => {
    const r = rooms.find((rm) => rm.id === roomId);
    if (!r) return '';
    const rts = tariffs.filter((tm) => tm.categoryId === r.categoryId);
    return rts[0]?.id ?? '';
  });
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestNames, setGuestNames] = useState<BookingGuest[]>([]);

  const nights = nightsBetween(checkIn, checkOut);
  const unavailableIds = useRoomAvailability(checkIn, checkOut);
  const availableRooms = rooms.filter((r) => !unavailableIds.has(r.id));

  const room = rooms.find((r) => r.id === selectedRoomId);
  const cat = room ? categories.find((c) => c.id === room.categoryId) : undefined;
  const roomTariffs = room ? tariffs.filter((tm) => tm.categoryId === room.categoryId) : [];
  const maxAdults = cat?.maxAdults ?? 10;
  const maxChildren = cat?.maxChildren ?? 10;

  const handleRoomChange = (newRoomId: string) => {
    setSelectedRoomId(newRoomId);
    const newRoom = rooms.find((r) => r.id === newRoomId);
    const newTariffs = newRoom ? tariffs.filter((tm) => tm.categoryId === newRoom.categoryId) : [];
    setTariffId(newTariffs[0]?.id ?? '');
  };

  // Sync guest name fields when adult/child counts change
  useEffect(() => {
    setGuestNames((prev) => {
      const target = adults + children;
      if (prev.length === target) return prev.map((g, i) => ({ ...g, type: i < adults ? 'adult' as const : 'child' as const }));
      const next = [...prev];
      while (next.length < target) {
        const idx = next.length;
        next.push({ name: idx === 0 ? guest : '', type: idx < adults ? 'adult' : 'child' });
      }
      while (next.length > target) next.pop();
      return next.map((g, i) => ({ ...g, type: i < adults ? 'adult' as const : 'child' as const }));
    });
  }, [adults, children]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGuestNameChange = (idx: number, name: string) => {
    setGuestNames((prev) => prev.map((g, i) => (i === idx ? { ...g, name } : g)));
    if (idx === 0) setGuest(name);
  };

  const tariff = tariffs.find((tm) => tm.id === tariffId);
  const baseTotal = room ? (tariff?.dailyRate ?? room.baseRate) * nights : 0;
  const serviceTotal = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.calcType === 'Per Night' ? s.unitPrice * nights : s.unitPrice), 0);
  const total = baseTotal + serviceTotal;

  const toggleService = (id: string) =>
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const startOffset = Math.round((new Date(checkIn + 'T00:00:00').getTime() - new Date(todayISO() + 'T00:00:00').getTime()) / 86400000);
  const dateConflict = hasDateConflict(existingBookings, selectedRoomId, startOffset, nights);
  const capacityExceeded = room && cat ? exceedsCapacity(adults, children, maxAdults, maxChildren) : false;
  const capacityWarn = room && cat ? exceedsBase(adults, children, cat.baseAdults, cat.baseKids) : false;
  const canSubmit = !!guest.trim() && !!selectedRoomId && nights > 0 && !dateConflict && !capacityExceeded && availableRooms.some((r) => r.id === selectedRoomId);

  useImperativeHandle(ref, () => ({ submit, canSubmit }), [guest, selectedRoomId, checkIn, checkOut, nights, dateConflict, capacityExceeded, adults, children, total, channel, phone, tariffId, paymentStatus, selectedServices, guestNames]);

  const submit = () => {
    if (!guest.trim() || !selectedRoomId || nights <= 0 || dateConflict || capacityExceeded) return;
    onAdd({
      roomId: selectedRoomId,
      guestName: guest.trim(),
      guestCountry: country,
      startOffset,
      nights,
      status,
      total,
      channel,
      phone: phone.trim() || '+998 90 000 00 00',
      tariffId: tariffId || undefined,
      paymentStatus,
      serviceIds: selectedServices,
      adults,
      children,
      guests: guestNames,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Guest Counts — Adults & Children */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label"><span className="inline-flex items-center gap-1.5"><Users size={12} className="text-ink-400" />{t('eb_adults')}</span></label>
          <input type="number" min={1} max={maxAdults} value={adults} onChange={(e) => setAdults(Math.min(maxAdults, Math.max(1, parseInt(e.target.value) || 1)))} className="input" />
        </div>
        <div>
          <label className="label"><span className="inline-flex items-center gap-1.5"><Baby size={12} className="text-ink-400" />{t('eb_children')}</span></label>
          <input type="number" min={0} max={maxChildren} value={children} onChange={(e) => setChildren(Math.min(maxChildren, Math.max(0, parseInt(e.target.value) || 0)))} className="input" />
        </div>
      </div>

      {/* 2. Dynamic Guest Names */}
      <div>
        <label className="label">{t('eb_guestNames')}</label>
        <div className="space-y-2 rounded-xl border border-ink-200 p-3 bg-ink-50/50">
          {guestNames.map((g, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${g.type === 'adult' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                {g.type === 'adult' ? <Users size={12} /> : <Baby size={12} />}
                {t('eb_guest')} {idx + 1} ({g.type === 'adult' ? t('eb_guestAdult') : t('eb_guestChild')})
              </span>
              <input type="text" value={g.name} onChange={(e) => handleGuestNameChange(idx, e.target.value)} placeholder={t('eb_guestNamePh')} className="input flex-1 !py-1.5 !text-xs" autoFocus={idx === 0} />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Dates + Nights summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label"><span className="inline-flex items-center gap-1.5"><Calendar size={12} className="text-indigo-500" />{t('eb_checkInDate')}</span></label>
          <input type="date" value={checkIn} onChange={(e) => { const v = e.target.value; if (v >= checkOut) setCheckOut(addDaysISO(v, 1)); setCheckIn(v); }} className="input" />
        </div>
        <div>
          <label className="label"><span className="inline-flex items-center gap-1.5"><Calendar size={12} className="text-indigo-500" />{t('eb_checkOutDate')}</span></label>
          <input type="date" value={checkOut} min={addDaysISO(checkIn, 1)} onChange={(e) => { if (e.target.value > checkIn) setCheckOut(e.target.value); }} className="input" />
        </div>
        <div>
          <label className="label">{t('qb_nights')}</label>
          <div className="input flex items-center justify-center font-bold text-indigo-600 tabular">{nights} {t('eb_nightsCalc')}</div>
        </div>
      </div>

      {/* Validation warnings */}
      {dateConflict && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-rose-700">{t('val_conflict')}</p>
        </div>
      )}
      {capacityExceeded && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-rose-700">{t('val_capacity')} ({adults + children} / {maxAdults + maxChildren})</p>
        </div>
      )}
      {!capacityExceeded && capacityWarn && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-amber-700">{t('val_capacityWarn')}</p>
        </div>
      )}

      {/* 4. Room selection */}
      <div>
        <label className="label">{t('bd_room')}</label>
        {availableRooms.length === 0 ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2.5">
            <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-700">{t('val_allBooked')}</p>
          </div>
        ) : (
          <select value={selectedRoomId} onChange={(e) => handleRoomChange(e.target.value)} className="input">
            <option value="">—</option>
            {availableRooms.map((r) => {
              const rc = categories.find((c) => c.id === r.categoryId);
              return <option key={r.id} value={r.id}>{r.label} · {rc?.name}</option>;
            })}
          </select>
        )}
      </div>
      {room ? (
        <>
      <div className="rounded-xl bg-indigo-50/50 p-3 flex items-center gap-3">
        <BedDouble size={20} className="text-indigo-600" />
        <div>
          <p className="text-sm font-bold text-ink-900">{t('bd_room')} {room.label} · {cat?.name}</p>
          <p className="text-xs text-ink-400">Day {dayOffset >= 0 ? '+' : ''}{dayOffset} · {UZS(room.baseRate, lang)}{t('be_perNight')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('qb_tariff')}</label>
          <select value={tariffId} onChange={(e) => setTariffId(e.target.value)} className="input">
            {roomTariffs.length === 0 && <option value="">{t('qb_defaultRate')}</option>}
            {roomTariffs.map((tm) => <option key={tm.id} value={tm.id}>{tm.name} ({UZS_SHORT(tm.dailyRate)})</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('qb_channel')}</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="input">
            {['Direct', 'Booking.com', 'Airbnb', 'Agoda', 'Expedia', 'Trip.com', 'Ostrovok.ru'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('qb_status')}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)} className="input">
            {(['Pending', 'Confirmed', 'Checked-in'] as BookingStatus[]).map((s) => <option key={s} value={s}>{t(`status_${s === 'Checked-in' ? 'checkedIn' : s === 'Checked-out' ? 'checkedOut' : s.toLowerCase()}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('qb_paymentStatus')}</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Partial' | 'Unpaid')} className="input">
            {['Unpaid', 'Partial', 'Paid'].map((s) => <option key={s} value={s}>{t(`pay_${s.toLowerCase()}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('qb_country')}</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
            {['Uzbekistan', 'Russia', 'Kazakhstan', 'Turkey', 'Germany', 'UK', 'China', 'UAE', 'Italy', 'South Korea'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('qb_phone')}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="input" />
        </div>
      </div>

      <div>
        <label className="label">{t('qb_addonServices')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {services.filter((s) => s.active).map((s) => {
            const on = selectedServices.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-sm transition-all ${
                  on ? 'border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-100' : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className="flex-1 font-medium text-ink-700">{s.name}</span>
                <span className="text-xs text-ink-400">{UZS_SHORT(s.unitPrice)}</span>
                {on && <CheckCircle2 size={15} className="text-indigo-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-ink-50 p-4 space-y-1.5">
        {tariff && <div className="flex justify-between text-xs"><span className="text-ink-400">{tariff.name}</span><span className="tabular text-ink-600">{UZS(baseTotal, lang)}</span></div>}
        {serviceTotal > 0 && <div className="flex justify-between text-xs"><span className="text-ink-400">{t('qb_services')}</span><span className="tabular text-ink-600">{UZS(serviceTotal, lang)}</span></div>}
        <div className="flex justify-between pt-1.5 border-t border-ink-200">
          <span className="font-bold text-ink-900">{t('qb_total')}</span>
          <span className="text-lg font-extrabold text-ink-900 tabular">{UZS(total, lang)}</span>
        </div>
      </div>
      </>
      ) : (
        <div className="rounded-xl bg-ink-50 p-6 text-center text-sm text-ink-400">
          {t('shax_selectRoom')}
        </div>
      )}
    </div>
  );
});

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <p className="text-[10px] uppercase tracking-wide text-ink-400 font-semibold">{label}</p>
      <p className="text-sm font-semibold text-ink-800 mt-0.5">{value}</p>
    </div>
  );
}
