import { useState } from 'react';
import { X, Phone, Mail, Users } from 'lucide-react';
import type { Room, RoomCategory, Tariff } from '../../types';
import { UZS } from '../../utils';
import { useLang } from '../../i18n';
import type { CurrencyLang } from '../../utils';

interface GroupBookingModalProps {
  open: boolean;
  onClose: () => void;
  rooms: Room[];
  categories: RoomCategory[];
  tariffs: Tariff[];
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
  }>) => void;
}

export function GroupBookingModal({
  open,
  onClose,
  rooms,
  categories,
  tariffs,
  lang,
  onSubmit,
}: GroupBookingModalProps) {
  const { t } = useLang();
  const [groupName, setGroupName] = useState('');
  const [leadGuestName, setLeadGuestName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [nights, setNights] = useState(1);
  const [startOffset, setStartOffset] = useState(0);
  const [tariffId, setTariffId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [notes, setNotes] = useState('');

  const selectedTariff = tariffs.find((t) => t.id === tariffId);
  const nightly = selectedTariff?.dailyRate || 0;
  const totalPerRoom = nightly * nights;
  const totalAll = totalPerRoom * selectedRoomIds.length;

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSubmit = () => {
    if (!leadGuestName || !groupName || selectedRoomIds.length === 0 || !tariffId || nights <= 0) {
      return;
    }

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
    }));

    onSubmit(bookings);

    setGroupName('');
    setLeadGuestName('');
    setPhoneNumber('');
    setEmail('');
    setSelectedRoomIds([]);
    setNights(1);
    setStartOffset(0);
    setTariffId('');
    setPaymentStatus('Unpaid');
    setNotes('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-6 h-16 border-b border-ink-100">
          <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2">
            <Users size={24} /> Guruhli Bron Qo'shish
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost h-9 w-9 !p-0 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Group Information */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Guruh Ismi *</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Masalan: Qajomijon Oilasi"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Asosiy Mehmon Ismi *</label>
            <input
              type="text"
              value={leadGuestName}
              onChange={(e) => setLeadGuestName(e.target.value)}
              placeholder="Guruh rahbari ismi"
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

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-3">Xonalarni Tanlang * ({selectedRoomIds.length} xona)</label>
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto border border-ink-200 rounded-lg p-3 bg-ink-50">
              {rooms.map((room) => {
                const cat = categories.find((c) => c.id === room.categoryId);
                const isSelected = selectedRoomIds.includes(room.id);
                return (
                  <label
                    key={room.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-ink-100 cursor-pointer transition-colors"
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
                  </label>
                );
              })}
            </div>
          </div>

          {/* Booking Details */}
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
                    {tariff.name} - {UZS(tariff.dailyRate, lang)}/tun
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Summary */}
          {selectedRoomIds.length > 0 && (
            <div className="grid grid-cols-3 gap-4 bg-indigo-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-indigo-600 mb-1">Xona boshiga kunlik narxi</p>
                <p className="text-lg font-bold text-indigo-900">{UZS(nightly, lang)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-600 mb-1">Xona boshiga jami ({nights} tun)</p>
                <p className="text-lg font-bold text-indigo-900">{UZS(totalPerRoom, lang)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-600 mb-1">Barcha xonalar uchun ({selectedRoomIds.length} x {nights})</p>
                <p className="text-lg font-bold text-indigo-900">{UZS(totalAll, lang)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">To'lov Holati</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className="input w-full">
              <option value="Paid">To'liq to'langan</option>
              <option value="Partial">Qisman to'langan</option>
              <option value="Unpaid">To'lanmagan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Qaydlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eslatmalar..."
              className="input w-full min-h-20 resize-none"
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3 justify-end px-6 h-16 border-t border-ink-100 bg-white">
          <button onClick={onClose} className="btn-secondary">
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={!leadGuestName || !groupName || selectedRoomIds.length === 0 || !tariffId || nights <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedRoomIds.length > 0
              ? `${selectedRoomIds.length} Xona uchun Bron Qo'shish`
              : 'Xona Tanlang'}
          </button>
        </div>
      </div>
    </div>
  );
}
