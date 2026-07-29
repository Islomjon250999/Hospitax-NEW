import { useState, useEffect } from 'react';
import { X, Phone, Mail, Users, Baby, Calendar, AlertCircle, AlertTriangle } from 'lucide-react';
import type { Room, RoomCategory, Tariff, BookingGuest, Booking } from '../../types';
import { UZS, todayISO, addDaysISO, nightsBetween, hasDateConflict, exceedsCapacity, exceedsBase } from '../../utils';
import { useLang } from '../../i18n';
import { useRoomAvailability } from '../../lib/useAvailability';
import type { CurrencyLang } from '../../utils';

interface GroupBookingModalProps {
  open: boolean;
  onClose: () => void;
  rooms: Room[];
  categories: RoomCategory[];
  tariffs: Tariff[];
  existingBookings: Booking[];
  lang: CurrencyLang;
  onSubmit: (bookings: Array<{
    guestName: string;
    phoneNumber: string;
    email: string;
    roomId: string;
    startOffset: number;
    nights: number;
    tariffId: string;
    total: number;
    paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
    notes?: string;
    adults: number;
    children: number;
    guests: BookingGuest[];
  }>) => void;
}

export function GroupBookingModal({
  open,
  onClose,
  rooms,
  categories,
  tariffs,
  existingBookings,
  lang,
  onSubmit,
}: GroupBookingModalProps) {
  const { t } = useLang();
  const [groupName, setGroupName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(addDaysISO(todayISO(), 1));
  const [tariffId, setTariffId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [notes, setNotes] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestNames, setGuestNames] = useState<BookingGuest[]>([]);

  const nights = nightsBetween(checkIn, checkOut);
  const unavailableIds = useRoomAvailability(checkIn, checkOut);
  const availableRooms = rooms.filter((r) => !unavailableIds.has(r.id));

  const selectedTariff = tariffs.find((tm) => tm.id === tariffId);
  const nightly = selectedTariff?.dailyRate || 0;
  const totalPerRoom = nightly * nights;
  const totalAll = totalPerRoom * selectedRoomIds.length;

  // Determine max capacity from the first selected room's category
  const firstSelectedRoom = rooms.find((r) => r.id === selectedRoomIds[0]);
  const selectedCategory = categories.find((c) => c.id === firstSelectedRoom?.categoryId);
  const maxAdults = selectedCategory?.maxAdults ?? 10;
  const maxChildren = selectedCategory?.maxChildren ?? 10;

  const groupStartOffset = Math.round((new Date(checkIn + 'T00:00:00').getTime() - new Date(todayISO() + 'T00:00:00').getTime()) / 86400000);
  const conflictingRooms = selectedRoomIds.filter((rid) => hasDateConflict(existingBookings, rid, groupStartOffset, nights));
  const capacityExceeded = selectedCategory ? exceedsCapacity(adults, children, maxAdults, maxChildren) : false;
  const capacityWarn = selectedCategory ? exceedsBase(adults, children, selectedCategory.baseAdults, selectedCategory.baseKids) : false;
  const leadName = guestNames[0]?.name?.trim() || '';
  const canSubmit = !!leadName && !!groupName && selectedRoomIds.length > 0 && !!tariffId && nights > 0 && conflictingRooms.length === 0 && !capacityExceeded && selectedRoomIds.every((rid) => availableRooms.some((r) => r.id === rid));

  // Sync guest name fields when adult/child counts change
  useEffect(() => {
    setGuestNames((prev) => {
      const target = adults + children;
      if (prev.length === target)
        return prev.map((g, i) => ({ ...g, type: i < adults ? 'adult' as const : 'child' as const }));
      const next = [...prev];
      while (next.length < target) {
        const idx = next.length;
        next.push({ name: idx === 0 ? (prev[0]?.name ?? '') : '', type: idx < adults ? 'adult' : 'child' });
      }
      while (next.length > target) next.pop();
      return next.map((g, i) => ({ ...g, type: i < adults ? 'adult' as const : 'child' as const }));
    });
  }, [adults, children]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGuestNameChange = (idx: number, name: string) => {
    setGuestNames((prev) => prev.map((g, i) => (i === idx ? { ...g, name } : g)));

  };

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const startOffset = Math.round(
      (new Date(checkIn + 'T00:00:00').getTime() - new Date(todayISO() + 'T00:00:00').getTime()) / 86400000,
    );

    const bookings = selectedRoomIds.map((roomId) => ({
      guestName: `${groupName} - Xona ${rooms.find((r) => r.id === roomId)?.label}`,
      phoneNumber,
      email,
      roomId,
      startOffset,
      nights,
      tariffId,
      total: totalPerRoom,
      paymentStatus,
      notes: notes || undefined,
      adults,
      children,
      guests: guestNames,
    }));

    onSubmit(bookings);

    setGroupName('');
    setPhoneNumber('');
    setEmail('');
    setSelectedRoomIds([]);
    setCheckIn(todayISO());
    setCheckOut(addDaysISO(todayISO(), 1));
    setTariffId('');
    setPaymentStatus('Unpaid');
    setNotes('');
    setAdults(1);
    setChildren(0);
    setGuestNames([]);
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setGroupName('');
      setPhoneNumber('');
      setEmail('');
      setSelectedRoomIds([]);
      setCheckIn(todayISO());
      setCheckOut(addDaysISO(todayISO(), 1));
      setTariffId('');
      setPaymentStatus('Unpaid');
      setNotes('');
      setAdults(1);
      setChildren(0);
      setGuestNames([]);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-6 h-16 border-b border-ink-100">
          <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2">
            <Users size={24} /> {t('gb_addTitle')}
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost h-9 w-9 !p-0 flex items-center justify-center"
          >
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
                  const v = e.target.value;
                  if (v >= checkOut) setCheckOut(addDaysISO(v, 1));
                  setCheckIn(v);
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
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('gb_tariff')} *</label>
              <select value={tariffId} onChange={(e) => setTariffId(e.target.value)} className="input w-full">
                <option value="">{t('gb_selectTariff')}</option>
                {tariffs.map((tariff) => (
                  <option key={tariff.id} value={tariff.id}>
                    {tariff.name} - {UZS(tariff.dailyRate, lang)}/{t('eb_nightsCalc')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Room Selection */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-3">
              {t('gb_selectRooms')} * ({selectedRoomIds.length})
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto border border-ink-200 rounded-lg p-3 bg-ink-50">
              {availableRooms.length === 0 ? (
                <div className="col-span-2 flex items-center gap-2 p-3">
                  <AlertCircle size={16} className="text-rose-500 shrink-0" />
                  <p className="text-sm font-medium text-rose-600">{t('val_allBooked')}</p>
                </div>
              ) : availableRooms.map((room) => {
                const cat = categories.find((c) => c.id === room.categoryId);
                const isSelected = selectedRoomIds.includes(room.id);
                const hasConflict = isSelected && conflictingRooms.includes(room.id);
                return (
                  <label
                    key={room.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${hasConflict ? 'bg-rose-50' : 'hover:bg-ink-100'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRoom(room.id)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm font-medium text-ink-700">
                      {room.label} ({cat?.name})
                    </span>
                    {hasConflict && <AlertCircle size={14} className="text-rose-500 ml-auto shrink-0" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Validation warnings */}
          {conflictingRooms.length > 0 && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2.5">
              <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-700">{t('val_conflict')} ({conflictingRooms.length} {t('gb_selectRooms')})</p>
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

          {/* Pricing Summary */}
          {selectedRoomIds.length > 0 && (
            <div className="grid grid-cols-3 gap-4 bg-indigo-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-indigo-600 mb-1">{t('gb_perRoomDaily')}</p>
                <p className="text-lg font-bold text-indigo-900">{UZS(nightly, lang)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-600 mb-1">{t('gb_perRoomTotal')} ({nights})</p>
                <p className="text-lg font-bold text-indigo-900">{UZS(totalPerRoom, lang)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-600 mb-1">{t('gb_allRooms')} ({selectedRoomIds.length} x {nights})</p>
                <p className="text-lg font-bold text-indigo-900">{UZS(totalAll, lang)}</p>
              </div>
            </div>
          )}

          {/* 5. Group Information */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">{t('gb_groupName')} *</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('gb_groupNamePh')}
              className="input w-full"
            />
          </div>

          {/* 6. Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2 flex items-center gap-1">
                <Phone size={14} /> {t('eb_phone')}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2 flex items-center gap-1">
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mehmon@example.com"
                className="input w-full"
              />
            </div>
          </div>

          {/* 7. Payment Status */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">{t('gb_paymentStatus')}</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Partial' | 'Unpaid')} className="input w-full">
              <option value="Paid">{t('pay_paid')}</option>
              <option value="Partial">{t('pay_partial')}</option>
              <option value="Unpaid">{t('pay_unpaid')}</option>
            </select>
          </div>

          {/* 8. Notes */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">{t('gb_notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('gb_notesPh')}
              className="input w-full min-h-20 resize-none"
            />
          </div>
        </div>

        {/* Fixed footer with proper padding, spacing, and border */}
        <div className="flex-shrink-0 flex items-center gap-3 justify-end px-6 py-4 border-t border-ink-100 bg-white">
          <button onClick={onClose} className="btn-secondary px-5 py-2.5 text-sm">
            {t('gb_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedRoomIds.length > 0
              ? `${selectedRoomIds.length} — ${t('gb_create')}`
              : t('gb_selectRoom')}
          </button>
        </div>
      </div>
    </div>
  );
}
