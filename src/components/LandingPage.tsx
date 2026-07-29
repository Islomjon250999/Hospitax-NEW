import { useState } from 'react';
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
} from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth, ROLE_LABELS } from '../lib/auth';
import { useLang } from '../i18n';
import { useToast } from '../toast';
import { createConnectionRequest } from '../lib/hotelData';

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
  },
];

const CITIES = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Tashkent Region', 'Other'];

export function LandingPage() {
  const { lang, t } = useLang();
  const { login } = useAuth();
  const toast = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [form, setForm] = useState({ hotelName: '', contactName: '', phone: '', email: '', city: 'Tashkent', roomCount: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const langKey = lang as 'uz' | 'ru' | 'en';

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

  const roles: UserRole[] = ['ceo', 'super_admin', 'manager', 'receptionist', 'housekeeping'];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-extrabold tracking-tight text-ink-900 text-[15px]">
                Hospita<span className="text-indigo-600">X</span>
              </p>
              <p className="text-[9px] uppercase tracking-widest text-ink-400 font-semibold">Hospitality Cloud</p>
            </div>
          </div>
          <button
            onClick={() => setLoginOpen(true)}
            className="btn-primary px-4 py-2 text-sm font-bold"
          >
            <ShieldCheck size={16} />
            {langKey === 'uz' ? "Shaxsiy kabinetga kirish" : langKey === 'ru' ? 'Войти в личный кабинет' : 'Login / Sign In'}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-4">
                <Sparkles size={13} /> HospitaX Hospitality Cloud
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-900 leading-[1.1]">
                {langKey === 'uz' ? "Mehmonxona boshqaruvi uchun bitta platforma" : langKey === 'ru' ? 'Единая платформа для управления отелем' : 'One platform for hotel management'}
              </h1>
              <p className="mt-5 text-lg text-ink-500 leading-relaxed max-w-lg">
                {langKey === 'uz'
                  ? "PMS, Channel Manager va Booking Engine — mehmonxona biznesingizni raqamlashtirish uchun barcha vositalar bitta tizimda."
                  : langKey === 'ru'
                  ? 'PMS, Channel Manager и Booking Engine — все инструменты для цифровизации вашего отеля в одной системе.'
                  : 'PMS, Channel Manager and Booking Engine — all tools to digitize your hotel business in one system.'}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary px-6 py-3 text-sm font-bold"
                >
                  <Send size={16} />
                  {langKey === 'uz' ? "Bepul ulanish so'rovi" : langKey === 'ru' ? 'Бесплатная заявка' : 'Request Free Connection'}
                </button>
                <a
                  href="https://t.me/hospitalx_uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-6 py-3 text-sm font-bold"
                >
                  <MessageCircle size={16} />
                  Telegram
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-ink-600">
                  <Check size={16} className="text-emerald-500" />
                  {langKey === 'uz' ? '12+ mehmonxona' : langKey === 'ru' ? '12+ отелей' : '12+ hotels'}
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <Check size={16} className="text-emerald-500" />
                  {langKey === 'uz' ? '9+ OTA kanallar' : langKey === 'ru' ? '9+ OTA-каналов' : '9+ OTA channels'}
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <Check size={16} className="text-emerald-500" />
                  24/7 {langKey === 'uz' ? 'qo‘llab-quvvatlash' : langKey === 'ru' ? 'поддержка' : 'support'}
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/14036253/pexels-photo-14036253.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Luxury hotel lobby"
                className="rounded-2xl shadow-2xl shadow-indigo-200/40 w-full h-[360px] object-cover"
              />
              <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg p-4 border border-ink-100 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-ink-900">+38%</p>
                    <p className="text-[11px] text-ink-400 font-medium">{langKey === 'uz' ? "To'g'ridan-to'g'ri bronlar o'sishi" : langKey === 'ru' ? 'Рост прямых броней' : 'Direct booking growth'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">
            {langKey === 'uz' ? '3 ta asosiy mahsulot' : langKey === 'ru' ? '3 основных продукта' : '3 Core Products'}
          </h2>
          <p className="mt-3 text-ink-500 max-w-xl mx-auto">
            {langKey === 'uz' ? "Mehmonxona biznesingizning har bir bosqichi uchun professional vositalar" : langKey === 'ru' ? 'Профессиональные инструменты для каждого этапа вашего отельного бизнеса' : 'Professional tools for every stage of your hotel business'}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title.en} className="card p-6 hover:shadow-lg transition-shadow border border-ink-100">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200/40 mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink-900 mb-2">{p.title[langKey]}</h3>
                <p className="text-sm text-ink-500 leading-relaxed mb-4">{p.desc[langKey]}</p>
                <ul className="space-y-2 mb-4">
                  {p.features[langKey].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-700">
                      <Check size={15} className="text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-ink-100">
                  <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                    <Users size={13} /> {p.forWho[langKey]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-white">
            {[
              { icon: Building2, value: '12+', label: langKey === 'uz' ? 'Mehmonxona' : langKey === 'ru' ? 'Отелей' : 'Hotels' },
              { icon: CalendarRange, value: '800+', label: langKey === 'uz' ? 'Xonalar' : langKey === 'ru' ? 'Номеров' : 'Rooms' },
              { icon: Radio, value: '9+', label: langKey === 'uz' ? 'Kanallar' : langKey === 'ru' ? 'Каналов' : 'Channels' },
              { icon: Zap, value: '99.9%', label: langKey === 'uz' ? 'Ishlash vaqti' : langKey === 'ru' ? 'Аптайм' : 'Uptime' },
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
            className="btn-primary w-full mt-5 py-3 text-sm font-bold disabled:opacity-60"
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
              <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
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
              {langKey === 'uz' ? "Rollaringizni tanlang (demo):" : langKey === 'ru' ? 'Выберите роль (демо):' : 'Select your role (demo):'}
            </p>
            <div className="space-y-2">
              {roles.map((role) => {
                const labels = ROLE_LABELS[role];
                return (
                  <button
                    key={role}
                    onClick={() => { login(role); setLoginOpen(false); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-ink-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all text-left group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{labels[langKey]}</p>
                      <p className="text-xs text-ink-400">{labels.en}</p>
                    </div>
                    <ArrowRight size={16} className="text-ink-300 group-hover:text-indigo-500 transition-colors" />
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
