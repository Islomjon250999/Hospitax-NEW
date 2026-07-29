import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Receipt,
  BarChart3,
  Crown,
} from 'lucide-react';
import type { StaffAccount, UserRole, Hotel } from '../types';
import { useAuth, ROLE_LABELS } from '../lib/auth';
import { useLang } from '../i18n';
import { useToast } from '../toast';
import { loadStaff, createStaff, deleteStaff, updateStaff, loadHotels } from '../lib/hotelData';
import { KpiCard, SectionHeading, Modal } from './ui';
import { USD } from '../utils';

const ROLES: UserRole[] = ['ceo', 'super_admin', 'manager', 'receptionist', 'housekeeping'];

export function CeoPanel() {
  const { user, loginAs } = useAuth();
  const { lang, t } = useLang();
  const toast = useToast();
  const langKey = lang as 'uz' | 'ru' | 'en';
  const [tab, setTab] = useState<'analytics' | 'staff' | 'financials'>('analytics');
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const reload = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([loadStaff(), loadHotels()]);
      setStaff(s);
      setHotels(h);
    } catch {
      toast(t('gen_error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { reload(); }, [reload]);

  const handleCreateStaff = async (s: Omit<StaffAccount, 'id'>) => {
    try {
      await createStaff(s);
      await reload();
      setAddOpen(false);
      toast(`${s.fullName} — ${t('ceo_staffCreated')}`, 'success');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaff(id);
      await reload();
      toast(t('ceo_staffDeleted'), 'info');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const handleToggleActive = async (s: StaffAccount) => {
    try {
      await updateStaff(s.id, { active: !s.active });
      await reload();
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const totalRevenue = hotels.reduce((sum, h) => sum + h.mrr, 0);
  const totalRooms = hotels.reduce((sum, h) => sum + h.roomsCount, 0);
  const activeHotels = hotels.filter((h) => h.status === 'Active').length;
  const totalStaff = staff.filter((s) => s.active).length;

  const TABS = [
    { id: 'analytics' as const, icon: BarChart3, label: langKey === 'uz' ? 'Analitika' : langKey === 'ru' ? 'Аналитика' : 'Analytics' },
    { id: 'staff' as const, icon: Users, label: langKey === 'uz' ? "Xodimlar" : langKey === 'ru' ? 'Сотрудники' : 'Staff' },
    { id: 'financials' as const, icon: Receipt, label: langKey === 'uz' ? "Moliyaviy hisobotlar" : langKey === 'ru' ? 'Финансовые отчеты' : 'Financial Reports' },
  ];

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
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-200/40">
          <Crown size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            {langKey === 'uz' ? "Bosh Direktor Paneli" : langKey === 'ru' ? 'Панель CEO' : 'CEO Panel'}
          </h1>
          <p className="text-sm text-ink-500">{user?.fullName} — {langKey === 'uz' ? "To'liq platforma boshqaruvi" : langKey === 'ru' ? 'Полное управление платформой' : 'Full platform control'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {TABS.map((tb) => {
          const Icon = tb.icon;
          const on = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${on ? 'border-amber-600 text-amber-600' : 'border-transparent text-ink-500 hover:text-ink-700'}`}>
              <Icon size={16} /> {tb.label}
            </button>
          );
        })}
      </div>

      {/* Analytics */}
      {tab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label={langKey === 'uz' ? "Oylik daromad (MRR)" : langKey === 'ru' ? 'Ежемесячный доход' : 'Monthly Revenue'} value={USD(totalRevenue)} sub={`${(totalRevenue * 12750).toLocaleString()} UZS`} delta={{ value: 18, up: true }} icon={<DollarSign size={20} />} accent="emerald" />
            <KpiCard label={langKey === 'uz' ? "Faol mehmonxonalar" : langKey === 'ru' ? 'Активные отели' : 'Active Hotels'} value={activeHotels} sub={`${hotels.length} total`} delta={{ value: 12, up: true }} icon={<Building2 size={20} />} accent="indigo" />
            <KpiCard label={langKey === 'uz' ? "Jami xonalar" : langKey === 'ru' ? 'Всего номеров' : 'Total Rooms'} value={totalRooms.toLocaleString()} sub={`${hotels.length} ${langKey === 'uz' ? 'mehmonxona' : 'hotels'}`} delta={{ value: 8, up: true }} icon={<TrendingUp size={20} />} accent="sky" />
            <KpiCard label={langKey === 'uz' ? "Faol xodimlar" : langKey === 'ru' ? 'Активные сотрудники' : 'Active Staff'} value={totalStaff} sub={`${staff.length} total`} delta={{ value: 5, up: true }} icon={<Users size={20} />} accent="amber" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <SectionHeading title={langKey === 'uz' ? "Mehmonxonalar bo'yicha daromad" : langKey === 'ru' ? 'Доход по отелям' : 'Revenue by Hotel'} />
              <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto">
                {hotels.filter((h) => h.mrr > 0).sort((a, b) => b.mrr - a.mrr).map((h) => {
                  const pctW = totalRevenue > 0 ? (h.mrr / totalRevenue) * 100 : 0;
                  return (
                    <div key={h.id} className="flex items-center gap-3">
                      <div className="w-40 shrink-0 truncate text-sm font-medium text-ink-700">{h.name}</div>
                      <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pctW}%` }} />
                      </div>
                      <div className="w-20 shrink-0 text-right text-sm font-bold text-ink-800 tabular">{USD(h.mrr)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card p-5">
              <SectionHeading title={langKey === 'uz' ? "Xodimlar tarkibi" : langKey === 'ru' ? 'Состав сотрудников' : 'Staff Composition'} />
              <div className="mt-4 space-y-3">
                {ROLES.map((role) => {
                  const count = staff.filter((s) => s.role === role).length;
                  const pctW = totalStaff > 0 ? (count / totalStaff) * 100 : 0;
                  return (
                    <div key={role} className="flex items-center gap-3">
                      <div className="w-40 shrink-0 text-sm font-medium text-ink-700">{ROLE_LABELS[role][langKey]}</div>
                      <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${pctW}%` }} />
                      </div>
                      <div className="w-8 shrink-0 text-right text-sm font-bold text-ink-800 tabular">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Management */}
      {tab === 'staff' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">{staff.length} {langKey === 'uz' ? "xodim" : langKey === 'ru' ? 'сотрудников' : 'staff members'}</p>
            <button onClick={() => setAddOpen(true)} className="btn-primary px-4 py-2.5 text-sm">
              <Plus size={16} /> {langKey === 'uz' ? "Xodim qo'shish" : langKey === 'ru' ? 'Добавить сотрудника' : 'Add Staff'}
            </button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-200/70 bg-ink-50/50">
                    <th className="px-5 py-3 font-semibold">{langKey === 'uz' ? "F.I.O" : langKey === 'ru' ? 'Имя' : 'Full Name'}</th>
                    <th className="px-3 py-3 font-semibold">Email</th>
                    <th className="px-3 py-3 font-semibold">{langKey === 'uz' ? "Rol" : langKey === 'ru' ? 'Роль' : 'Role'}</th>
                    <th className="px-3 py-3 font-semibold">{langKey === 'uz' ? "Telefon" : langKey === 'ru' ? 'Телефон' : 'Phone'}</th>
                    <th className="px-3 py-3 font-semibold">{langKey === 'uz' ? "Holat" : langKey === 'ru' ? 'Статус' : 'Status'}</th>
                    <th className="px-5 py-3 font-semibold text-right">{langKey === 'uz' ? "Amallar" : langKey === 'ru' ? 'Действия' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {s.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-800">{s.fullName}</p>
                            {s.hotelId && <p className="text-[11px] text-ink-400">{hotels.find((h) => h.id === s.hotelId)?.name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-ink-600">{s.email}</td>
                      <td className="px-3 py-3.5">
                        <span className={`chip text-xs font-bold ${s.role === 'ceo' ? 'bg-amber-50 text-amber-700' : s.role === 'super_admin' ? 'bg-indigo-50 text-indigo-700' : s.role === 'manager' ? 'bg-emerald-50 text-emerald-700' : s.role === 'receptionist' ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'}`}>
                          {ROLE_LABELS[s.role][langKey]}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-ink-600">{s.phone}</td>
                      <td className="px-3 py-3.5">
                        <button onClick={() => handleToggleActive(s)} className={`chip text-xs font-bold ${s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-400'}`}>
                          {s.active ? (langKey === 'uz' ? 'Faol' : 'Active') : (langKey === 'uz' ? "Bloklangan" : 'Disabled')}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => loginAs(s)} className="btn-ghost px-2.5 py-1.5 text-xs" title={langKey === 'uz' ? "Kirish" : 'Sign in as'}>
                            <Eye size={14} />
                          </button>
                          {s.role !== 'ceo' && (
                            <button onClick={() => handleDeleteStaff(s.id)} className="btn-ghost h-8 w-8 !p-0 rounded-lg text-rose-500 hover:bg-rose-50" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Financials */}
      {tab === 'financials' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label={langKey === 'uz' ? "Jami MRR" : 'Total MRR'} value={USD(totalRevenue)} sub={`${(totalRevenue * 12750).toLocaleString()} UZS`} delta={{ value: 18, up: true }} icon={<DollarSign size={20} />} accent="emerald" />
            <KpiCard label={langKey === 'uz' ? "O'rtacha mehmonxona" : 'Avg per Hotel'} value={USD(totalRevenue / Math.max(activeHotels, 1))} sub={`${activeHotels} ${langKey === 'uz' ? 'faol' : 'active'}`} delta={{ value: 7, up: true }} icon={<TrendingUp size={20} />} accent="indigo" />
            <KpiCard label={langKey === 'uz' ? "Xona boshiga" : 'Rev per Room'} value={USD(totalRevenue / Math.max(totalRooms, 1))} sub={`${totalRooms} ${langKey === 'uz' ? 'xona' : 'rooms'}`} delta={{ value: 11, up: true }} icon={<BarChart3 size={20} />} accent="amber" />
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-200/70 bg-ink-50/50">
                    <th className="px-5 py-3 font-semibold">{langKey === 'uz' ? "Mehmonxona" : 'Hotel'}</th>
                    <th className="px-3 py-3 font-semibold">{langKey === 'uz' ? "Tarif" : 'Plan'}</th>
                    <th className="px-3 py-3 font-semibold text-right">{langKey === 'uz' ? "Xonalar" : 'Rooms'}</th>
                    <th className="px-3 py-3 font-semibold text-right">MRR</th>
                    <th className="px-5 py-3 font-semibold text-right">{langKey === 'uz' ? "Xona/MRR" : 'Room/MRR'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {hotels.filter((h) => h.mrr > 0).sort((a, b) => b.mrr - a.mrr).map((h) => (
                    <tr key={h.id} className="hover:bg-ink-50/60">
                      <td className="px-5 py-3.5 font-semibold text-ink-800">{h.name}</td>
                      <td className="px-3 py-3.5"><span className="chip text-xs font-bold bg-indigo-50 text-indigo-700">{h.plan}</span></td>
                      <td className="px-3 py-3.5 text-right tabular text-ink-700">{h.roomsCount}</td>
                      <td className="px-3 py-3.5 text-right tabular font-bold text-ink-800">{USD(h.mrr)}</td>
                      <td className="px-5 py-3.5 text-right tabular text-ink-600">{USD(h.mrr / Math.max(h.roomsCount, 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleCreateStaff} hotels={hotels} />
    </div>
  );
}

function AddStaffModal({ open, onClose, onAdd, hotels }: {
  open: boolean;
  onClose: () => void;
  onAdd: (s: Omit<StaffAccount, 'id'>) => void;
  hotels: Hotel[];
}) {
  const { lang } = useLang();
  const langKey = lang as 'uz' | 'ru' | 'en';
  const [form, setForm] = useState<Omit<StaffAccount, 'id'>>({
    hotelId: null,
    fullName: '',
    email: '',
    role: 'receptionist',
    phone: '',
    active: true,
  });

  if (!open) return null;

  const isHotelRole = form.role === 'manager' || form.role === 'receptionist' || form.role === 'housekeeping';

  return (
    <Modal open={open} onClose={onClose} title={langKey === 'uz' ? "Yangi xodim" : langKey === 'ru' ? 'Новый сотрудник' : 'New Staff Member'} size="md">
      <div className="space-y-4">
        <div>
          <label className="label">{langKey === 'uz' ? "F.I.O" : 'Full Name'} *</label>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" placeholder="Jasur Makhmudov" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email *</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="user@hotel.uz" />
          </div>
          <div>
            <label className="label">{langKey === 'uz' ? "Telefon" : 'Phone'}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+998 90 ..." />
          </div>
        </div>
        <div>
          <label className="label">{langKey === 'uz' ? "Rol" : 'Role'} *</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole, hotelId: isHotelRole ? form.hotelId : null })} className="input">
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r][langKey]}</option>)}
          </select>
        </div>
        {isHotelRole && (
          <div>
            <label className="label">{langKey === 'uz' ? "Mehmonxona" : 'Hotel'}</label>
            <select value={form.hotelId ?? ''} onChange={(e) => setForm({ ...form, hotelId: e.target.value || null })} className="input">
              <option value="">—</option>
              {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => form.fullName && form.email && onAdd(form)} className="btn-primary w-full py-2.5 text-sm font-bold">
          <Plus size={16} /> {langKey === 'uz' ? "Yaratish" : 'Create'}
        </button>
      </div>
    </Modal>
  );
}
