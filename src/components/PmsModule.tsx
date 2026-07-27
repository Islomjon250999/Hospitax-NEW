import { useState, useMemo } from 'react';
import {
  CalendarRange,
  BedDouble,
  Tag,
  ConciergeBell,
  type LucideIcon,
} from 'lucide-react';
import type { PmsSubTab, Room, RoomCategory, Booking, Tariff, ExtraService } from '../types';
import { rooms as seedRooms, roomCategories, bookings as seedBookings, tariffs as seedTariffs, extraServices as seedServices } from '../mockData';
import { useLang } from '../i18n';
import { Shaxmatka } from './pms/Shaxmatka';
import { RoomTypes } from './pms/RoomTypes';
import { Tariffs } from './pms/Tariffs';
import { ExtraServices } from './pms/ExtraServices';

const SUB_TABS: { id: PmsSubTab; labelKey: string; subLabelKey: string; icon: LucideIcon }[] = [
  { id: 'shaxmatka', labelKey: 'pms_shaxmatka', subLabelKey: 'pms_shaxmatka_sub', icon: CalendarRange },
  { id: 'roomtypes', labelKey: 'pms_roomTypes', subLabelKey: 'pms_roomTypes_sub', icon: BedDouble },
  { id: 'tariffs', labelKey: 'pms_tariffs', subLabelKey: 'pms_tariffs_sub', icon: Tag },
  { id: 'services', labelKey: 'pms_services', subLabelKey: 'pms_services_sub', icon: ConciergeBell },
];

export function PmsModule() {
  const { lang, t } = useLang();
  const [subTab, setSubTab] = useState<PmsSubTab>('shaxmatka');

  const [rooms, setRooms] = useState<Room[]>(seedRooms);
  const [categories, setCategories] = useState<RoomCategory[]>(roomCategories);
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [tariffs, setTariffs] = useState<Tariff[]>(seedTariffs);
  const [services, setServices] = useState<ExtraService[]>(seedServices);

  const data = useMemo(
    () => ({ rooms, categories, bookings, tariffs, services }),
    [rooms, categories, bookings, tariffs, services],
  );

  const updateData = (d: Partial<typeof data>) => {
    if (d.rooms) setRooms(d.rooms);
    if (d.categories) setCategories(d.categories);
    if (d.bookings) setBookings(d.bookings);
    if (d.tariffs) setTariffs(d.tariffs);
    if (d.services) setServices(d.services);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink-900">{t('pms_title')}</h2>
        <p className="text-sm text-ink-500 mt-0.5">{rooms.length} {t('gen_rooms')} · {categories.length} {t('gen_categories')} · {tariffs.length} {t('gen_tariffs')}</p>
      </div>

      {/* ---- Sub-tab navigation ---- */}
      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const on = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                on ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <Icon size={16} />
              {lang === 'uz' ? (
                <span>{t(tab.labelKey)}</span>
              ) : (
                <span className="flex flex-col items-start leading-tight">
                  <span>{t(tab.labelKey)}</span>
                  <span className={`text-[10px] font-medium ${on ? 'text-indigo-400' : 'text-ink-300'}`}>{t(tab.subLabelKey)}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---- Sub-tab content ---- */}
      <div key={subTab} className="animate-fade-in">
        {subTab === 'shaxmatka' && <Shaxmatka data={data} onUpdateData={updateData} />}
        {subTab === 'roomtypes' && <RoomTypes rooms={rooms} categories={categories} onUpdate={updateData} />}
        {subTab === 'tariffs' && <Tariffs tariffs={tariffs} categories={categories} onUpdate={setTariffs} />}
        {subTab === 'services' && <ExtraServices services={services} onUpdate={setServices} />}
      </div>
    </div>
  );
}
