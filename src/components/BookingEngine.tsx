import { useMemo, useState } from 'react';
import {
  Calendar,
  Users,
  Star,
  Wifi,
  Wind,
  Tv,
  CupSoda,
  Utensils,
  Waves,
  Mountain,
  Maximize,
  Check,
  ArrowRight,
  Lock,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Palette,
} from 'lucide-react';
import type { BookingEngineRoom } from '../types';
import { engineRooms } from '../mockData';
import { UZS, UZS_SHORT, todayISO, addDaysISO, nightsBetween, prettyDate } from '../utils';
import { Modal } from './ui';
import { useToast } from '../toast';
import { useLang } from '../i18n';

const AMENITY_ICON: Record<string, typeof Wifi> = {
  'Free WiFi': Wifi,
  'Air conditioning': Wind,
  'Smart TV': Tv,
  'Mini bar': CupSoda,
  'Work desk': Maximize,
  'Living area': Maximize,
  'Espresso machine': CupSoda,
  'Full kitchen': Utensils,
  'Private pool': Waves,
  'Terrace': Mountain,
  'Garden': Mountain,
  'City view': Mountain,
  'Garden view': Mountain,
  'Panoramic view': Mountain,
  'Daily housekeeping': Sparkles,
};

const PRESET_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Violet', value: '#7c3aed' },
];

