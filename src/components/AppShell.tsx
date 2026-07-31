import { type ReactNode, useState } from 'react';
import {
  Building2,
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
  Crown,
  ShieldCheck,
  Store,
  Calendar,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { notifications as seedNotifs } from '../mockData';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel, Avatar, SlideOver } from './ui';
import { useToast } from '../toast';
import { useLang } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth, ROLE_LABELS } from '../lib/auth';
import type { UserRole } from '../types';

const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  ceo: Crown,
  super_admin: ShieldCheck,
  manager: Store,
  receptionist: Store,
  housekeeping: Sparkles,
};

const ROLE_ACCENTS: Record<UserRole, string> = {
  ceo: 'from-amber-500 to-orange-500 shadow-amber-200/40',
  super_admin: 'from-cyan-500 to-blue-600 shadow-cyan-200/40',
  manager: 'from-emerald-500 to-teal-500 shadow-emerald-200/40',
  receptionist: 'from-sky-500 to-blue-500 shadow-sky-200/40',
  housekeeping: 'from-violet-500 to-purple-500 shadow-violet-200/40',
};

export function AppShell({
  children,
  notifOpen,
  setNotifOpen,
  settingsOpen,
  setSettingsOpen,
  onMenu,
  onLogout,
}: {
  children: ReactNode;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  onMenu: () => void;
  onLogout: () => void;
}) {
  const toast = useToast();
  const { lang, setLang, t } = useLang();
  const { user, login, logout } = useAuth();
  const [notifs, setNotifs] = useState(seedNotifs);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast(t('nav_markAllRead'), 'info');
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const langKey = lang as 'uz' | 'ru' | 'en';
  const roleIcon = user ? ROLE_ICONS[user.role] : Store;
  const RoleIcon = roleIcon;
  const allRoles: UserRole[] = ['ceo', 'super_admin', 'manager', 'receptionist', 'housekeeping'];

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* ---- Top navigation ---- */}
      <header className="sticky top-0 z-40 bg-white border-b border-ink-200">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3 max-w-[1400px] mx-auto">
          <button onClick={onMenu} className="lg:hidden btn-ghost h-9 w-9 !p-0 rounded-lg shrink-0">
            <Menu size={20} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${user ? ROLE_ACCENTS[user.role] : 'from-cyan-500 to-blue-600'} flex items-center justify-center shadow-lg`}>
              <Building2 size={20} className="text-white" />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-extrabold tracking-tight text-ink-900 text-[15px]">
                Hospita<span className="text-cyan-600">X</span>
              </p>
              <p className="text-[9px] uppercase tracking-widest text-ink-400 font-semibold">Hospitality Cloud</p>
            </div>
          </div>

          {/* Role badge */}
          {user && (
            <div className="ml-2 sm:ml-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-100 shrink-0">
              <RoleIcon size={15} className="text-ink-500" />
              <span className="text-xs font-bold text-ink-700 hidden sm:inline">{ROLE_LABELS[user.role][langKey]}</span>
            </div>
          )}

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
            {user?.role !== 'receptionist' && user?.role !== 'housekeeping' && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="btn-ghost h-9 w-9 !p-0 rounded-lg hidden sm:flex"
                title={t('nav_settings')}
              >
                <Settings size={18} />
              </button>
            )}

            {/* Language selector */}
            <LanguageSwitcher />

            {/* User dropdown */}
            <Dropdown
              width="w-64"
              trigger={
                <button className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-xl hover:bg-ink-100 transition-colors ml-1">
                  <Avatar initials={user?.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? 'U'} size="sm" />
                  <ChevronDown size={14} className="text-ink-400 hidden sm:block" />
                </button>
              }
            >
              {(close) => (
                <>
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-ink-900">{user?.fullName}</p>
                    <p className="text-xs text-ink-400">{user ? ROLE_LABELS[user.role][langKey] : ''}</p>
                    <p className="text-[11px] text-ink-300 mt-0.5">{user?.email}</p>
                  </div>
                  <DropdownDivider />
                  <DropdownLabel>{langKey === 'uz' ? "Rolni almashtirish (demo)" : langKey === 'ru' ? 'Сменить роль (демо)' : 'Switch Role (demo)'}</DropdownLabel>
                  <div className="px-1 py-1 max-h-48 overflow-y-auto">
                    {allRoles.map((role) => {
                      const RoleIcon2 = ROLE_ICONS[role];
                      return (
                        <button
                          key={role}
                          onClick={() => { login(role); close(); setRoleSwitcherOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                            user?.role === role ? 'bg-indigo-50 text-indigo-700' : 'text-ink-700 hover:bg-ink-100'
                          }`}
                        >
                          <RoleIcon2 size={15} className={user?.role === role ? 'text-indigo-600' : 'text-ink-400'} />
                          <span className="flex-1">{ROLE_LABELS[role][langKey]}</span>
                          {user?.role === role && <CheckCircle2 size={14} className="text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                  <DropdownDivider />
                  {user?.role !== 'receptionist' && user?.role !== 'housekeeping' && (
                    <>
                      <DropdownItem icon={<User size={15} />} label={t('user_myProfile')} onClick={() => { close(); toast(t('user_myProfile'), 'info'); }} />
                      <DropdownItem icon={<Settings size={15} />} label={t('user_accountSettings')} onClick={() => { close(); setSettingsOpen(true); }} />
                      <DropdownItem icon={<CreditCard size={15} />} label={t('user_billingPlans')} onClick={() => { close(); toast(t('user_billingPlans'), 'info'); }} />
                      <DropdownDivider />
                      <DropdownItem icon={<HelpCircle size={15} />} label={t('user_helpSupport')} onClick={() => { close(); toast(t('user_helpSupport'), 'info'); }} />
                      <DropdownDivider />
                    </>
                  )}
                  <DropdownItem icon={<LogOut size={15} />} label={t('user_signOut')} onClick={() => { close(); handleLogout(); }} danger />
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
        icon={<Bell size={18} className="text-cyan-600" />}
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

export { X };
