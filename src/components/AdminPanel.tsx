import { useMemo, useState } from 'react';
import {
  Building2,
  DollarSign,
  CreditCard,
  Activity,
  Plus,
  Search,
  MapPin,
  ArrowUpRight,
  Server,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Users,
  LayoutDashboard,
  Receipt,
  Settings as SettingsIcon,
  Eye,
  FileText,
  Download,
  Globe,
  Bell,
  Shield,
  Zap,
  MoreHorizontal,
} from 'lucide-react';
import type { Property, SubscriptionPlan, City, AdminTab } from '../types';
import { properties as seedProperties, mrrSeries, systemServices, invoices as seedInvoices } from '../mockData';
import { USD, pct } from '../utils';
import {
  KpiCard,
  StatusBadge,
  PlanBadge,
  SectionHeading,
  Modal,
  Sparkline,
  SlideOver,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Toggle,
} from './ui';
import { useToast } from '../toast';
import { useLang } from '../i18n';

const CITIES: City[] = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Tashkent Region'];
const PLANS: SubscriptionPlan[] = ['Basic', 'Pro', 'Enterprise'];
const TYPES = ['Hotel', 'Boutique Hotel', 'Hostel', 'Resort', 'Guesthouse'] as const;
const TABS: { id: AdminTab; labelKey: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', labelKey: 'admin_overview', icon: LayoutDashboard },
  { id: 'tenants', labelKey: 'admin_tenants', icon: Building2 },
  { id: 'billing', labelKey: 'admin_billing', icon: Receipt },
  { id: 'settings', labelKey: 'admin_settings', icon: SettingsIcon },
];