export function BookingEngine() {
  const { lang, t } = useLang();
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(addDaysISO(todayISO(), 2));
  const [guests, setGuests] = useState(2);
  const [accent, setAccent] = useState('#4f46e5');
  const [checkoutRoom, setCheckoutRoom] = useState<BookingEngineRoom | null>(null);

  const nights = useMemo(() => Math.max(1, nightsBetween(checkIn, checkOut)), [checkIn, checkOut]);
  const validDates = nights >= 1 && checkOut > checkIn;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">{t('be_title')}</h2>
          <p className="text-sm text-ink-500 mt-0.5">{t('be_sub')}</p>
        </div>
        <span className="chip text-indigo-700 bg-indigo-50 ring-1 ring-indigo-600/20">
          <Sparkles size={12} /> {t('be_livePreview')}
        </span>
      </div>

      {/* ---- Customization bar ---- */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-ink-400" />
          <span className="text-sm font-semibold text-ink-700">{t('be_primaryColor')}</span>
        </div>
        <div className="flex items-center gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setAccent(c.value)}
              className={`h-8 w-8 rounded-full transition-all ${
                accent === c.value ? 'ring-2 ring-offset-2 ring-ink-400 scale-110' : 'hover:scale-110'
              }`}
              style={{ background: c.value }}
              title={c.name}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 ml-2">
          <span className="text-xs text-ink-400">{t('be_custom')}</span>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="h-8 w-12 rounded-lg border border-ink-200 cursor-pointer"
          />
        </label>
      </div>

      {/* ---- Hero / search bar ---- */}
      <div className="relative rounded-2xl overflow-hidden shadow-card">
        <img
          src="https://images.pexels.com/photos/5417106/pexels-photo-5417106.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Hotel"
          className="h-56 sm:h-72 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
          <div className="flex items-center gap-1 mb-1" style={{ color: accent }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tashkent Grand Hotel</h2>
          <p className="text-white/80 text-sm mt-1">Amir Temur Avenue, Tashkent · 184 rooms · Spa & rooftop restaurant</p>
        </div>
      </div>

      {/* ---- Date / guest selector ---- */}
      <div className="card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label"><Calendar size={12} className="inline mr-1" /> {t('be_checkIn')}</label>
            <input type="date" value={checkIn} min={todayISO()} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(addDaysISO(e.target.value, 1)); }} className="input" />
          </div>
          <div>
            <label className="label"><Calendar size={12} className="inline mr-1" /> {t('be_checkOut')}</label>
            <input type="date" value={checkOut} min={addDaysISO(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label"><Users size={12} className="inline mr-1" /> {t('be_guests')}</label>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? t('be_guest') : t('be_guests')}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-xl px-4 py-2.5 text-white" style={{ background: accent }}>
              <p className="text-[10px] uppercase tracking-wide opacity-80 font-semibold">{t('be_lengthStay')}</p>
              <p className="text-sm font-bold">{nights} {nights === 1 ? t('be_night') : t('be_nights')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Room selection cards ---- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-ink-900">{t('be_availableRooms')}</h3>
          <p className="text-xs text-ink-400">{engineRooms.length} {t('be_roomTypes')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {engineRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              nights={nights}
              guests={guests}
              valid={validDates}
              accent={accent}
              onBook={() => setCheckoutRoom(room)}
            />
          ))}
        </div>
      </div>

      {/* ---- Checkout modal ---- */}
      <Modal
        open={!!checkoutRoom}
        onClose={() => setCheckoutRoom(null)}
        title={t('be_completeBooking')}
        size="xl"
        icon={<ShieldCheck size={18} style={{ color: accent }} />}
      >
        {checkoutRoom && (
          <CheckoutFlow
            room={checkoutRoom}
            nights={nights}
            guests={guests}
            checkIn={checkIn}
            checkOut={checkOut}
            accent={accent}
            lang={lang}
            onClose={() => setCheckoutRoom(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function RoomCard({
  room,
  nights,
  guests,
  valid,
  accent,
  onBook,
}: {
  room: BookingEngineRoom;
  nights: number;
  guests: number;
  valid: boolean;
  accent: string;
  onBook: () => void;
}) {
  const { lang, t } = useLang();
  const total = room.price * nights;
  const fits = guests <= room.capacity;
  const [qty, setQty] = useState(1);

  return (
    <div className="card overflow-hidden group hover:shadow-float transition-shadow flex flex-col sm:flex-row">
      <div className="relative sm:w-2/5 shrink-0">
        <img src={room.image} alt={room.name} className="h-48 sm:h-full w-full object-cover" />
        <span className="absolute top-3 left-3 chip bg-white/90 backdrop-blur text-ink-700">
          {room.available} {t('be_left')}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-bold text-ink-900">{room.name}</h4>
            <p className="text-xs text-ink-500 mt-1">{room.desc}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1"><Users size={13} /> {t('be_upTo')} {room.capacity}</span>
          <span className="inline-flex items-center gap-1"><Maximize size={13} /> {room.size} m²</span>
          <span className="inline-flex items-center gap-1"><Check size={13} /> {room.beds}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {room.amenities.slice(0, 5).map((a) => {
            const Icon = AMENITY_ICON[a] ?? Sparkles;
            return (
              <span key={a} className="chip bg-ink-100 text-ink-600">
                <Icon size={11} /> {a}
              </span>
            );
          })}
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-ink-400">{UZS(room.price, lang)} {t('be_perNight')}</p>
            <p className="text-lg font-extrabold text-ink-900 tabular">{UZS(total * qty, lang)}</p>
            <p className="text-[10px] text-ink-400">{nights} {t('be_nights')} × {qty}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-ink-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2.5 py-1.5 text-ink-500 hover:bg-ink-50">−</button>
              <span className="px-3 text-sm font-semibold tabular">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(room.available, q + 1))} className="px-2.5 py-1.5 text-ink-500 hover:bg-ink-50">+</button>
            </div>
            <button
              onClick={onBook}
              disabled={!valid || !fits}
              className="btn px-4 py-2.5 text-sm text-white shadow-sm"
              style={{ background: accent }}
              title={!fits ? `${t('be_exceedsCapacity')} (${room.capacity})` : !valid ? t('be_selectDates') : ''}
            >
              {t('be_bookNow')} <ArrowRight size={15} />
            </button>
          </div>
        </div>
        {!fits && <p className="text-[11px] text-rose-500 mt-2">{t('be_fitsUpTo')} {room.capacity} {t('be_guests2')}.</p>}
      </div>
    </div>
  );
}

function CheckoutFlow({
  room,
  nights,
  guests,
  checkIn,
  checkOut,
  accent,
  lang,
  onClose,
}: {
  room: BookingEngineRoom;
  nights: number;
  guests: number;
  checkIn: string;
  checkOut: string;
  accent: string;
  lang: 'uz' | 'ru' | 'en';
  onClose: () => void;
}) {
  const { t } = useLang();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('');
  const [done, setDone] = useState(false);
  const toast = useToast();

  const subtotal = room.price * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const tourismTax = Math.round(subtotal * 0.02);
  const total = subtotal + serviceFee + tourismTax;

  if (done) {
    return (
      <div className="text-center py-6 animate-scale-in">
        <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-xl font-extrabold text-ink-900">{t('be_bookingConfirmed')}</h3>
        <p className="text-sm text-ink-500 mt-2 max-w-md mx-auto">
          {t('be_confirmationSent')} {email || t('be_yourEmail')}. {firstName || ''} {t('be_checkedIn')}{' '}
          {prettyDate(checkIn)} — {prettyDate(checkOut)}.
        </p>
        <div className="mt-5 inline-flex flex-col gap-1 rounded-xl bg-ink-50 px-6 py-4 text-left">
          <Row label={`${t('be_confirmation')}`} value={`HX-${Date.now().toString().slice(-6)}`} />
          <Row label={t('be_roomLabel')} value={room.name} />
          <Row label={t('be_totalPaid')} value={UZS(total, lang)} />
        </div>
        <div className="mt-5">
          <button onClick={onClose} className="btn-secondary px-5 py-2.5 text-sm">{t('be_close')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="card p-5">
          <h3 className="font-bold text-ink-900 mb-4">{t('be_guestDetails')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">{t('be_firstName')}</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jasur" className="input" /></div>
            <div><label className="label">{t('be_lastName')}</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Makhmudov" className="input" /></div>
            <div><label className="label">{t('be_email')}</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="jasur@example.com" className="input" /></div>
            <div><label className="label">{t('be_phone')}</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="input" /></div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-ink-900">{t('be_payment')}</h3>
            <span className="chip bg-ink-100 text-ink-500"><Lock size={11} /> {t('be_secure')}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">Uzcard</span>
            <span className="chip bg-sky-50 text-sky-700 ring-1 ring-sky-600/20">Humo</span>
            <span className="chip bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20">Visa</span>
            <span className="chip bg-ink-100 text-ink-600">Mastercard</span>
          </div>
          <label className="label">{t('be_cardNumber')}</label>
          <div className="relative">
            <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={card} onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))} placeholder="8600 1234 5678 9012" className="input !pl-10" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div><label className="label">{t('be_expiry')}</label><input placeholder="MM / YY" className="input" /></div>
            <div><label className="label">{t('be_cvc')}</label><input placeholder="123" className="input" /></div>
          </div>
        </div>
      </div>

      {/* ---- Summary ---- */}
      <div className="lg:col-span-1">
        <div className="card p-5">
          <h3 className="font-bold text-ink-900 mb-4">{t('be_orderSummary')}</h3>
          <div className="flex gap-3 mb-4">
            <img src={room.image} alt={room.name} className="h-16 w-20 rounded-lg object-cover" />
            <div>
              <p className="font-semibold text-sm text-ink-800">{room.name}</p>
              <p className="text-xs text-ink-400">{prettyDate(checkIn)} → {prettyDate(checkOut)}</p>
              <p className="text-xs text-ink-400">{guests} {t('be_guests')} · {nights} {t('be_nights')}</p>
            </div>
          </div>
          <div className="space-y-2 border-t border-ink-100 pt-4">
            <Row label={`${t('be_roomLabel')} (${nights} × ${UZS_SHORT(room.price)})`} value={UZS(subtotal, lang)} />
            <Row label={t('be_serviceFee')} value={UZS(serviceFee, lang)} />
            <Row label={t('be_tourismTax')} value={UZS(tourismTax, lang)} />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100">
            <span className="font-bold text-ink-900">{t('be_total')}</span>
            <span className="text-xl font-extrabold text-ink-900 tabular">{UZS(total, lang)}</span>
          </div>
          <button
            onClick={() => { setDone(true); toast(t('be_bookingConfirmed'), 'success'); }}
            disabled={!firstName || !lastName || !email || !card}
            className="btn w-full py-3 mt-4 text-sm text-white"
            style={{ background: accent }}
          >
            <ShieldCheck size={16} /> {t('be_confirmPay')} {UZS(total, lang)}
          </button>
          <p className="text-[11px] text-ink-400 text-center mt-3 flex items-center justify-center gap-1">
            <Lock size={11} /> {t('be_freeCancel')}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-800 tabular">{value}</span>
    </div>
  );
}
