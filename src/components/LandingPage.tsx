import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Building2,
  CalendarRange,
  Radio,
  Globe,
  ArrowRight,
  Check,
  Send,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  Hotel,
  HeartPulse,
  Palmtree,
  BedDouble,
  Search as SearchIcon,
  Calendar,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  Plus,
  Minus,
  X,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth, ROLE_LABELS } from '../lib/auth';
import { useLang } from '../i18n';
import { useToast } from '../toast';
import { createConnectionRequest } from '../lib/hotelData';
import { properties } from '../mockData';

type PropertyTab = 'Hotel' | 'Sanatorium' | 'Resort' | 'Apartment' | 'Hostel';

type RoomConfig = { adults: number; children: number };

const TABS: { id: PropertyTab; icon: LucideIcon; labelKey: { uz: string; ru: string; en: string } }[] = [
  { id: 'Hotel', icon: Hotel, labelKey: { uz: 'Mehmonxona', ru: 'Отель', en: 'Hotel' } },
  { id: 'Sanatorium', icon: HeartPulse, labelKey: { uz: 'Sanatoriya', ru: 'Санаторий', en: 'Sanatorium' } },
  { id: 'Resort', icon: Palmtree, labelKey: { uz: 'Kurort', ru: 'Курорт', en: 'Resort' } },
  { id: 'Apartment', icon: Building2, labelKey: { uz: 'Apartament', ru: 'Апартаменты', en: 'Apartment' } },
  { id: 'Hostel', icon: BedDouble, labelKey: { uz: 'Hostel', ru: 'Хостел', en: 'Hostel' } },
];

const PRODUCTS = [
  {
    icon: CalendarRange,
    title: { uz: 'PMS — Mehmonxona Boshqaruvi', ru: 'PMS — Управление Отелем', en: 'PMS — Hotel Management' },
    desc: {
      uz: "Xonalar jadvali (shaxmatka), bronlar, kelish-ketishlar, to'lovlar va mehmonlarni boshqarish. To'liq mehmonxona operatsiyalarini bir joyda boshqaring.",
      ru: 'Шахматка, брони, заезды-выезды, платежи и управление гостями. Полное управление операциями отеля в одном месте.',
      en: 'Room grid (chessboard), bookings, check-in/out, payments and guest management. Run your entire hotel operation from one place.',
    },
    features: {
      uz: ['Shaxmatka xonalar jadvali', 'Tezkor va guruhli bronlar', "To'lov va tarif boshqaruvi", 'Mehmonlar tarixi'],
      ru: ['Шахматка номеров', 'Быстрое и групповое бронирование', 'Управление платежами и тарифами', 'История гостей'],
      en: ['Room chessboard grid', 'Quick & group bookings', 'Payment & rate management', 'Guest history'],
    },
    forWho: { uz: 'Mehmonxona menejerlari va administratorlari uchun', ru: 'Для менеджеров и администраторов отелей', en: 'For hotel managers and receptionists' },
    status: 'active' as const,
  },
  {
    icon: Radio,
    title: { uz: 'Channel Manager — Sotuv Kanallari', ru: 'Channel Manager — Каналы Продаж', en: 'Channel Manager — Sales Channels' },
    desc: {
      uz: "Booking.com, Airbnb, Agoda, Expedia va boshqa 9+ kanallarni avtomatik sinxronlash. Narxlar va mavjudlik bir necha soniyada yangilanadi.",
      ru: 'Автоматическая синхронизация с Booking.com, Airbnb, Agoda, Expedia и 9+ каналами. Цены и доступность обновляются за секунды.',
      en: 'Auto-sync with Booking.com, Airbnb, Agoda, Expedia and 9+ channels. Prices and availability update in seconds.',
    },
    features: {
      uz: ['9+ OTA kanallar', 'Avtomatik narx sinxronizatsiyasi', 'Bandlik real-time yangilanish', "Komissiya hisobotlari"],
      ru: ['9+ OTA-каналов', 'Автосинхронизация цен', 'Обновление в реальном времени', 'Отчеты по комиссиям'],
      en: ['9+ OTA channels', 'Auto price sync', 'Real-time availability updates', 'Commission reports'],
    },
    forWho: { uz: "Mehmonxonalar uchun ko'p kanalli savdoni avtomatlashtirish", ru: 'Автоматизация многоканальных продаж для отелей', en: 'Automating multi-channel sales for hotels' },
    status: 'soon' as const,
  },
  {
    icon: Globe,
    title: { uz: "Booking Engine — To'g'ridan-to'g'ri Bron", ru: 'Booking Engine — Прямое Бронирование', en: 'Booking Engine — Direct Booking' },
    desc: {
      uz: "Mehmonxonangiz veb-saytida to'g'ridan-to'g'ri bronlash vidjeti. Komissiyasiz to'g'ridan-to'g'ri savdo.",
      ru: 'Виджет прямого бронирования на сайте вашего отеля. Прямые продажи без комиссий.',
      en: 'Direct booking widget on your hotel website. Commission-free direct sales.',
    },
    features: {
      uz: ['Mehmonxona saytiga vidjet', "Komissiyasiz to'lovlar", 'Mobil-do‘st dizayn', 'Real-time mavjudlik'],
      ru: ['Виджет на сайт отеля', 'Оплата без комиссий', 'Мобильный дизайн', 'Доступность в реальном времени'],
      en: ['Widget for hotel website', 'Commission-free payments', 'Mobile-friendly design', 'Real-time availability'],
    },
    forWho: { uz: "Mehmonxonalar uchun to'g'ridan-to'g'ri bron savdosini oshirish", ru: 'Увеличение прямых продаж для отелей', en: 'Increasing direct booking sales for hotels' },
    status: 'active' as const,
  },
];