export function AdminPanel({ onImpersonate }: { onImpersonate: (p: Property) => void }) {
  const { t } = useLang();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [list, setList] = useState<Property[]>(seedProperties);
  const [invoices] = useState(seedInvoices);
  const [addOpen, setAddOpen] = useState(false);

  const addProperty = (p: Omit<Property, 'id' | 'createdAt'>) => {
    setList((prev) => [
      { ...p, id: `p${prev.length + 1}`, createdAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{t('admin_title')}</h1>
          <p className="text-sm text-ink-500 mt-1">{t('admin_sub')}</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary px-4 py-2.5 text-sm">
          <Plus size={16} /> {t('admin_addProperty')}
        </button>
      </div>

      {/* ---- Sub-tabs ---- */}
      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {TABS.map((tabDef) => {
          const Icon = tabDef.icon;
          const on = tab === tabDef.id;
          return (
            <button
              key={tabDef.id}
              onClick={() => setTab(tabDef.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                on ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <Icon size={16} /> {t(tabDef.labelKey)}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && <Overview list={list} />}
      {tab === 'tenants' && (
        <Tenants list={list} onImpersonate={onImpersonate} onAdd={() => setAddOpen(true)} />
      )}
      {tab === 'billing' && <Billing invoices={invoices} />}
      {tab === 'settings' && <SettingsTab />}

      <AddPropertyModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addProperty} />
    </div>
  );
}

// ---- Overview ----
function Overview({ list }: { list: Property[] }) {
  const { t } = useLang();
  const totalRooms = list.reduce((s, p) => s + p.rooms, 0);
  const activeCount = list.filter((p) => p.status === 'Active').length;
  const mrrTotal = list.reduce((s, p) => s + p.mrr, 0);
  const mrrUzs = mrrTotal * 12750;
  const subs = list.filter((p) => p.status === 'Active' || p.status === 'Trial').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label={t('admin_totalProps')}
          value={activeCount}
          sub={`${list.length} / 1,000`}
          delta={{ value: 12, up: true }}
          icon={<Building2 size={20} />}
          accent="indigo"
        />
        <KpiCard
          label={t('admin_mrr')}
          value={USD(mrrTotal)}
          sub={`${mrrUzs.toLocaleString()} UZS / mo`}
          delta={{ value: 18, up: true }}
          icon={<DollarSign size={20} />}
          accent="emerald"
        />
        <KpiCard
          label={t('admin_activeSubs')}
          value={subs}
          sub={`${totalRooms.toLocaleString()} ${t('admin_rooms')}`}
          delta={{ value: 8, up: true }}
          icon={<CreditCard size={20} />}
          accent="sky"
        />
        <KpiCard
          label={t('admin_systemHealth')}
          value="99.9%"
          sub={`${systemServices.filter((s) => s.status === 'Operational').length}/${systemServices.length}`}
          delta={{ value: 0.2, up: true }}
          icon={<Activity size={20} />}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <SectionHeading
            title={t('admin_revenueGrowth')}
            subtitle={t('admin_revenueSub')}
            action={<span className="chip text-emerald-700 bg-emerald-50"><ArrowUpRight size={12} /> +18%</span>}
          />
          <div className="mt-4 h-40">
            <Sparkline data={mrrSeries.map((m) => m.value)} color="#4f46e5" height={120} />
          </div>
          <div className="flex justify-between mt-2">
            {mrrSeries.map((m) => (
              <p key={m.month} className="text-[10px] text-ink-400 font-semibold">{m.month}</p>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <SectionHeading title={t('admin_systemStatus')} subtitle={t('admin_systemStatusSub')} />
          <div className="mt-4 space-y-2.5">
            {systemServices.map((s) => {
              const Icon = s.status === 'Operational' ? CheckCircle2 : s.status === 'Degraded' ? AlertTriangle : Wrench;
              const color = s.status === 'Operational' ? 'text-emerald-500' : s.status === 'Degraded' ? 'text-amber-500' : 'text-slate-400';
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <Icon size={16} className={color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-700 truncate">{s.name}</p>
                    <p className="text-[11px] text-ink-400">{pct(s.uptime)} uptime · {s.latencyMs}ms</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Tenants ----
function Tenants({
  list,
  onImpersonate,
  onAdd,
}: {
  list: Property[];
  onImpersonate: (p: Property) => void;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState('');
  const { t } = useLang();
  const [filterCity, setFilterCity] = useState<'All' | City>('All');
  const [filterPlan, setFilterPlan] = useState<'All' | SubscriptionPlan>('All');
  const toast = useToast();

  const filtered = useMemo(
    () =>
      list.filter(
        (p) =>
          (filterCity === 'All' || p.city === filterCity) &&
          (filterPlan === 'All' || p.plan === filterPlan) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.admin.toLowerCase().includes(query.toLowerCase())),
      ),
    [list, query, filterCity, filterPlan],
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('admin_searchProps')} className="input !py-2 !pl-9" />
        </div>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value as 'All' | City)} className="input !py-2 w-auto">
          <option value="All">{t('admin_allCities')}</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value as 'All' | SubscriptionPlan)} className="input !py-2 w-auto">
          <option value="All">{t('admin_allPlans')}</option>
          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={onAdd} className="btn-primary px-3 py-2 text-sm">
          <Plus size={15} /> {t('admin_add')}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-200/70 bg-ink-50/50">
                <th className="px-5 py-3 font-semibold">{t('admin_property')}</th>
                <th className="px-3 py-3 font-semibold">{t('admin_location')}</th>
                <th className="px-3 py-3 font-semibold text-right">{t('admin_rooms')}</th>
                <th className="px-3 py-3 font-semibold">{t('admin_plan')}</th>
                <th className="px-3 py-3 font-semibold">{t('admin_status')}</th>
                <th className="px-3 py-3 font-semibold text-right">{t('admin_mrrCol')}</th>
                <th className="px-5 py-3 font-semibold text-right">{t('admin_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-800 truncate">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.type} · {p.admin}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center gap-1 text-ink-600">
                      <MapPin size={13} className="text-ink-400" /> {p.city}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right tabular font-medium text-ink-700">{p.rooms}</td>
                  <td className="px-3 py-3.5"><PlanBadge plan={p.plan} /></td>
                  <td className="px-3 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-3.5 text-right tabular font-semibold text-ink-800">
                    {p.mrr > 0 ? USD(p.mrr) : <span className="text-ink-400 font-normal">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => { onImpersonate(p); toast(`${p.name}`, 'info'); }}
                        className="btn-ghost px-2.5 py-1.5 text-xs"
                        title={t('admin_open')}
                      >
                        <Eye size={14} /> {t('admin_open')}
                      </button>
                      <Dropdown
                        width="w-48"
                        trigger={
                          <button className="btn-ghost h-8 w-8 !p-0 rounded-lg" title={t('admin_actions')}>
                            <MoreHorizontal size={16} />
                          </button>
                        }
                      >
                        {(close) => (
                          <>
                            <DropdownItem icon={<Eye size={15} />} label={t('admin_impersonate')} onClick={() => { close(); onImpersonate(p); toast(p.admin, 'info'); }} />
                            <DropdownItem icon={<FileText size={15} />} label={t('admin_viewInvoices')} onClick={() => { close(); toast(t('admin_viewInvoices'), 'info'); }} />
                            <DropdownItem icon={<CreditCard size={15} />} label={t('admin_changePlan')} onClick={() => { close(); toast(t('admin_changePlan'), 'info'); }} />
                            <DropdownDivider />
                            <DropdownItem icon={<Server size={15} />} label={t('admin_suspend')} onClick={() => { close(); toast(t('admin_suspend'), 'error'); }} danger />
                          </>
                        )}
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Billing ----
function Billing({ invoices }: { invoices: typeof seedInvoices }) {
  const { t } = useLang();
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const toast = useToast();
  const filtered = filter === 'All' ? invoices : invoices.filter((i) => i.status === filter);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label={t('admin_collected')} value={USD(totalPaid)} delta={{ value: 14, up: true }} icon={<DollarSign size={20} />} accent="emerald" />
        <KpiCard label={t('admin_pending')} value={USD(totalPending)} icon={<CreditCard size={20} />} accent="amber" />
        <KpiCard label={t('admin_overdue')} value={USD(totalOverdue)} icon={<AlertTriangle size={20} />} accent="rose" />
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-ink-200/70 flex items-center justify-between gap-4 flex-wrap">
          <SectionHeading title={t('admin_invoices')} subtitle={`${filtered.length}`} />
          <div className="flex items-center gap-2">
            {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-200/70 bg-ink-50/50">
                <th className="px-5 py-3 font-semibold">{t('admin_invoice')}</th>
                <th className="px-3 py-3 font-semibold">{t('admin_property')}</th>
                <th className="px-3 py-3 font-semibold">{t('admin_plan')}</th>
                <th className="px-3 py-3 font-semibold">{t('admin_date')}</th>
                <th className="px-3 py-3 font-semibold text-right">{t('admin_amount')}</th>
                <th className="px-3 py-3 font-semibold">{t('admin_status')}</th>
                <th className="px-5 py-3 font-semibold text-right">{t('admin_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-ink-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink-700">{inv.id}</td>
                  <td className="px-3 py-3.5 text-ink-700">{inv.propertyName}</td>
                  <td className="px-3 py-3.5"><PlanBadge plan={inv.plan} /></td>
                  <td className="px-3 py-3.5 text-ink-500 text-xs">{inv.date}</td>
                  <td className="px-3 py-3.5 text-right tabular font-semibold text-ink-800">{USD(inv.amount)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toast(`${t('admin_invoice')} ${inv.id}`, 'success')}
                      className="btn-ghost px-2.5 py-1.5 text-xs"
                    >
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Settings ----
function SettingsTab() {
  const { t } = useLang();
  const toast = useToast();
  const [maintenance, setMaintenance] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [signupOpen, setSignupOpen] = useState(true);
  const [currency, setCurrency] = useState('UZS');
  const [commission, setCommission] = useState(12);

  const save = () => toast(t('admin_saveChanges'), 'success');

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl">
      <div className="card p-5">
        <SectionHeading title={t('admin_platformConfig')} subtitle={t('admin_platformSub')} />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('admin_defaultCurrency')}</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input">
              <option value="UZS">UZS — Uzbek so'm</option>
              <option value="USD">USD — US Dollar</option>
              <option value="RUB">RUB — Russian ruble</option>
            </select>
          </div>
          <div>
            <label className="label">{t('admin_channelCommission')} ({commission}%)</label>
            <input type="range" min={5} max={25} value={commission} onChange={(e) => setCommission(Number(e.target.value))} className="w-full accent-indigo-600 mt-3" />
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <ToggleRow icon={<Zap size={16} />} label={t('admin_autoChannelSync')} desc={t('admin_autoChannelSyncDesc')} checked={autoSync} onChange={setAutoSync} />
          <ToggleRow icon={<Users size={16} />} label={t('admin_openSignups')} desc={t('admin_openSignupsDesc')} checked={signupOpen} onChange={setSignupOpen} />
          <ToggleRow icon={<Wrench size={16} />} label={t('admin_maintenanceMode')} desc={t('admin_maintenanceDesc')} checked={maintenance} onChange={setMaintenance} danger />
        </div>
      </div>

      <div className="card p-5">
        <SectionHeading title={t('admin_featureFlags')} subtitle={t('admin_featureFlagsSub')} />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Telegram Bot Integration', 'Multi-language Support', 'AI Revenue Optimizer', 'Guest Mobile App', 'Loyalty Program', 'Group Bookings'].map((f, i) => (
            <div key={f} className="flex items-center justify-between rounded-xl border border-ink-200 p-3">
              <span className="text-sm font-medium text-ink-700">{f}</span>
              <Toggle checked={i < 3} onChange={() => toast(`${f} toggled`, 'info')} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} className="btn-primary px-5 py-2.5 text-sm">
          <CheckCircle2 size={16} /> {t('admin_saveChanges')}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  desc,
  checked,
  onChange,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3.5">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${danger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-800">{label}</p>
          <p className="text-xs text-ink-400">{desc}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ---- Add Property Modal ----
function AddPropertyModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (p: Omit<Property, 'id' | 'createdAt'>) => void;
}) {
  const toast = useToast();
  const { t } = useLang();
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof TYPES)[number]>('Hotel');
  const [city, setCity] = useState<City>('Tashkent');
  const [rooms, setRooms] = useState(40);
  const [plan, setPlan] = useState<SubscriptionPlan>('Pro');
  const [admin, setAdmin] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      type,
      city,
      rooms,
      plan,
      status: 'Onboarding',
      mrr: plan === 'Basic' ? 60 : plan === 'Pro' ? 180 : 360,
      admin: admin.trim() || 'Unassigned',
      phone: phone.trim() || '+998 71 000 00 00',
      email: email.trim() || 'info@example.uz',
    });
    toast(`${name.trim()} — ${t('admin_add')}`, 'success');
    setName(''); setAdmin(''); setPhone(''); setEmail(''); setRooms(40);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('admin_addPropertyModal')} size="lg" icon={<Plus size={18} className="text-indigo-600" />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">{t('admin_propName')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('admin_propNamePh')} className="input" />
        </div>
        <div>
          <label className="label">{t('admin_type')}</label>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="input">
            {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('admin_city')}</label>
          <select value={city} onChange={(e) => setCity(e.target.value as City)} className="input">
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('admin_roomCount')}</label>
          <input type="number" min={1} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} className="input" />
        </div>
        <div>
          <label className="label">{t('admin_subPlan')}</label>
          <select value={plan} onChange={(e) => setPlan(e.target.value as SubscriptionPlan)} className="input">
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('admin_adminName')}</label>
          <input value={admin} onChange={(e) => setAdmin(e.target.value)} placeholder={t('admin_adminNamePh')} className="input" />
        </div>
        <div>
          <label className="label">{t('admin_phone')}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">{t('admin_email')}</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="info@hotel.uz" className="input" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-ink-100">
        <span className="flex items-center gap-2 text-xs text-ink-400"><Users size={14} /> <StatusBadge status="Onboarding" /></span>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('admin_cancel')}</button>
          <button onClick={submit} disabled={!name.trim()} className="btn-primary px-4 py-2 text-sm">
            <Plus size={15} /> {t('admin_add')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---- Settings Slide-over (shared, triggered from top nav) ----
export function SettingsSlideOver({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const toast = useToast();
  return (
    <SlideOver open={open} onClose={onClose} title={t('admin_accountSettings')} icon={<SettingsIcon size={18} className="text-indigo-600" />}>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">{t('admin_profile')}</p>
          <div className="space-y-3">
            <div><label className="label">{t('admin_fullName')}</label><input className="input" defaultValue="Akmal Rakhimov" /></div>
            <div><label className="label">{t('admin_emailLabel')}</label><input className="input" defaultValue="akmal@hospitalx.uz" /></div>
            <div><label className="label">{t('admin_phoneLabel')}</label><input className="input" defaultValue="+998 90 123 45 67" /></div>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">{t('admin_notifSettings')}</p>
          <div className="space-y-2.5">
            <ToggleRow icon={<Bell size={16} />} label={t('admin_emailAlerts')} desc={t('admin_emailAlertsDesc')} checked={true} onChange={() => {}} />
            <ToggleRow icon={<Bell size={16} />} label={t('admin_smsAlerts')} desc={t('admin_smsAlertsDesc')} checked={false} onChange={() => {}} />
            <ToggleRow icon={<Globe size={16} />} label={t('admin_weeklyDigest')} desc={t('admin_weeklyDigestDesc')} checked={true} onChange={() => {}} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">{t('admin_security')}</p>
          <button onClick={() => toast(t('admin_enable2fa'), 'info')} className="btn-secondary w-full py-2.5 text-sm">
            <Shield size={16} /> {t('admin_enable2fa')}
          </button>
        </div>
        <button onClick={() => { toast(t('admin_saveSettings'), 'success'); onClose(); }} className="btn-primary w-full py-2.5 text-sm">
          <CheckCircle2 size={16} /> {t('admin_saveSettings')}
        </button>
      </div>
    </SlideOver>
  );
}

// re-export kept for clarity (Toggle is imported above)
