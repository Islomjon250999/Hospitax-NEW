import { type ReactNode, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Store,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Settings,
  User,
  LogOut,
  HelpCircle,
  CreditCard,
  Sparkles,
  Globe,
  Check,
  type LucideIcon,
} from 'lucide-react';
import type { ViewMode } from '../types';
import { notifications as seedNotifs } from '../mockData';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel, Avatar, SlideOver, FlagIcon } from './ui';
import { useToast } from '../toast';
import { useLang, LANGUAGES } from '../i18n';

export function AppShell({
  view,
  onViewChange,
  children,
  notifOpen,
  setNotifOpen,
  settingsOpen,
  setSettingsOpen,
  onMenu,
}: {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  children: ReactNode;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  onMenu: () => void;
}) {
  const toast = useToast();
  const { lang, setLang, t } = useLang();
  const [notifs, setNotifs] = useState(seedNotifs);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast(t('nav_markAllRead'), 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* ---- Top navigation with view switcher ---- */}
      <header className="sticky top-0 z-40 bg-white border-b border-ink-200">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3 max-w-[1400px] mx-auto">
          <button onClick={onMenu} className="lg:hidden btn-ghost h-9 w-9 !p-0 rounded-lg shrink-0">
            <Menu size={20} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-extrabold tracking-tight text-ink-900 text-[15px]">
                Hospita<span className="text-indigo-600">X</span>
              </p>
              <p className="text-[9px] uppercase tracking-widest text-ink-400 font-semibold">Hospitality Cloud</p>
            </div>
          </div>

          {/* View switcher */}
          <div className="ml-2 sm:ml-6 flex p-1 bg-ink-100 rounded-xl gap-1 shrink-0">
            <ViewSwitchBtn
              active={view === 'admin'}
              onClick={() => onViewChange('admin')}
              icon={ShieldCheck}
              label={t('nav_superAdmin')}
            />
            <ViewSwitchBtn
              active={view === 'client'}
              onClick={() => onViewChange('client')}
              icon={Store}
              label={t('nav_hotelClient')}
            />
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                placeholder={t('nav_search')}
                className="w-full rounded-xl bg-ink-100 border border-transparent pl-9 pr-3 py-2 text-sm outline-none focus:bg-white focus:border-ink-200 transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button
              onClick={() => setNotifOpen(true)}
              className="btn-ghost h-9 w-9 !p-0 rounded-lg relative"
              title={t('nav_notifications')}
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="btn-ghost h-9 w-9 !p-0 rounded-lg hidden sm:flex"
              title={t('nav_settings')}
            >
              <Settings size={18} />
            </button>

            {/* Language selector */}
            <Dropdown
              width="w-52"
              trigger={
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-ink-100 transition-colors text-sm font-semibold text-ink-700">
                  <FlagIcon code={lang} size="sm" />
                  <span className="text-xs font-bold tracking-wide">{LANGUAGES.find((l) => l.code === lang)?.shortCode}</span>
                  <ChevronDown size={13} className="text-ink-400" />
                </button>
              }
            >
              {(close) => (
                <>
                  <DropdownLabel>{t('nav_settings')}: Language</DropdownLabel>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); close(); toast(l.label, 'info'); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                        lang === l.code ? 'bg-indigo-50 text-indigo-700' : 'text-ink-700 hover:bg-ink-100'
                      }`
                    }
                    >
                      <FlagIcon code={l.code} size="sm" />
                      <span className="flex-1">{l.label}</span>
                      <span className="text-[10px] font-bold text-ink-400 uppercase">{l.shortCode}</span>
                      {lang === l.code && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}
                </>
              )}
            </Dropdown>

            <Dropdown
              width="w-60"
              trigger={
                <button className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-xl hover:bg-ink-100 transition-colors ml-1">
                  <Avatar initials={view === 'admin' ? 'AR' : 'DR'} size="sm" />
                  <ChevronDown size={14} className="text-ink-400 hidden sm:block" />
                </button>
              }
            >
              {(close) => (
                <>
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-ink-900">
                      {view === 'admin' ? 'Akmal Rakhimov' : 'Dilnoza Karimova'}
                    </p>
                    <p className="text-xs text-ink-400">
                      {view === 'admin' ? t('user_platformOwner') : t('user_hotelManager')}
                    </p>
                  </div>
                  <DropdownDivider />
                  <DropdownLabel>{t('user_account')}</DropdownLabel>
                  <DropdownItem icon={<User size={15} />} label={t('user_myProfile')} onClick={() => { close(); toast(t('user_myProfile'), 'info'); }} />
                  <DropdownItem icon={<Settings size={15} />} label={t('user_accountSettings')} onClick={() => { close(); setSettingsOpen(true); }} />
                  <DropdownItem icon={<CreditCard size={15} />} label={t('user_billingPlans')} onClick={() => { close(); toast(t('user_billingPlans'), 'info'); }} />
                  <DropdownDivider />
                  <DropdownItem icon={<HelpCircle size={15} />} label={t('user_helpSupport')} onClick={() => { close(); toast(t('user_helpSupport'), 'info'); }} />
                  <DropdownItem icon={<Sparkles size={15} />} label={t('user_whatsNew')} onClick={() => { close(); toast(t('user_whatsNew'), 'info'); }} />
                  <DropdownDivider />
                  <DropdownItem icon={<LogOut size={15} />} label={t('user_signOut')} onClick={() => { close(); toast(t('user_signOut'), 'info'); }} danger />
                </>
              )}
            </Dropdown>
          </div>
        </div>
      </header>

      {/* ---- Content ---- */}
      <div className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">{children}</div>
      </div>

      {/* ---- Notifications slide-over ---- */}
      <SlideOver
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title={t('nav_notifications')}
        icon={<Bell size={18} className="text-indigo-600" />}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-ink-500">{unread} {t('nav_unread')}</span>
          <button onClick={markAllRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
            {t('nav_markAllRead')}
          </button>
        </div>
        <div className="space-y-2">
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
              className={`w-full text-left rounded-xl p-3.5 border transition-all ${
                n.read ? 'border-ink-100 bg-white' : 'border-indigo-100 bg-indigo-50/40'
              } hover:shadow-soft`}
            >
              <div className="flex items-start gap-3">
                {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                <div className={n.read ? 'pl-5' : ''}>
                  <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[11px] text-ink-400 mt-1.5">{n.time}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </SlideOver>
    </div>
  );
}

function ViewSwitchBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        active ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
      }`}
    >
      <Icon size={15} className={active ? 'text-indigo-600' : ''} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ---- Logo + nav for admin sidebar (kept for admin sub-nav if needed) ----
export { X };
