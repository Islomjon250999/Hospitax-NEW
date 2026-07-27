import { useState, type ReactNode } from 'react';
import {
  CalendarRange,
  Radio,
  Globe,
  Building2,
  MapPin,
  BedDouble,
  ChevronDown,
  Check,
  type LucideIcon,
} from 'lucide-react';
import type { Property, ClientTab } from '../types';
import { properties } from '../mockData';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from './ui';
import { useToast } from '../toast';
import { useLang } from '../i18n';

const TABS: { id: ClientTab; labelKey: string; icon: LucideIcon }[] = [
  { id: 'pms', labelKey: 'tab_pms', icon: CalendarRange },
  { id: 'chm', labelKey: 'tab_chm', icon: Radio },
  { id: 'be', labelKey: 'tab_be', icon: Globe },
];

export function ClientPanel({
  property,
  onPropertyChange,
  children,
  activeTab,
  onTabChange,
}: {
  property: Property;
  onPropertyChange: (p: Property) => void;
  children: ReactNode;
  activeTab: ClientTab;
  onTabChange: (t: ClientTab) => void;
}) {
  const toast = useToast();
  const { t } = useLang();

  return (
    <div className="space-y-5">
      {/* ---- Active property banner ---- */}
      <div className="card p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200/50">
            <Building2 size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold tracking-tight text-ink-900 truncate">{property.name}</h1>
              <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t('client_active')}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1"><MapPin size={12} /> {property.city}</span>
              <span className="inline-flex items-center gap-1"><BedDouble size={12} /> {property.rooms} {t('client_rooms')}</span>
              <span className="inline-flex items-center gap-1"><Check size={12} /> {property.plan} {t('client_plan')}</span>
            </div>
          </div>
        </div>

        {/* Property switcher */}
        <Dropdown
          width="w-64"
          trigger={
            <button className="btn-secondary px-3.5 py-2.5 text-sm">
              <Building2 size={15} /> {t('client_switchProperty')} <ChevronDown size={14} className="text-ink-400" />
            </button>
          }
        >
          {(close) => (
            <>
              <DropdownLabel>{t('client_yourProperties')}</DropdownLabel>
              {properties.slice(0, 6).map((p) => (
                <DropdownItem
                  key={p.id}
                  icon={<Building2 size={15} />}
                  label={`${p.name} (${p.city})`}
                  onClick={() => { close(); onPropertyChange(p); toast(`Switched to ${p.name}`, 'info'); }}
                />
              ))}
            </>
          )}
        </Dropdown>
      </div>

      {/* ---- Sub-module tabs ---- */}
      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const on = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                on ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <Icon size={16} /> {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* ---- Active module content ---- */}
      <div key={activeTab} className="animate-fade-in">{children}</div>
    </div>
  );
}
