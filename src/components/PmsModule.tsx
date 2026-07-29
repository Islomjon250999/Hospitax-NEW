import { useState, useEffect, useCallback } from 'react';
import {
  CalendarRange,
  BedDouble,
  Tag,
  ConciergeBell,
  type LucideIcon,
} from 'lucide-react';
import type { PmsSubTab, Room, RoomCategory, Tariff, ExtraService } from '../types';
import { useLang } from '../i18n';
import { Shaxmatka } from './pms/Shaxmatka';
import { RoomTypes } from './pms/RoomTypes';
import { Tariffs } from './pms/Tariffs';
import { ExtraServices } from './pms/ExtraServices';
import { loadPmsData, type PmsData } from '../lib/pmsData';

const SUB_TABS: { id: PmsSubTab; labelKey: string; subLabelKey: string; icon: LucideIcon }[] = [
  { id: 'shaxmatka', labelKey: 'pms_shaxmatka', subLabelKey: 'pms_shaxmatka_sub', icon: CalendarRange },
  { id: 'roomtypes', labelKey: 'pms_roomTypes', subLabelKey: 'pms_roomTypes_sub', icon: BedDouble },
  { id: 'tariffs', labelKey: 'pms_tariffs', subLabelKey: 'pms_tariffs_sub', icon: Tag },
  { id: 'services', labelKey: 'pms_services', subLabelKey: 'pms_services_sub', icon: ConciergeBell },
];

export function PmsModule({ restrictTo }: { restrictTo?: PmsSubTab[] }) {
  const { lang, t } = useLang();
  const visibleTabs = restrictTo ? SUB_TABS.filter((tab) => restrictTo.includes(tab.id)) : SUB_TABS;
  const [subTab, setSubTab] = useState<PmsSubTab>(visibleTabs[0]?.id ?? 'shaxmatka');

  const [data, setData] = useState<PmsData>({
    rooms: [],
    categories: [],
    bookings: [],
    tariffs: [],
    services: [],
  });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const loaded = await loadPmsData();
      setData(loaded);
    } catch (err) {
      console.error('Failed to load PMS data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const updateData = (d: Partial<PmsData>) => {
    setData((prev) => ({ ...prev, ...d }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-ink-400">{t('gen_loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink-900">{t('pms_title')}</h2>
        <p className="text-sm text-ink-500 mt-0.5">{data.rooms.length} {t('gen_rooms')} · {data.categories.length} {t('gen_categories')} · {data.tariffs.length} {t('gen_tariffs')}</p>
      </div>

      {/* ---- Sub-tab navigation ---- */}
      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {visibleTabs.map((tab) => {
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
        {subTab === 'shaxmatka' && <Shaxmatka data={data} onReload={reload} />}
        {subTab === 'roomtypes' && <RoomTypes rooms={data.rooms} categories={data.categories} onUpdate={updateData} />}
        {subTab === 'tariffs' && <Tariffs tariffs={data.tariffs} categories={data.categories} onUpdate={(tariffs) => setData((prev) => ({ ...prev, tariffs }))} />}
        {subTab === 'services' && <ExtraServices services={data.services} onUpdate={(services) => setData((prev) => ({ ...prev, services }))} />}
      </div>
    </div>
  );
}
