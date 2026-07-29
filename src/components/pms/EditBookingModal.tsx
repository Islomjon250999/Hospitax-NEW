import { useState, useEffect, useMemo } from 'react';
import { X, Users, Calendar, Baby } from 'lucide-react';
import type { Booking, Room, RoomCategory, Tariff, ExtraService, BookingStatus, BookingGuest } from '../../types';
import { UZS, todayISO, addDaysISO, nightsBetween } from '../../utils';
import { useLang } from '../../i18n';
import type { CurrencyLang } from '../../utils';

interface EditBookingModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  rooms: Room[];
  categories: RoomCategory[];
  tariffs: Tariff[];
  services: ExtraService[];
  lang: CurrencyLang;
  onSubmit: (booking: Booking) => void;
}

export function EditBookingModal({
  open,
  onClose,
  booking: initialBooking,
  rooms,
  categories,
  tariffs,
  services,
  lang,
  onSubmit,
}: EditBookingModalProps) {
  const { t } = useLang();
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(addDaysISO(todayISO(), 1));
  const [tariffId, setTariffId] = useState('');
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestNames, setGuestNames] = useState<BookingGuest[]>([]);

  useEffect(() => {
    if (initialBooking) {
      setGuestName(initialBooking.guestName);
      setPhone(initialBooking.phone);
      setRoomId(initialBooking.roomId);
      const ci = addDaysISO(todayISO(), initialBooking.startOffset);
      const co = addDaysISO(ci, initialBooking.nights);
      setCheckIn(ci);
      setCheckOut(co);
      setTariffId(initialBooking.tariffId || '');
      setStatus(initialBooking.status);
      setPaymentStatus(initialBooking.paymentStatus);
      setSelectedServices(initialBooking.serviceIds || []);
      setAdults(initialBooking.adults ?? 1);
      setChildren(initialBooking.children ?? 0);
      setGuestNames(initialBooking.guests ?? []);
    }
  }, [initialBooking, open]);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  // Sync guest name fields when adult/child counts change
  useEffect(() => {
    setGuestNames((prev) => {
      const target = adults + children;
      if (prev.length === target) return prev;
      const next = [...prev];
      while (next.length < target) {
        const idx = next.length;
        next.push({
          name: idx === 0 ? guestName : '',
          type: idx < adults ? 'adult' : 'child',
        });
      }
      while (next.length > target) next.pop();
      // Reassign types
      return next.map((g, i) => ({ ...g, type: i < adults ? 'adult' as const : 'child' as const }));
    });
  }, [adults, children]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTariff = tariffs.find((tm) => tm.id === tariffId);
  const room = rooms.find((r) => r.id === roomId);
  const nightly = selectedTariff?.dailyRate ?? room?.baseRate ?? 0;
  const baseTotal = nightly * nights;

  const selectedServiceObjs = services.filter((s) => selectedServices.includes(s.id));
  const serviceTotal = selectedServiceObjs.reduce((sum, s) => {
    if (s.calcType === 'Per Night') return sum + s.unitPrice * nights;
    if (s.calcType === 'One-Time') return sum + s.unitPrice;
    return sum + s.unitPrice;
  }, 0);
  const total = baseTotal + serviceTotal;

  const toggleService = (id: string) => {
    setSelectedServices((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const selectedCategory = categories.find((c) => c.id === room?.categoryId);
  const maxAdults = selectedCategory?.maxAdults ?? 10;
  const maxChildren = selectedCategory?.maxChildren ?? 10;

  const handleGuestNameChange = (idx: number, name: string) => {
    setGuestNames((prev) => prev.map((g, i) => (i === idx ? { ...g, name } : g)));
    if (idx === 0) setGuestName(name);
  };

  const handleSubmit = () => {
    if (!initialBooking || !guestName || !roomId || nights <= 0) return;

    const startOffset = Math.round(
      (new Date(checkIn + 'T00:00:00').getTime() - new Date(todayISO() + 'T00:00:00').getTime()) / 86400000,
    );

    const updated: Booking = {
      ...initialBooking,
      guestName,
      phone,
      roomId,
      nights,
      startOffset,
      tariffId: tariffId || undefined,
      status,
      paymentStatus,
      total,
      serviceIds: selectedServices,
      adults,
      children,
      guests: guestNames,
    };

    onSubmit(updated);
    onClose();
  };

  if (!open || !initialBooking) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-6 h-16 border-b border-ink-100">
          <h2 className="text-xl font-bold text-ink-900">{t('eb_title')}</h2>
          <button onClick={onClose} className="btn-ghost h-9 w-9 !p-0 flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* 1. Guest Counts — Adults & Children */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} className="text-ink-400" />
                  {t('eb_adults')}
                </span>
              </label>
              <input
                type="number"
                min={1}
                max={maxAdults}
                value={adults}
                onChange={(e) => setAdults(Math.min(maxAdults, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Baby size={14} className="text-ink-400" />
                  {t('eb_children')}
                </span>
              </label>
              <input
                type="number"
                min={0}
                max={maxChildren}
                value={children}
                onChange={(e) => setChildren(Math.min(maxChildren, Math.max(0, parseInt(e.target.value) || 0)))}
                className="input w-full"
              />
            </div>
          </div>

          {/* 2. Dynamic Guest Names */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_guestNames')}</label>
            <div className="space-y-2 rounded-xl border border-ink-200 p-3 bg-ink-50/50">
              {guestNames.map((g, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                      g.type === 'adult'
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {g.type === 'adult' ? <Users size={12} /> : <Baby size={12} />}
                    {t('eb_guest')} {idx + 1} ({g.type === 'adult' ? t('eb_guestAdult') : t('eb_guestChild')})
                  </span>
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => handleGuestNameChange(idx, e.target.value)}
                    placeholder={t('eb_guestNamePh')}
                    className="input flex-1 !py-1.5 !text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Dates + Nights/Price Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" />
                  {t('eb_checkInDate')}
                </span>
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => {
                  const newCi = e.target.value;
                  if (newCi >= checkOut) {
                    setCheckOut(addDaysISO(newCi, 1));
                  }
                  setCheckIn(newCi);
                }}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" />
                  {t('eb_checkOutDate')}
                </span>
              </label>
              <input
                type="date"
                value={checkOut}
                min={addDaysISO(checkIn, 1)}
                onChange={(e) => {
                  if (e.target.value > checkIn) setCheckOut(e.target.value);
                }}
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-indigo-50 px-4 py-3 flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-400">{t('eb_nights')}</p>
              <p className="text-lg font-extrabold text-indigo-700 tabular leading-tight mt-0.5">
                {nights} <span className="text-xs font-medium text-indigo-400">{t('eb_nightsCalc')}</span>
              </p>
            </div>
            <div className="rounded-xl bg-ink-50 px-4 py-3 flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t('eb_ratePerDay')}</p>
              <p className="text-lg font-bold text-ink-800 tabular leading-tight mt-0.5">{UZS(nightly, lang)}</p>
            </div>
            <div className="rounded-xl bg-ink-50 px-4 py-3 flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t('eb_totalPrice')}</p>
              <p className="text-lg font-extrabold text-indigo-600 tabular leading-tight mt-0.5">{UZS(total, lang)}</p>
            </div>
          </div>

          {/* 4. Room + Tariff */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_room')} *</label>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="input w-full">
                <option value="">{t('eb_selectRoom')}</option>
                {rooms.map((room) => {
                  const cat = categories.find((c) => c.id === room.categoryId);
                  return (
                    <option key={room.id} value={room.id}>
                      {room.label} - {cat?.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_tariff')}</label>
              <select value={tariffId} onChange={(e) => setTariffId(e.target.value)} className="input w-full">
                <option value="">{t('eb_selectTariff')}</option>
                {tariffs
                  .filter((tm) => !room || tm.categoryId === room.categoryId)
                  .map((tariff) => (
                    <option key={tariff.id} value={tariff.id}>
                      {tariff.name} - {UZS(tariff.dailyRate, lang)}/kun
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* 5. Phone */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="input w-full"
            />
          </div>

          {/* 6. Extra Services */}
          {services.filter((s) => s.active).length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_addonServices')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-ink-200 rounded-lg p-3 bg-ink-50">
                {services.filter((s) => s.active).map((s) => {
                  const on = selectedServices.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${on ? 'bg-indigo-50' : 'hover:bg-ink-100'}`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleService(s.id)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm font-medium text-ink-700 flex-1">{s.name}</span>
                      <span className="text-xs text-ink-400">{UZS(s.unitPrice, lang)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="rounded-xl bg-ink-50 p-4 space-y-1.5">
            {selectedTariff && (
              <div className="flex justify-between text-xs">
                <span className="text-ink-400">{selectedTariff.name} ({nights} {t('eb_nightsCalc')})</span>
                <span className="tabular text-ink-600">{UZS(baseTotal, lang)}</span>
              </div>
            )}
            {selectedServiceObjs.map((s) => (
              <div key={s.id} className="flex justify-between text-xs">
                <span className="text-ink-400">{s.name}</span>
                <span className="tabular text-ink-600">{UZS(s.calcType === 'Per Night' ? s.unitPrice * nights : s.unitPrice, lang)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1.5 border-t border-ink-200">
              <span className="font-bold text-ink-900">{t('eb_totalPrice')}</span>
              <span className="text-lg font-extrabold text-indigo-600 tabular">{UZS(total, lang)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-ink-400">{t('eb_bookingId')}</span>
              <span className="font-mono text-ink-600">{initialBooking.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_bookingStatus')}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)} className="input w-full">
                <option value="Confirmed">{t('status_confirmed')}</option>
                <option value="Checked-in">{t('status_checkedIn')}</option>
                <option value="Pending">{t('status_pending')}</option>
                <option value="Checked-out">{t('status_checkedOut')}</option>
                <option value="Blocked">{t('status_blocked')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_paymentStatus')}</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Partial' | 'Unpaid')} className="input w-full">
                <option value="Paid">{t('pay_paid')}</option>
                <option value="Partial">{t('pay_partial')}</option>
                <option value="Unpaid">{t('pay_unpaid')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fixed footer with proper padding, spacing, and border */}
        <div className="flex-shrink-0 flex items-center gap-3 justify-end px-6 py-4 border-t border-ink-100 bg-white">
          <button onClick={onClose} className="btn-secondary px-5 py-2.5 text-sm">
            {t('eb_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!guestName || !roomId || nights <= 0}
            className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('eb_save')}
          </button>
        </div>
      </div>
    </div>
  );
}
