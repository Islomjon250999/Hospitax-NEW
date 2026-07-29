import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wrench,
  RefreshCw,
  BedDouble,
} from 'lucide-react';
import type { Room, RoomCategory, RoomStatus } from '../types';
import { useAuth } from '../lib/auth';
import { useLang } from '../i18n';
import { useToast } from '../toast';
import { supabase } from '../lib/supabase';
import { updateRoomStatus } from '../lib/pmsData';

const STATUS_CONFIG: Record<RoomStatus, { uz: string; ru: string; en: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  Clean: { uz: 'Toza', ru: 'Чистый', en: 'Clean', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  Dirty: { uz: 'Iflos', ru: 'Грязный', en: 'Dirty', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', icon: AlertCircle },
  Inspected: { uz: 'Tekshirilgan', ru: 'Проверен', en: 'Inspected', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', icon: Sparkles },
  Maintenance: { uz: "Ta'mirlashda", ru: 'Ремонт', en: 'Maintenance', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Wrench },
};

const NEXT_STATUS: Record<RoomStatus, RoomStatus> = {
  Dirty: 'Clean',
  Clean: 'Inspected',
  Inspected: 'Clean',
  Maintenance: 'Clean',
};

export function HousekeepingPanel() {
  const { user } = useAuth();
  const { lang } = useLang();
  const toast = useToast();
  const langKey = lang as 'uz' | 'ru' | 'en';
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | RoomStatus>('all');

  const reload = useCallback(async () => {
    try {
      const [roomRes, catRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('categories').select('*'),
      ]);
      if (roomRes.error) throw roomRes.error;
      if (catRes.error) throw catRes.error;
      setRooms((roomRes.data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        label: r.label as string,
        categoryId: r.category_id as string,
        type: r.type as string,
        floor: r.floor as number,
        baseRate: r.base_rate as number,
        status: r.status as RoomStatus,
      })));
      setCategories((catRes.data ?? []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        baseAdults: c.base_adults as number,
        baseKids: c.base_kids as number,
        maxAdults: c.max_adults as number,
        maxChildren: c.max_children as number,
        totalQuantity: c.total_quantity as number,
        roomIds: (c.room_ids as string[]) ?? [],
        description: (c.description as string) ?? undefined,
      })));
    } catch {
      toast(langKey === 'uz' ? "Xatolik yuz berdi" : 'Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast, langKey]);

  useEffect(() => { reload(); }, [reload]);

  const handleStatusChange = async (room: Room) => {
    const next = NEXT_STATUS[room.status];
    try {
      await updateRoomStatus(room.id, next);
      setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, status: next } : r));
      toast(`${room.label} → ${STATUS_CONFIG[next][langKey]}`, 'success');
    } catch {
      toast(langKey === 'uz' ? "Xatolik yuz berdi" : 'Error', 'error');
    }
  };

  const catName = (catId: string) => categories.find((c) => c.id === catId)?.name ?? '—';

  const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);
  const counts = {
    dirty: rooms.filter((r) => r.status === 'Dirty').length,
    clean: rooms.filter((r) => r.status === 'Clean').length,
    inspected: rooms.filter((r) => r.status === 'Inspected').length,
    maintenance: rooms.filter((r) => r.status === 'Maintenance').length,
  };

  // Sort: Dirty first, then Maintenance, then Clean, then Inspected
  const sortOrder: Record<RoomStatus, number> = { Dirty: 0, Maintenance: 1, Clean: 2, Inspected: 3 };
  const sorted = [...filtered].sort((a, b) => sortOrder[a.status] - sortOrder[b.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-violet-200/40">
          <Sparkles size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            {langKey === 'uz' ? "Hammerlik Paneli" : langKey === 'ru' ? 'Панель Хаускипинга' : 'Housekeeping Panel'}
          </h1>
          <p className="text-sm text-ink-500">{user?.fullName} — {langKey === 'uz' ? "Xonalarni tozalash holatini boshqarish" : langKey === 'ru' ? 'Управление статусом уборки номеров' : 'Manage room cleaning status'}</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(STATUS_CONFIG) as RoomStatus[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          const count = counts[status.toLowerCase() as keyof typeof counts] ?? 0;
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`card p-4 text-left border-2 transition-all ${filter === status ? cfg.bg : 'border-ink-100 hover:border-ink-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <span className="text-2xl font-extrabold text-ink-900 tabular">{count}</span>
              </div>
              <p className="text-sm font-bold text-ink-700 mt-2.5">{cfg[langKey]}</p>
            </button>
          );
        })}
      </div>

      {/* Room List */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {filter === 'all'
            ? `${rooms.length} ${langKey === 'uz' ? 'xona' : 'rooms'}`
            : `${filtered.length} ${langKey === 'uz' ? 'xona' : 'rooms'} · ${STATUS_CONFIG[filter][langKey]}`}
        </p>
        <button onClick={reload} className="btn-ghost px-3 py-2 text-xs font-bold">
          <RefreshCw size={14} /> {langKey === 'uz' ? "Yangilash" : 'Refresh'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((room) => {
          const cfg = STATUS_CONFIG[room.status];
          const Icon = cfg.icon;
          return (
            <div key={room.id} className={`card p-4 border-2 ${cfg.bg} transition-all hover:shadow-md`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-10 w-10 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                    <BedDouble size={20} className={cfg.color} />
                  </div>
                  <div>
                    <p className="font-bold text-ink-900 text-lg leading-tight">{room.label}</p>
                    <p className="text-xs text-ink-400">{catName(room.categoryId)} · {langKey === 'uz' ? 'Qavat' : 'Floor'} {room.floor}</p>
                  </div>
                </div>
                <Icon size={20} className={cfg.color} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${cfg.color}`}>{cfg[langKey]}</span>
                <button
                  onClick={() => handleStatusChange(room)}
                  className="btn-primary px-3 py-1.5 text-xs font-bold"
                >
                  {room.status === 'Dirty' ? (langKey === 'uz' ? "Tozalandi" : 'Mark Clean') :
                   room.status === 'Clean' ? (langKey === 'uz' ? "Tekshirildi" : 'Mark Inspected') :
                   room.status === 'Maintenance' ? (langKey === 'uz' ? "Tozalandi" : 'Mark Clean') :
                   (langKey === 'uz' ? "Toza" : 'Reset')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
