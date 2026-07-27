import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Booking, Room, RoomCategory, Tariff, BookingStatus } from '../../types';
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
    }
  }, [initialBooking, open]);

  const selectedTariff = tariffs.find((t) => t.id === tariffId);
  const nightly = selectedTariff?.dailyRate || 0;
  const total = nightly * nights;

  const handleSubmit = () => {
    if (!initialBooking || !guestName || !roomId || !tariffId || nights <= 0) return;

    const updated: Booking = {
      ...initialBooking,
      guestName,
      phone,
      roomId,
      nights,
      startOffset,
      tariffId,
      status,
      paymentStatus,
      total,
    };

    onSubmit(updated);
    onClose();
  };

  if (!open || !initialBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-ink-200/70 rounded-2xl shadow-float max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-6 h-16 border-b border-ink-100">
          <h2 className="text-xl font-bold text-ink-900">Bronni Tahrirlash</h2>
          <button onClick={onClose} className="btn-ghost h-9 w-9 !p-0 flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Mehmon Ismi *</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Mehmon ismi"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Telefon</label>
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
              <label className="block text-sm font-semibold text-ink-700 mb-2">Xona *</label>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="input w-full">
                <option value="">Xonani tanlang...</option>
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
              <label className="block text-sm font-semibold text-ink-700 mb-2">Tarif *</label>
              <select value={tariffId} onChange={(e) => setTariffId(e.target.value)} className="input w-full">
                <option value="">Tarifni tanlang...</option>
                {tariffs.map((tariff) => (
                  <option key={tariff.id} value={tariff.id}>
                    {tariff.name} - {UZS(tariff.dailyRate, lang)}/kun
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Kirish (offset)</label>
              <input
                type="number"
                value={startOffset}
                onChange={(e) => setStartOffset(parseInt(e.target.value) || 0)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Tun Soni *</label>
              <input
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Narxi/kun</label>
              <p className="text-sm font-bold text-ink-800 mt-2">{UZS(nightly, lang)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-ink-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-ink-500 mb-1">Jami narxi ({nights} tun)</p>
              <p className="text-lg font-bold text-indigo-600">{UZS(total, lang)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1">Bron ID</p>
              <p className="text-sm font-mono text-ink-600">{initialBooking.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Bron Holati</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)} className="input w-full">
                <option value="Confirmed">Tasdiqlangan</option>
                <option value="Checked-in">Joylashgan</option>
                <option value="Pending">Kutilmoqda</option>
                <option value="Checked-out">Chiqib ketgan</option>
                <option value="Blocked">Bloklangan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">To'lov Holati</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className="input w-full">
                <option value="Paid">To'liq to'langan</option>
                <option value="Partial">Qisman to'langan</option>
                <option value="Unpaid">To'lanmagan</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3 justify-end px-6 h-16 border-t border-ink-100 bg-white">
          <button onClick={onClose} className="btn-secondary">
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={!guestName || !roomId || !tariffId || nights <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