const CITIES = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Tashkent Region', 'Other'];

const PROPERTY_IMAGES: string[] = [
  'https://images.pexels.com/photos/4557446/pexels-photo-4557446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37431910/pexels-photo-37431910.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7546610/pexels-photo-7546610.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/19227989/pexels-photo-19227989.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14036253/pexels-photo-14036253.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/15621208/pexels-photo-15621208.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysISO(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const PROPERTY_TYPE_MAP: Record<string, PropertyTab> = {
  'Hotel': 'Hotel',
  'Boutique Hotel': 'Hotel',
  'Hostel': 'Hostel',
  'Resort': 'Resort',
  'Guesthouse': 'Hotel',
};

const UZBEKISTAN_REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Buxoro viloyati",
  "Xorazm viloyati",
  "Farg'ona viloyati",
  "Namangan viloyati",
  "Andijon viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Navoiy viloyati",
  "Qoraqalpog'iston Respublikasi",
];

const MONTH_NAMES: Record<'uz' | 'ru' | 'en', string[]> = {
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

const WEEKDAY_SHORT: Record<'uz' | 'ru' | 'en', string[]> = {
  uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};

function parseISO(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}
function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBefore(a: Date, b: Date): boolean {
  return toISO(a) < toISO(b);
}

function MiniCalendar({
  value,
  onPick,
  minDate,
  maxDate,
  lang,
  onClose,
}: {
  value: string;
  onPick: (iso: string) => void;
  minDate: string;
  maxDate?: string;
  lang: 'uz' | 'ru' | 'en';
  onClose: () => void;
}) {
  const [view, setView] = useState(() => {
    const d = parseISO(value);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minD = parseISO(minDate);
  const maxD = maxDate ? parseISO(maxDate) : null;

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isDisabled = (d: Date): boolean => {
    if (isBefore(d, today)) return true;
    if (isBefore(d, minD)) return true;
    if (maxD && isBefore(maxD, d)) return true;
    return false;
  };

  const selectedDate = parseISO(value);

  const pick = (d: Date) => {
    onPick(toISO(d));
    onClose();
  };

  return (
    <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-ink-100 p-3 w-[280px] animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="h-7 w-7 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-500"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-ink-900">{MONTH_NAMES[lang][month]} {year}</span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="h-7 w-7 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-500"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_SHORT[lang].map((w) => (
          <div key={w} className="text-center text-[10px] font-bold text-ink-400 py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const disabled = isDisabled(d);
          const selected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => pick(d)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all relative ${
                selected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : disabled
                  ? 'text-ink-300 cursor-not-allowed'
                  : 'text-ink-700 hover:bg-cyan-50 hover:text-cyan-700'
              }`}
            >
              {d.getDate()}
              {isToday && !selected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-cyan-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LandingPage() {
  const { lang, t } = useLang();
  const { login } = useAuth();
  const toast = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [form, setForm] = useState({ hotelName: '', contactName: '', phone: '', email: '', city: 'Tashkent', roomCount: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<PropertyTab>('Hotel');
  const [search, setSearch] = useState({ destination: '', checkIn: todayISO(), checkOut: addDaysISO(todayISO(), 1) });
  const [rooms, setRooms] = useState<RoomConfig[]>([{ adults: 2, children: 0 }]);
  const [searched, setSearched] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [destQuery, setDestQuery] = useState('');
  const [calOpen, setCalOpen] = useState<null | 'checkIn' | 'checkOut'>(null);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const destRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setDestOpen(false);
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(null);
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setGuestsOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredRegions = useMemo(() => {
    const q = destQuery.trim().toLowerCase();
    if (!q) return UZBEKISTAN_REGIONS;
    return UZBEKISTAN_REGIONS.filter((r) => r.toLowerCase().includes(q));
  }, [destQuery]);

  const selectRegion = (region: string) => {
    setSearch({ ...search, destination: region });
    setDestOpen(false);
    setDestQuery('');
  };

  const setCheckInDate = (iso: string) => {
    const next = addDaysISO(iso, 1);
    setSearch({
      ...search,
      checkIn: iso,
      checkOut: iso >= search.checkOut ? next : search.checkOut,
    });
  };
  const setCheckOutDate = (iso: string) => {
    if (iso <= search.checkIn) {
      setSearch({ ...search, checkIn: iso, checkOut: addDaysISO(iso, 1) });
    } else {
      setSearch({ ...search, checkOut: iso });
    }
  };

  const langKey = lang as 'uz' | 'ru' | 'en';

  const addRoom = () => {
    if (rooms.length < 5) setRooms([...rooms, { adults: 1, children: 0 }]);
  };
  const removeRoom = (idx: number) => setRooms(rooms.filter((_, i) => i !== idx));
  const updateRoom = (idx: number, field: 'adults' | 'children', val: number) =>
    setRooms(rooms.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  const guestSummary = useMemo(() => {
    const totalAdults = rooms.reduce((s, r) => s + r.adults, 0);
    const totalChildren = rooms.reduce((s, r) => s + r.children, 0);
    const totalPeople = totalAdults + totalChildren;
    const peopleLabel = langKey === 'uz' ? 'mehmon' : langKey === 'ru' ? 'гостей' : 'guests';
    const roomLabel = langKey === 'uz' ? 'xona' : langKey === 'ru' ? 'номера' : 'rooms';
    return `${totalPeople} ${peopleLabel}, ${rooms.length} ${roomLabel}`;
  }, [rooms, langKey]);

  const submitForm = async () => {
    if (!form.hotelName.trim() || !form.contactName.trim() || !form.phone.trim()) {
      toast(t('landing_formRequired'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createConnectionRequest({
        hotelName: form.hotelName,
        contactName: form.contactName,
        phone: form.phone,
        email: form.email,
        city: form.city,
        roomCount: parseInt(form.roomCount) || 0,
        message: form.message,
      });
      toast(t('landing_formSuccess'), 'success');
      setForm({ hotelName: '', contactName: '', phone: '', email: '', city: 'Tashkent', roomCount: '', message: '' });
    } catch {
      toast(t('gen_error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    setSearched(true);
    setTimeout(() => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const tabType = PROPERTY_TYPE_MAP[p.type] ?? 'Hotel';
      if (tabType !== activeTab) return false;
      if (search.destination.trim()) {
        const q = search.destination.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, search.destination]);

  const roles: UserRole[] = ['ceo', 'super_admin', 'manager', 'receptionist', 'housekeeping'];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200/50">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-extrabold tracking-tight text-ink-900 text-[15px]">
                Hospita<span className="text-cyan-600">X</span>
              </p>
              <p className="text-[9px] uppercase tracking-widest text-ink-400 font-semibold">Hospitality Cloud</p>
            </div>
          </div>
          <button
            onClick={() => setLoginOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-200/40 hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            <ShieldCheck size={16} />
            {langKey === 'uz' ? "Shaxsiy kabinetga kirish" : langKey === 'ru' ? 'Войти в личный кабинет' : 'Login / Sign In'}
          </button>
        </div>
      </header>

      {/* ── Hero with booking widget ── */}
      <section className="relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold mb-4">
              <Sparkles size={13} /> HospitaX Hospitality Cloud
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-900 leading-[1.1]">
              {langKey === 'uz' ? "Mehmonxona va dam olish maskanlari qidiruv tizimi" : langKey === 'ru' ? 'Поиск отелей и мест отдыха' : 'Find Hotels & Stays'}
            </h1>
            <p className="mt-4 text-lg text-ink-500 leading-relaxed max-w-xl mx-auto">
              {langKey === 'uz'
                ? "Mehmonxona, sanatoriya, kurort, apartament va xostellarni toping va to'g'ridan-to'g'ri bron qiling."
                : langKey === 'ru'
                ? 'Находите отели, санатории, курорты, апартаменты и хостелы. Бронируйте напрямую.'
                : 'Find hotels, sanatoriums, resorts, apartments and hostels. Book directly.'}
            </p>
          </div>

          {/* ── Booking Search Widget ── */}
          <div className="bg-white rounded-2xl shadow-xl shadow-cyan-200/30 border border-cyan-100/50 overflow-visible max-w-4xl mx-auto">
            {/* Top Row: Tabs — evenly distributed */}
            <div className="grid grid-cols-5 border-b border-ink-100">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const on = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSearched(false); }}
                    className={`flex items-center justify-center gap-2 px-2 py-3.5 text-sm font-bold whitespace-nowrap transition-all border-b-[3px] rounded-t-lg ${
                      on
                        ? 'bg-gradient-to-b from-cyan-50 to-white text-cyan-700 border-cyan-500'
                        : 'text-ink-500 border-transparent hover:text-ink-700 hover:bg-ink-50/50'
                    }`}
                  >
                    <Icon size={18} className={on ? 'text-cyan-600' : 'text-ink-400'} shrink-0 />
                    <span className="hidden xs:inline sm:inline">{tab.labelKey[langKey]}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Row: Inputs + Search */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Destination — regions dropdown */}
                <div className="relative" ref={destRef}>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400 flex items-center gap-1">
                    <MapPin size={11} /> {langKey === 'uz' ? "Manzil" : langKey === 'ru' ? 'Куда' : 'Destination'}
                  </label>
                  <div className="relative mt-1">
                    <input
                      value={destOpen ? destQuery : search.destination}
                      onChange={(e) => { setDestQuery(e.target.value); setDestOpen(true); }}
                      onFocus={() => { setDestOpen(true); setDestQuery(''); }}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all ${destOpen ? 'border-cyan-400 ring-2 ring-cyan-100' : 'border-ink-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'}`}
                      placeholder={langKey === 'uz' ? "Hududni tanlang" : langKey === 'ru' ? 'Выберите регион' : 'Select region'}
                    />
                    <MapPinned size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                  </div>
                  {destOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-2xl border border-ink-100 max-h-64 overflow-y-auto animate-fade-in">
                      {filteredRegions.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-ink-400">{langKey === 'uz' ? "Topilmadi" : langKey === 'ru' ? 'Не найдено' : 'Not found'}</p>
                      ) : (
                        filteredRegions.map((region) => (
                          <button
                            key={region}
                            onClick={() => selectRegion(region)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-50 transition-colors flex items-center gap-2 ${search.destination === region ? 'text-cyan-700 font-bold bg-cyan-50/50' : 'text-ink-700'}`}
                          >
                            <MapPin size={14} className={search.destination === region ? 'text-cyan-600' : 'text-ink-300'} shrink-0 />
                            {region}
                            {search.destination === region && <Check size={14} className="ml-auto text-cyan-600" />}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Check-in — calendar popup */}
                <div className="relative">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400 flex items-center gap-1">
                    <Calendar size={11} /> {langKey === 'uz' ? "Kirish" : langKey === 'ru' ? 'Заезд' : 'Check-in'}
                  </label>
                  <button
                    onClick={() => setCalOpen(calOpen === 'checkIn' ? null : 'checkIn')}
                    className={`w-full mt-1 rounded-xl border px-3 py-2.5 text-sm text-left outline-none transition-all flex items-center justify-between ${calOpen === 'checkIn' ? 'border-cyan-400 ring-2 ring-cyan-100' : 'border-ink-200 hover:border-cyan-300'}`}
                  >
                    <span className={search.checkIn ? 'text-ink-800' : 'text-ink-400'}>
                      {search.checkIn ? new Date(search.checkIn + 'T00:00:00').toLocaleDateString(langKey === 'uz' ? 'uz' : langKey === 'ru' ? 'ru' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }) : (langKey === 'uz' ? 'Sanani tanlang' : langKey === 'ru' ? 'Выберите дату' : 'Select date')}
                    </span>
                    <Calendar size={15} className="text-ink-400" />
                  </button>
                  {calOpen === 'checkIn' && (
                    <div ref={calRef}>
                      <MiniCalendar
                        value={search.checkIn}
                        onPick={setCheckInDate}
                        minDate={todayISO()}
                        lang={langKey}
                        onClose={() => setCalOpen(null)}
                      />
                    </div>
                  )}
                </div>

                {/* Check-out — calendar popup */}
                <div className="relative">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400 flex items-center gap-1">
                    <Calendar size={11} /> {langKey === 'uz' ? "Chiqish" : langKey === 'ru' ? 'Выезд' : 'Check-out'}
                  </label>
                  <button
                    onClick={() => setCalOpen(calOpen === 'checkOut' ? null : 'checkOut')}
                    className={`w-full mt-1 rounded-xl border px-3 py-2.5 text-sm text-left outline-none transition-all flex items-center justify-between ${calOpen === 'checkOut' ? 'border-cyan-400 ring-2 ring-cyan-100' : 'border-ink-200 hover:border-cyan-300'}`}
                  >
                    <span className={search.checkOut ? 'text-ink-800' : 'text-ink-400'}>
                      {search.checkOut ? new Date(search.checkOut + 'T00:00:00').toLocaleDateString(langKey === 'uz' ? 'uz' : langKey === 'ru' ? 'ru' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }) : (langKey === 'uz' ? 'Sanani tanlang' : langKey === 'ru' ? 'Выберите дату' : 'Select date')}
                    </span>
                    <Calendar size={15} className="text-ink-400" />
                  </button>
                  {calOpen === 'checkOut' && (
                    <div ref={calRef}>
                      <MiniCalendar
                        value={search.checkOut}
                        onPick={setCheckOutDate}
                        minDate={addDaysISO(search.checkIn, 1)}
                        lang={langKey}
                        onClose={() => setCalOpen(null)}
                      />
                    </div>
                  )}
                </div>

                {/* Guests & Rooms — advanced popover */}
                <div className="relative" ref={guestsRef}>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400 flex items-center gap-1">
                    <Users size={11} /> {langKey === 'uz' ? "Mehmonlar" : langKey === 'ru' ? 'Гости' : 'Guests'}
                  </label>
                  <button
                    onClick={() => setGuestsOpen(!guestsOpen)}
                    className={`w-full mt-1 rounded-xl border px-3 py-2.5 text-sm text-left outline-none transition-all flex items-center justify-between ${guestsOpen ? 'border-cyan-400 ring-2 ring-cyan-100' : 'border-ink-200 hover:border-cyan-300'}`}
                  >
                    <span className="text-ink-800 truncate">{guestSummary}</span>
                    <ChevronDown size={15} className={`text-ink-400 shrink-0 transition-transform ${guestsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {guestsOpen && (
                    <div className="absolute right-0 top-full mt-1 z-[60] w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-ink-100 p-4 animate-fade-in">
                      {rooms.map((room, idx) => (
                        <div key={idx} className={idx > 0 ? 'pt-3 border-t border-ink-100 mt-3' : ''}>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-sm font-bold text-ink-900">
                              {langKey === 'uz' ? `Xona ${idx + 1}` : langKey === 'ru' ? `Номер ${idx + 1}` : `Room ${idx + 1}`}
                            </span>
                            {rooms.length > 1 && (
                              <button onClick={() => removeRoom(idx)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                <X size={15} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between border border-ink-100 rounded-lg px-3 py-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink-800">{langKey === 'uz' ? 'Kattalar' : langKey === 'ru' ? 'Взрослые' : 'Adults'}</p>
                                <p className="text-[10px] text-ink-400">18+</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => updateRoom(idx, 'adults', Math.max(1, room.adults - 1))} className="h-7 w-7 rounded-lg border border-ink-200 hover:border-cyan-400 hover:text-cyan-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors" disabled={room.adults <= 1}>
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-bold w-5 text-center tabular">{room.adults}</span>
                                <button onClick={() => updateRoom(idx, 'adults', Math.min(10, room.adults + 1))} className="h-7 w-7 rounded-lg border border-ink-200 hover:border-cyan-400 hover:text-cyan-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors" disabled={room.adults >= 10}>
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border border-ink-100 rounded-lg px-3 py-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink-800">{langKey === 'uz' ? 'Bolalar' : langKey === 'ru' ? 'Дети' : 'Children'}</p>
                                <p className="text-[10px] text-ink-400">0-17</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => updateRoom(idx, 'children', Math.max(0, room.children - 1))} className="h-7 w-7 rounded-lg border border-ink-200 hover:border-cyan-400 hover:text-cyan-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors" disabled={room.children <= 0}>
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-bold w-5 text-center tabular">{room.children}</span>
                                <button onClick={() => updateRoom(idx, 'children', Math.min(10, room.children + 1))} className="h-7 w-7 rounded-lg border border-ink-200 hover:border-cyan-400 hover:text-cyan-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors" disabled={room.children >= 10}>
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {rooms.length < 5 && (
                        <button onClick={addRoom} className="w-full mt-3 py-2.5 text-sm font-bold text-cyan-600 border border-dashed border-cyan-300 rounded-lg hover:bg-cyan-50 transition-colors flex items-center justify-center gap-1.5">
                          <Plus size={16} />
                          {langKey === 'uz' ? "Xona qo'shish" : langKey === 'ru' ? 'Добавить номер' : 'Add a room'}
                        </button>
                      )}
                      <button onClick={() => setGuestsOpen(false)} className="w-full mt-3 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700 transition-all">
                        {langKey === 'uz' ? "Tayyor" : langKey === 'ru' ? 'Готово' : 'Done'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-300/40 hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl transition-all sm:self-end"
                style={{ minHeight: '44px' }}
              >
                <SearchIcon size={18} />
                {langKey === 'uz' ? "Qidirish" : langKey === 'ru' ? 'Искать' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Results ── */}
      {searched && (
        <section id="search-results" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">
              {filteredProperties.length} {langKey === 'uz' ? "natija" : langKey === 'ru' ? 'результатов' : 'results'}
              <span className="text-ink-400 font-medium text-base ml-2">— {TABS.find((tb) => tb.id === activeTab)?.labelKey[langKey]}</span>
            </h2>
          </div>
          {filteredProperties.length === 0 ? (
            <div className="card p-12 text-center border border-ink-100">
              <p className="text-sm text-ink-400">{langKey === 'uz' ? "Bu turdagi obyektlar topilmadi" : langKey === 'ru' ? 'Объекты этого типа не найдены' : 'No properties of this type found'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProperties.map((p, i) => (
                <div key={p.id} className="card overflow-hidden border border-ink-100 hover:shadow-lg transition-shadow group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={PROPERTY_IMAGES[i % PROPERTY_IMAGES.length]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="chip text-xs font-bold bg-white/90 text-cyan-700 backdrop-blur-sm">{p.type}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="chip text-xs font-bold bg-white/90 text-amber-600 backdrop-blur-sm">
                        <Star size={11} className="fill-amber-400 text-amber-400" /> 4.{5 + (i % 3)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-ink-900 truncate">{p.name}</p>
                    <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                      <MapPin size={12} /> {p.city}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-ink-500">
                        <BedDouble size={14} className="text-ink-400" /> {p.rooms} {langKey === 'uz' ? "xona" : langKey === 'ru' ? 'ном.' : 'rooms'}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink-400">{langKey === 'uz' ? "dan" : langKey === 'ru' ? 'от' : 'from'}</p>
                        <p className="text-lg font-extrabold text-cyan-600">{((p.mrr / Math.max(p.rooms, 1)) * 12750).toLocaleString('en-US', { maximumFractionDigits: 0 })} UZS</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Products ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">
            {langKey === 'uz' ? "Bizning mahsulotlar" : langKey === 'ru' ? 'Наши продукты' : 'Our Products'}
          </h2>
          <p className="mt-3 text-ink-500 max-w-xl mx-auto">
            {langKey === 'uz' ? "Mehmonxona biznesingizning har bir bosqichi uchun professional vositalar" : langKey === 'ru' ? 'Профессиональные инструменты для каждого этапа вашего отельного бизнеса' : 'Professional tools for every stage of your hotel business'}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            const isSoon = p.status === 'soon';
            return (
              <div key={p.title.en} className={`card p-6 border transition-all relative ${isSoon ? 'border-amber-200 bg-amber-50/30' : 'border-ink-100 hover:shadow-lg'}`}>
                {isSoon && (
                  <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-[11px] font-extrabold shadow-md">
                    <Clock size={11} />
                    {langKey === 'uz' ? "Tez kunda" : langKey === 'ru' ? 'Скоро' : 'Soon'}
                  </div>
                )}
                <div className={`h-12 w-12 rounded-xl text-white flex items-center justify-center shadow-lg mb-5 ${isSoon ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-200/40' : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-200/40'}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink-900 mb-2">{p.title[langKey]}</h3>
                <p className="text-sm text-ink-500 leading-relaxed mb-4">{p.desc[langKey]}</p>
                <ul className="space-y-2 mb-4">
                  {p.features[langKey].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-700">
                      <Check size={15} className={isSoon ? 'text-amber-400' : 'text-emerald-500'} shrink-0 /> {f}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-ink-100">
                  {isSoon ? (
                    <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                      <Clock size={13} /> {langKey === 'uz' ? "Ishlab chiqilmoqda" : langKey === 'ru' ? 'В разработке' : 'Under Development'}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-cyan-600 flex items-center gap-1.5">
                      <Users size={13} /> {p.forWho[langKey]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-white">
            {[
              { icon: Building2, value: '12+', label: langKey === 'uz' ? 'Mehmonxona' : langKey === 'ru' ? 'Объектов' : 'Properties' },
              { icon: CalendarRange, value: '800+', label: langKey === 'uz' ? 'Xonalar' : langKey === 'ru' ? 'Номеров' : 'Rooms' },
              { icon: Zap, value: '99.9%', label: langKey === 'uz' ? 'Ishlash vaqti' : langKey === 'ru' ? 'Аптайм' : 'Uptime' },
              { icon: TrendingUp, value: '+38%', label: langKey === 'uz' ? "To'g'ridan-to'g'ri bron o'sishi" : langKey === 'ru' ? 'Рост прямых броней' : 'Direct booking growth' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <Icon size={28} className="mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-extrabold">{s.value}</p>
                  <p className="text-sm opacity-80 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section id="apply" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">
            {langKey === 'uz' ? "Mehmonxona ulash so'rovi" : langKey === 'ru' ? 'Заявка на подключение' : 'Hotel Connection Request'}
          </h2>
          <p className="mt-3 text-ink-500">
            {langKey === 'uz' ? "Ma'lumotlaringizni qoldiring — biz siz bilan bog'lanamiz" : langKey === 'ru' ? 'Оставьте свои данные — мы свяжемся с вами' : 'Leave your details — we will contact you'}
          </p>
        </div>
        <div className="card p-6 sm:p-8 border border-ink-100">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{langKey === 'uz' ? 'Mehmonxona nomi' : langKey === 'ru' ? 'Название отеля' : 'Hotel name'} *</label>
              <input value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} className="input" placeholder="Grand Hotel" />
            </div>
            <div>
              <label className="label">{langKey === 'uz' ? "Bog'lanish shaxsi" : langKey === 'ru' ? 'Контактное лицо' : 'Contact person'} *</label>
              <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="input" placeholder="Jasur Makhmudov" />
            </div>
            <div>
              <label className="label">{langKey === 'uz' ? 'Telefon' : langKey === 'ru' ? 'Телефон' : 'Phone'} *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+998 90 123 45 67" />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="info@hotel.uz" />
            </div>
            <div>
              <label className="label">{langKey === 'uz' ? "Shahar" : langKey === 'ru' ? 'Город' : 'City'}</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input">
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{langKey === 'uz' ? "Xonalar soni" : langKey === 'ru' ? 'Количество номеров' : 'Number of rooms'}</label>
              <input value={form.roomCount} onChange={(e) => setForm({ ...form, roomCount: e.target.value })} className="input" placeholder="50" type="number" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">{langKey === 'uz' ? "Xabar" : langKey === 'ru' ? 'Сообщение' : 'Message'}</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input min-h-[80px] resize-y" placeholder={langKey === 'uz' ? "Qo'shimcha ma'lumot..." : langKey === 'ru' ? 'Дополнительная информация...' : 'Additional details...'} />
          </div>
          <button
            onClick={submitForm}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 w-full mt-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-200/40 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-60 transition-all"
          >
            <Send size={16} /> {submitting ? '...' : (langKey === 'uz' ? "So'rov yuborish" : langKey === 'ru' ? 'Отправить заявку' : 'Submit Request')}
          </button>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="bg-ink-50 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 text-center mb-8">
            {langKey === 'uz' ? "Bog'lanish" : langKey === 'ru' ? 'Контакты' : 'Contact Us'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <a href="https://t.me/hospitalx_uz" target="_blank" rel="noopener noreferrer" className="card p-5 text-center hover:shadow-lg transition-shadow border border-ink-100 group">
              <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle size={22} />
              </div>
              <p className="text-sm font-bold text-ink-900">Telegram</p>
              <p className="text-xs text-ink-400 mt-1">@hospitalx_uz</p>
            </a>
            <a href="tel:+998901112233" className="card p-5 text-center hover:shadow-lg transition-shadow border border-ink-100 group">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Phone size={22} />
              </div>
              <p className="text-sm font-bold text-ink-900">{langKey === 'uz' ? 'Telefon' : langKey === 'ru' ? 'Телефон' : 'Phone'}</p>
              <p className="text-xs text-ink-400 mt-1">+998 90 111 22 33</p>
            </a>
            <a href="mailto:info@hospitalx.uz" className="card p-5 text-center hover:shadow-lg transition-shadow border border-ink-100 group">
              <div className="h-11 w-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Mail size={22} />
              </div>
              <p className="text-sm font-bold text-ink-900">Email</p>
              <p className="text-xs text-ink-400 mt-1">info@hospitalx.uz</p>
            </a>
            <div className="card p-5 text-center border border-ink-100">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <MapPin size={22} />
              </div>
              <p className="text-sm font-bold text-ink-900">{langKey === 'uz' ? "Manzil" : langKey === 'ru' ? 'Адрес' : 'Address'}</p>
              <p className="text-xs text-ink-400 mt-1">{langKey === 'uz' ? "Toshkent, O'zbekiston" : langKey === 'ru' ? 'Ташкент, Узбекистан' : 'Tashkent, Uzbekistan'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-ink-900 text-ink-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm">
          <p className="font-bold text-white mb-1">HospitaX — Hospitality Cloud</p>
          <p>© 2024 HospitaX. {langKey === 'uz' ? "Barcha huquqlar himoyalangan" : langKey === 'ru' ? 'Все права защищены' : 'All rights reserved'}.</p>
        </div>
      </footer>

      {/* ── Login Modal ── */}
      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setLoginOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ink-900">
                {langKey === 'uz' ? "Shaxsiy kabinetga kirish" : langKey === 'ru' ? 'Вход в личный кабинет' : 'Sign In'}
              </h3>
              <button onClick={() => setLoginOpen(false)} className="btn-ghost h-8 w-8 !p-0 rounded-lg">✕</button>
            </div>
            <p className="text-sm text-ink-500 mb-4">
              {langKey === 'uz' ? "Rolingizni tanlang (demo):" : langKey === 'ru' ? 'Выберите роль (демо):' : 'Select your role (demo):'}
            </p>
            <div className="space-y-2">
              {roles.map((role) => {
                const labels = ROLE_LABELS[role];
                return (
                  <button
                    key={role}
                    onClick={() => { login(role); setLoginOpen(false); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-ink-100 hover:border-cyan-200 hover:bg-cyan-50/40 transition-all text-left group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{labels[langKey]}</p>
                      <p className="text-xs text-ink-400">{labels.en}</p>
                    </div>
                    <ArrowRight size={16} className="text-ink-300 group-hover:text-cyan-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
