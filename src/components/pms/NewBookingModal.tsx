import { useState } from 'react';
import { X, Phone, Mail, DollarSign } from 'lucide-react';
import type { Room, RoomCategory, Tariff } from '../../types';
import { UZS } from '../../utils';
import { useLang } from '../../i18n';
import type { CurrencyLang } from '../../utils';

interface NewBookingModalProps {
  open: boolean;
  onClose: () => void;
  roomId?: string;
  dayOffset?: number;
  rooms: Room[];
  categories: RoomCategory[];
  tariffs: Tariff[];
  lang: CurrencyLang;
  onSubmit: (booking: {
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
  }) => void;
}

export function NewBookingModal({
  open,
  onClose,
  roomId: initialRoomId,
  dayOffset: initialDayOffset,
  rooms,
  categories,
  tariffs,
  lang,
  onSubmit,
}: NewBookingModalProps) {
  const { t } = useLang();
  const [guestName, setGuestName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [nights, setNights] = useState(1);
  const [startOffset, setStartOffset] = useState(initialDayOffset || 0);
  const [tariffId, setTariffId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [notes, setNotes] = useState('');

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const selectedTariff = tariffs.find((t) => t.id === tariffId);
  const nightly = selectedTariff?.pricePerNight || 0;
  const total = nightly * nights;

  const handleSubmit = () => {
    if (!guestName || !roomId || !tariffId || nights <= 0) {
      return;
    }

    onSubmit({
      guestName,
      phoneNumber,
      email,
      roomId,
      startOffset,
      nights,
      tariffId,
      total,
      paymentStatus,
      notes: notes || undefined,
    });

    setGuestName('');
    setPhoneNumber('');
    setEmail('');
    setRoomId('');
    setNights(1);
    setStartOffset(0);
    setTariffId('');
    setPaymentStatus('Unpaid');
    setNotes('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card max-h-[90vh] flex flex-col w-full max-w-2xl bg-white rounded-xl overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-xl font-bold text-ink-900">Yangi Bron Qo'shish</h2>
          <button
            onClick={onClose}
            className="btn-ghost h-9 w-9 !p-0 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Guest Information */}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2 flex items-center gap-1">
                <Phone size={14} /> Telefon
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

          {/* Room & Dates */}
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
              <label className="block text-sm font-semibold text-ink-700 mb-2">Xona Tumligi</label>
              {selectedRoom && categories.find((c) => c.id === selectedRoom.categoryId) && (
                <p className="text-sm text-ink-600 mt-2">
                  {categories.find((c) => c.id === selectedRoom.categoryId)?.name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Kirish Kuni (offset)</label>
              <input
                type="number"
                value={startOffset}
                onChange={(e) => setStartOffset(Math.max(0, parseInt(e.target.value) || 0))}
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
              <label className="block text-sm font-semibold text-ink-700 mb-2">Tarif *</label>
              <select value={tariffId} onChange={(e) => setTariffId(e.target.value)} className="input w-full">
                <option value="">Tarifni tanlang...</option>
                {tariffs.map((tariff) => (
                  <option key={tariff.id} value={tariff.id}>
                    {tariff.name} - {UZS(tariff.pricePerNight, lang)}/tun
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Payment */}
          <div className="grid grid-cols-2 gap-4 bg-ink-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-ink-500 mb-1">Kunlik narxi</p>
              <p className="text-lg font-bold text-ink-900 flex items-center gap-1">
                <DollarSign size={16} /> {UZS(nightly, lang)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1">Jami narxi ({nights} tun)</p>
              <p className="text-lg font-bold text-indigo-600 flex items-center gap-1">
                <DollarSign size={16} /> {UZS(total, lang)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">To'lov Holati</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className="input w-full">
              <option value="Paid">To'liq to'langan</option>
              <option value="Partial">Qisman to'langan</option>
              <option value="Unpaid">To'lanmagan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Qaydlar va Maxsus Talablar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eslatmalar..."
              className="input w-full min-h-20 resize-none"
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3 justify-end px-6 py-4 border-t border-ink-100 bg-white">
          <button onClick={onClose} className="btn-secondary">
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={!guestName || !roomId || !tariffId || nights <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bronni Qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}
