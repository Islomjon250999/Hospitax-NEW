import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  BedDouble,
  Power,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import type { Hotel, ConnectionRequest } from '../types';
import { useAuth } from '../lib/auth';
import { useLang } from '../i18n';
import { useToast } from '../toast';
import { loadHotels, createHotel, updateHotel, loadConnectionRequests, updateRequestStatus } from '../lib/hotelData';
import { KpiCard, SectionHeading, StatusBadge, PlanBadge, Modal } from './ui';

const CITIES = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Tashkent Region'];
const PLANS = ['Basic', 'Pro', 'Enterprise'];
const TYPES = ['Hotel', 'Boutique Hotel', 'Hostel', 'Resort', 'Guesthouse'];

export function SuperAdminPanel() {
  const { user } = useAuth();
  const { lang, t } = useLang();
  const toast = useToast();
  const langKey = lang as 'uz' | 'ru' | 'en';
  const [tab, setTab] = useState<'hotels' | 'requests'>('hotels');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [h, r] = await Promise.all([loadHotels(), loadConnectionRequests()]);
      setHotels(h);
      setRequests(r);
    } catch {
      toast(t('gen_error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { reload(); }, [reload]);

  const handleToggleStatus = async (h: Hotel) => {
    const newStatus = h.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateHotel(h.id, { status: newStatus, subscriptionStatus: newStatus });
      await reload();
      toast(`${h.name} — ${newStatus}`, 'info');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const handleAddHotel = async (h: Omit<Hotel, 'id' | 'createdAt'>) => {
    try {
      await createHotel(h);
      await reload();
      setAddOpen(false);
      toast(`${h.name} — ${t('ceo_staffCreated')}`, 'success');
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const handleRequestStatus = async (id: string, status: ConnectionRequest['status']) => {
    try {
      await updateRequestStatus(id, status);
      await reload();
    } catch {
      toast(t('gen_error'), 'error');
    }
  };

  const filtered = hotels.filter((h) => h.name.toLowerCase().includes(query.toLowerCase()) || h.city.toLowerCase().includes(query.toLowerCase()));
  const activeCount = hotels.filter((h) => h.status === 'Active').length;
  const trialCount = hotels.filter((h) => h.status === 'Trial').length;
  const suspendedCount = hotels.filter((h) => h.status === 'Suspended').length;

  const TABS = [
    { id: 'hotels' as const, icon: Building2, label: langKey === 'uz' ? "Mehmonxonalar" : 'Hotels' },
    { id: 'requests' as const, icon: Eye, label: langKey === 'uz' ? "So'rovlar" : 'Requests' },
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
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200/40">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            {langKey === 'uz' ? "Super Admin Paneli" : langKey === 'ru' ? 'Панель Супер Админа' : 'Super Admin Panel'}
          </h1>
          <p className="text-sm text-ink-500">{user?.fullName} — {langKey === 'uz' ? "Mehmonxonalar va obunalarni boshqarish" : langKey === 'ru' ? 'Управление отелями и подписками' : 'Manage hotels and subscriptions'}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-ink-200 overflow-x-auto">
        {TABS.map((tb) => {
          const Icon = tb.icon;
          const on = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${on ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-ink-500 hover:text-ink-700'}`}>
              <Icon size={16} /> {tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'hotels' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label={langKey === 'uz' ? "Faol mehmonxonalar" : 'Active Hotels'} value={activeCount} sub={`${hotels.length} total`} delta={{ value: 12, up: true }} icon={<CheckCircle2 size={20} />} accent="emerald" />
            <KpiCard label={langKey === 'uz' ? "Sinov davri" : 'Trial'} value={trialCount} sub={langKey === 'uz' ? "Sinov holatida" : 'On trial'} icon={<AlertTriangle size={20} />} accent="amber" />
            <KpiCard label={langKey === 'uz' ? "Bloklangan" : 'Suspended'} value={suspendedCount} sub={langKey === 'uz' ? "Faol emas" : 'Inactive'} icon={<Power size={20} />} accent="rose" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={langKey === 'uz' ? "Qidirish..." : 'Search...'} className="input !py-2 !pl-9" />
            </div>
            <button onClick={() => setAddOpen(true)} className="btn-primary px-3 py-2 text-sm">
              <Plus size={15} /> {langKey === 'uz' ? "Yangi mehmonxona" : 'Add Hotel'}
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-200/70 bg-ink-50/50">
                    <th className="px-5 py-3 font-semibold">{langKey === 'uz' ? "Mehmonxona" : 'Hotel'}</th>
                    <th className="px-3 py-3 font-semibold">{langKey === 'uz' ? "Shahar" : 'City'}</th>
                    <th className="px-3 py-3 font-semibold text-right">{langKey === 'uz' ? "Xonalar" : 'Rooms'}</th>
                    <th className="px-3 py-3 font-semibold">{langKey === 'uz' ? "Tarif" : 'Plan'}</th>
                    <th className="px-3 py-3 font-semibold">{langKey === 'uz' ? "Holat" : 'Status'}</th>
                    <th className="px-5 py-3 font-semibold text-right">{langKey === 'uz' ? "Amallar" : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filtered.map((h) => (
                    <tr key={h.id} className="hover:bg-ink-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-ink-800">{h.name}</p>
                            <p className="text-xs text-ink-400">{h.type} · {h.adminName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-1 text-ink-600"><MapPin size={13} className="text-ink-400" /> {h.city}</span>
                      </td>
                      <td className="px-3 py-3.5 text-right tabular font-medium text-ink-700">{h.roomsCount}</td>
                      <td className="px-3 py-3.5"><PlanBadge plan={h.plan as 'Basic' | 'Pro' | 'Enterprise'} /></td>
                      <td className="px-3 py-3.5"><StatusBadge status={h.status as 'Active' | 'Trial' | 'Suspended' | 'Onboarding'} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(h)}
                          className={`btn-ghost px-2.5 py-1.5 text-xs font-bold ${h.status === 'Active' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          <Power size={14} /> {h.status === 'Active' ? (langKey === 'uz' ? "Bloklash" : 'Suspend') : (langKey === 'uz' ? "Faollashtirish" : 'Activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-4 animate-fade-in">
          <SectionHeading title={langKey === 'uz' ? "Ulanish so'rovlari" : 'Connection Requests'} subtitle={`${requests.length} ${langKey === 'uz' ? "so'rov" : 'requests'}`} />
          {requests.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-sm text-ink-400">{langKey === 'uz' ? "Hozircha so'rovlar yo'q" : 'No requests yet'}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {requests.map((r) => (
                <div key={r.id} className="card p-4 border border-ink-100 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-ink-900">{r.hotelName}</p>
                      <span className={`chip text-xs font-bold ${
                        r.status === 'New' ? 'bg-sky-50 text-sky-700' :
                        r.status === 'Contacted' ? 'bg-amber-50 text-amber-700' :
                        r.status === 'Connected' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5">{r.contactName} · {r.phone} · {r.city} · {r.roomCount} {langKey === 'uz' ? 'xona' : 'rooms'}</p>
                    {r.message && <p className="text-xs text-ink-400 mt-1.5 italic">"{r.message}"</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleRequestStatus(r.id, 'Contacted')} className="btn-ghost px-2 py-1 text-xs" title="Mark Contacted">📞</button>
                    <button onClick={() => handleRequestStatus(r.id, 'Connected')} className="btn-ghost px-2 py-1 text-xs" title="Mark Connected">✓</button>
                    <button onClick={() => handleRequestStatus(r.id, 'Rejected')} className="btn-ghost px-2 py-1 text-xs text-rose-500" title="Reject">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddHotelModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddHotel} />
    </div>
  );
}

function AddHotelModal({ open, onClose, onAdd }: {
  open: boolean;
  onClose: () => void;
  onAdd: (h: Omit<Hotel, 'id' | 'createdAt'>) => void;
}) {
  const { lang } = useLang();
  const langKey = lang as 'uz' | 'ru' | 'en';
  const [form, setForm] = useState({
    name: '', type: 'Hotel', city: 'Tashkent', roomsCount: 0, plan: 'Basic', status: 'Active',
    mrr: 0, adminName: '', phone: '', email: '', address: '', subscriptionStatus: 'Active', trialEndsAt: null as string | null,
  });

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={langKey === 'uz' ? "Yangi mehmonxona" : 'New Hotel'} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{langKey === 'uz' ? "Nomi" : 'Name'} *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Grand Hotel" />
          </div>
          <div>
            <label className="label">{langKey === 'uz' ? "Turi" : 'Type'}</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{langKey === 'uz' ? "Shahar" : 'City'}</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input">
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{langKey === 'uz' ? "Xonalar soni" : 'Rooms'}</label>
            <input type="number" value={form.roomsCount} onChange={(e) => setForm({ ...form, roomsCount: parseInt(e.target.value) || 0 })} className="input" />
          </div>
          <div>
            <label className="label">{langKey === 'uz' ? "Tarif" : 'Plan'}</label>
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="input">
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{langKey === 'uz' ? "Admin" : 'Admin'}</label>
            <input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} className="input" placeholder="Admin name" />
          </div>
        </div>
        <button onClick={() => form.name && onAdd(form)} className="btn-primary w-full py-2.5 text-sm font-bold">
          <Plus size={16} /> {langKey === 'uz' ? "Yaratish" : 'Create'}
        </button>
      </div>
    </Modal>
  );
}
