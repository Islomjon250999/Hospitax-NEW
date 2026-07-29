import { useState } from 'react';
import {
  BedDouble,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import type { Room, RoomCategory, RoomStatus } from '../../types';
import { UZS } from '../../utils';
import { Modal, EmptyState } from '../ui';
import { useToast } from '../../toast';
import { useLang } from '../../i18n';
import { createCategory, updateCategory, deleteCategory as dbDeleteCategory, createRoom, updateRoom, deleteRoom as dbDeleteRoom } from '../../lib/pmsData';

const ROOM_STATUS_STYLE: Record<RoomStatus, { dot: string; chip: string; labelKey: string }> = {
  Clean: { dot: 'bg-emerald-400', chip: 'text-emerald-700 bg-emerald-50', labelKey: 'room_clean' },
  Dirty: { dot: 'bg-amber-400', chip: 'text-amber-700 bg-amber-50', labelKey: 'room_dirty' },
  Inspected: { dot: 'bg-sky-400', chip: 'text-sky-700 bg-sky-50', labelKey: 'room_inspected' },
  Maintenance: { dot: 'bg-rose-400', chip: 'text-rose-700 bg-rose-50', labelKey: 'room_maintenance' },
};

let catCounter = 10;
let roomCounter = 100;

interface Props {
  rooms: Room[];
  categories: RoomCategory[];
  onUpdate: (d: { rooms?: Room[]; categories?: RoomCategory[] }) => void;
}

export function RoomTypes({ rooms, categories, onUpdate }: Props) {
  const [editing, setEditing] = useState<RoomCategory | null>(null);
  const [adding, setAdding] = useState(false);
  const { t } = useLang();
  const toast = useToast();

  const deleteCategory = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    const catRooms = rooms.filter((r) => r.categoryId === id);
    try {
      for (const r of catRooms) await dbDeleteRoom(r.id);
      await dbDeleteCategory(id);
      onUpdate({
        categories: categories.filter((c) => c.id !== id),
        rooms: rooms.filter((r) => r.categoryId !== id),
      });
      toast(`${cat?.name} — ${t('rt_delete')}`, 'info');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const saveCategory = async (cat: RoomCategory, newRoomLabels: string[]) => {
    try {
      if (categories.find((c) => c.id === cat.id)) {
        const existingRoomIds = rooms.filter((r) => r.categoryId === cat.id).map((r) => r.id);
        const newRooms: Room[] = newRoomLabels.map((label) => ({
          id: `r${++roomCounter}`,
          label,
          categoryId: cat.id,
          type: cat.name,
          floor: 1,
          baseRate: 480000,
          status: 'Clean' as RoomStatus,
        }));
        await updateCategory({ ...cat, roomIds: [...existingRoomIds, ...newRooms.map((r) => r.id)] });
        for (const r of newRooms) await createRoom(r);
        onUpdate({
          categories: categories.map((c) => (c.id === cat.id ? { ...cat, roomIds: [...existingRoomIds, ...newRooms.map((r) => r.id)] } : c)),
          rooms: [...rooms, ...newRooms],
        });
        toast(`${cat.name} — ${t('gen_save')}`, 'success');
      } else {
        const newRooms: Room[] = newRoomLabels.map((label) => ({
          id: `r${++roomCounter}`,
          label,
          categoryId: cat.id,
          type: cat.name,
          floor: 1,
          baseRate: 480000,
          status: 'Clean' as RoomStatus,
        }));
        const fullCat = { ...cat, roomIds: newRooms.map((r) => r.id) };
        await createCategory(fullCat);
        for (const r of newRooms) await createRoom(r);
        onUpdate({
          categories: [...categories, fullCat],
          rooms: [...rooms, ...newRooms],
        });
        toast(`${cat.name} — ${t('rcm_create')} (${newRooms.length})`, 'success');
      }
    } catch {
      toast(t('gen_error'), 'error');
    }
    setEditing(null);
    setAdding(false);
  };

  const cycleRoomStatus = async (roomId: string) => {
    const order: RoomStatus[] = ['Clean', 'Dirty', 'Inspected', 'Maintenance'];
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    const idx = order.indexOf(room.status);
    const newStatus = order[(idx + 1) % order.length];
    const updated = { ...room, status: newStatus };
    try {
      await updateRoom(updated);
      onUpdate({ rooms: rooms.map((r) => (r.id === roomId ? updated : r)) });
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">{t('rt_title')}</h2>
          <p className="text-sm text-ink-500 mt-0.5">{t('rt_sub')} · {categories.length} {t('gen_categories')} · {rooms.length} {t('gen_rooms')}</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary px-4 py-2.5 text-sm">
          <Plus size={16} /> {t('rt_add')}
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card">
          <EmptyState icon={<BedDouble size={24} />} title={t('rt_noCategories')} sub={t('rt_noCategoriesSub')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catRooms = rooms.filter((r) => r.categoryId === cat.id);
            return (
              <div key={cat.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center">
                      <BedDouble size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-ink-900">{cat.name}</p>
                      {cat.description && <p className="text-xs text-ink-400 mt-0.5">{cat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(cat)} className="btn-ghost h-8 w-8 !p-0 rounded-lg" title={t('rt_edit')}><Pencil size={14} /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="btn-ghost h-8 w-8 !p-0 rounded-lg text-rose-500 hover:bg-rose-50" title={t('rt_delete')}><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                  <div className="rounded-lg bg-ink-50 py-2.5">
                    <p className="text-base font-bold text-ink-800 tabular">{cat.baseAdults}</p>
                    <p className="text-[10px] text-ink-400 font-medium">{t('rt_adults')}</p>
                  </div>
                  <div className="rounded-lg bg-ink-50 py-2.5">
                    <p className="text-base font-bold text-ink-800 tabular">{cat.baseKids}</p>
                    <p className="text-[10px] text-ink-400 font-medium">{t('rt_kids')}</p>
                  </div>
                  <div className="rounded-lg bg-indigo-50 py-2.5">
                    <p className="text-base font-bold text-indigo-600 tabular">{cat.maxAdults}</p>
                    <p className="text-[10px] text-indigo-400 font-medium">{t('rcm_maxAdults')}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 py-2.5">
                    <p className="text-base font-bold text-amber-600 tabular">{cat.maxChildren}</p>
                    <p className="text-[10px] text-amber-500 font-medium">{t('rcm_maxChildren')}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-2">{t('rt_rooms')}</p>
                  <div className="flex flex-wrap gap-2">
                    {catRooms.map((room) => {
                      const st = ROOM_STATUS_STYLE[room.status];
                      return (
                        <button
                          key={room.id}
                          onClick={() => cycleRoomStatus(room.id)}
                          className="group flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-300 transition-all"
                          title={`${room.label} — ${t(st.labelKey)} (${t('rt_clickToCycle')})`}
                        >
                          <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                          {room.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {(Object.keys(ROOM_STATUS_STYLE) as RoomStatus[]).map((s) => (
                      <span key={s} className="flex items-center gap-1.5 text-[10px] text-ink-400">
                        <span className={`h-2 w-2 rounded-full ${ROOM_STATUS_STYLE[s].dot}`} /> {t(ROOM_STATUS_STYLE[s].labelKey)}
                      </span>
                    ))}
                    <span className="text-[10px] text-ink-300">{t('rt_clickToCycle')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(editing || adding) && (
        <CategoryModal
          category={editing}
          rooms={rooms}
          categories={categories}
          onClose={() => { setEditing(null); setAdding(false); }}
          onSave={saveCategory}
        />
      )}
    </div>
  );
}

function CategoryModal({
  category,
  rooms,
  categories,
  onClose,
  onSave,
}: {
  category: RoomCategory | null;
  rooms: Room[];
  categories: RoomCategory[];
  onClose: () => void;
  onSave: (cat: RoomCategory, newRoomLabels: string[]) => void;
}) {
  const isEdit = !!category;
  const { t } = useLang();
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [baseAdults, setBaseAdults] = useState(category?.baseAdults ?? 2);
  const [baseKids, setBaseKids] = useState(category?.baseKids ?? 1);
  const [maxAdults, setMaxAdults] = useState(category?.maxAdults ?? 4);
  const [maxChildren, setMaxChildren] = useState(category?.maxChildren ?? 2);
  const [roomLabels, setRoomLabels] = useState(
    category ? rooms.filter((r) => r.categoryId === category.id).map((r) => r.label).join(', ') : '',
  );

  const submit = () => {
    if (!name.trim()) return;
    const labels = roomLabels
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    onSave(
      {
        id: category?.id ?? `cat${++catCounter}`,
        name: name.trim(),
        description: description.trim(),
        baseAdults,
        baseKids,
        maxAdults,
        maxChildren,
        totalQuantity: labels.length,
        roomIds: category?.roomIds ?? [],
      },
      labels,
    );
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? t('rcm_editTitle') : t('rcm_addTitle')} size="lg" icon={<BedDouble size={18} className="text-indigo-600" />}>
      <div className="space-y-4">
        <div>
          <label className="label">{t('rcm_name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('rcm_namePh')} className="input" autoFocus />
        </div>
        <div>
          <label className="label">{t('rcm_description')}</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('rcm_descPh')} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('rcm_baseAdults')}</label>
            <input type="number" min={1} value={baseAdults} onChange={(e) => setBaseAdults(Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">{t('rcm_baseKids')}</label>
            <input type="number" min={0} value={baseKids} onChange={(e) => setBaseKids(Number(e.target.value))} className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('rcm_maxAdults')}</label>
            <input type="number" min={baseAdults} value={maxAdults} onChange={(e) => setMaxAdults(Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">{t('rcm_maxChildren')}</label>
            <input type="number" min={baseKids} value={maxChildren} onChange={(e) => setMaxChildren(Number(e.target.value))} className="input" />
          </div>
        </div>
        <div>
          <label className="label">{t('rcm_roomNumbers')}</label>
          <input value={roomLabels} onChange={(e) => setRoomLabels(e.target.value)} placeholder={t('rcm_roomNumbersPh')} className="input" />
          <p className="text-[11px] text-ink-400 mt-1.5">
            {isEdit ? t('rcm_editHint') : t('rcm_addHint')}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-ink-100">
        <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('gen_cancel')}</button>
        <button onClick={submit} disabled={!name.trim()} className="btn-primary px-4 py-2 text-sm">
          <CheckCircle2 size={15} /> {isEdit ? t('rcm_save') : t('rcm_create')}
        </button>
      </div>
    </Modal>
  );
}
