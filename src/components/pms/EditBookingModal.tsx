import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Booking, Room, RoomCategory, Tariff, ExtraService, BookingStatus } from '../../types';
import { UZS } from '../../utils';
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
  const [nights, setNights] = useState(1);
  const [startOffset, setStartOffset] = useState(0);
  const [tariffId, setTariffId] = useState('');
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (initialBooking) {
      setGuestName(initialBooking.guestName);
      setPhone(initialBooking.phone);
      setRoomId(initialBooking.roomId);
      setNights(initialBooking.nights);
      setStartOffset(initialBooking.startOffset);
      setTariffId(initialBooking.tariffId || '');
      setStatus(initialBooking.status);
      setPaymentStatus(initialBooking.paymentStatus);
      setSelectedServices(initialBooking.serviceIds || []);
    }
  }, [initialBooking, open]);

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

  const handleSubmit = () => {
    if (!initialBooking || !guestName || !roomId || nights <= 0) return;

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

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_guest')} *</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={t('eb_guestPh')}
              className="input w-full"
            />
          </div>

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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_checkInOffset')}</label>
              <input
                type="number"
                value={startOffset}
                onChange={(e) => setStartOffset(parseInt(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_nights')} *</label>
              <input
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">{t('eb_ratePerDay')}</label>
              <p className="text-sm font-bold text-ink-800 mt-2">{UZS(nightly, lang)}</p>
            </div>
          </div>

          {/* Extra Services */}
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
                <span className="text-ink-400">{selectedTariff.name} ({nights} {t('eb_nights').toLowerCase()})</span>
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

        <div className="flex-shrink-0 flex items-center gap-3 justify-end px-6 h-16 border-t border-ink-100 bg-white">
          <button onClick={onClose} className="btn-secondary">
            {t('eb_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!guestName || !roomId || nights <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('eb_save')}
          </button>
        </div>
      </div>
    </div>
  );
}
