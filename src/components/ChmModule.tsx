import { useState } from 'react';
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
  Plug,
  Settings2,
  Percent,
  Calendar,
} from 'lucide-react';
import type { Channel } from '../types';
import { channels as seedChannels, channelMix } from '../mockData';
import { pct } from '../utils';
import { KpiCard, SectionHeading, Segmented, Toggle, Modal } from './ui';
import { useToast } from '../toast';
import { useLang } from '../i18n';

function lastSyncLabel(min: number): string {
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m ago`;
}

export function ChmModule() {
  const { t } = useLang();
  const [list, setList] = useState<Channel[]>(seedChannels);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [configChannel, setConfigChannel] = useState<Channel | null>(null);
  const toast = useToast();

  const connected = list.filter((c) => c.connected).length;
  const connectedList = list.filter((c) => c.connected);
  const avgParity = Math.round(
    (connectedList.reduce((s, c) => s + c.rateParity, 0) / (connectedList.length || 1)) * 10,
  ) / 10;
  const totalBookings = list.reduce((s, c) => s + c.bookings30d, 0);
  const totalListings = list.reduce((s, c) => s + c.listings, 0);

  const syncNow = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setList((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, lastSyncMin: 0, syncActive: true, rateParity: Math.min(100, c.rateParity + 0.4) } : c,
        ),
      );
      setSyncing(null);
      const name = list.find((c) => c.id === id)?.name;
      toast(`${name} — ${t('chm_syncNow')}`, 'success');
    }, 1400);
  };

  const toggleSync = (id: string) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, syncActive: !c.syncActive } : c)));
    const ch = list.find((c) => c.id === id);
    toast(ch?.syncActive ? t('chm_syncNow') : t('chm_connect'), ch?.syncActive ? 'info' : 'success');
  };

  const connectChannel = (id: string) => {
    setList((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, connected: true, syncActive: true, rateParity: 95, lastSyncMin: 0, listings: 184 } : c,
      ),
    );
    const name = list.find((c) => c.id === id)?.name;
    toast(`${name} — ${t('chm_connect')}`, 'success');
  };

  const applyBulk = (payload: { delta: number; channels: string[]; nights: number }) => {
    toast(`${t('chm_pushUpdate')}: ${payload.channels.length}`, 'success');
    setBulkOpen(false);
  };

  const saveConfig = (name: string) => {
    toast(`${name} — ${t('chm_saveConfig')}`, 'success');
    setConfigChannel(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">{t('chm_title')}</h2>
          <p className="text-sm text-ink-500 mt-0.5">{t('chm_sub')}</p>
        </div>
        <button onClick={() => setBulkOpen(true)} className="btn-primary px-4 py-2.5 text-sm">
          <Layers size={16} /> {t('chm_bulkUpdate')}
        </button>
      </div>

      {/* ---- KPI cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('chm_connected')} value={`${connected}/${list.length}`} sub="OTA" icon={<Radio size={20} />} accent="indigo" />
        <KpiCard label={t('chm_avgParity')} value={pct(avgParity)} sub={t('chm_avgParitySub')} delta={{ value: 1.4, up: true }} icon={<TrendingUp size={20} />} accent="emerald" />
        <KpiCard label={t('chm_listingsSynced')} value={totalListings.toLocaleString()} sub={t('chm_listingsSub')} icon={<Layers size={20} />} accent="sky" />
        <KpiCard label={t('chm_bookings30d')} value={totalBookings.toLocaleString()} sub={t('chm_bookingsSub')} delta={{ value: 22, up: true }} icon={<Zap size={20} />} accent="amber" />
      </div>

      {/* ---- Channel cards ---- */}
      <div>
        <h3 className="text-sm font-bold text-ink-900 mb-3">{t('chm_connections')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((c) => {
            const parityColor = c.rateParity >= 97 ? 'text-emerald-600' : c.rateParity >= 90 ? 'text-amber-600' : 'text-rose-600';
            const isSyncing = syncing === c.id;
            return (
              <div key={c.id} className="card p-5 hover:shadow-float transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl ${c.color} ${c.textColor} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900 truncate">{c.name}</p>
                      <p className="text-xs text-ink-400">{c.region}</p>
                    </div>
                  </div>
                  {c.connected ? (
                    <Toggle checked={c.syncActive} onChange={() => toggleSync(c.id)} />
                  ) : (
                    <span className="chip bg-ink-100 text-ink-500">{t('chm_notConnected')}</span>
                  )}
                </div>

                {c.connected ? (
                  <>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-ink-50 py-2">
                        <p className={`text-base font-bold tabular ${parityColor}`}>{pct(c.rateParity)}</p>
                        <p className="text-[10px] text-ink-400 font-medium">{t('chm_rateParity')}</p>
                      </div>
                      <div className="rounded-lg bg-ink-50 py-2">
                        <p className="text-base font-bold tabular text-ink-800">{c.bookings30d}</p>
                        <p className="text-[10px] text-ink-400 font-medium">{t('chm_bookings30')}</p>
                      </div>
                      <div className="rounded-lg bg-ink-50 py-2">
                        <p className="text-xs font-bold text-ink-700 flex items-center justify-center gap-1">
                          <Clock size={11} className="text-ink-400" />
                          {isSyncing ? 'now' : lastSyncLabel(c.lastSyncMin)}
                        </p>
                        <p className="text-[10px] text-ink-400 font-medium">{t('chm_lastSync')}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.rateParity >= 97 ? 'bg-emerald-500' : c.rateParity >= 90 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${c.rateParity}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => syncNow(c.id)} disabled={isSyncing} className="btn-secondary flex-1 px-3 py-2 text-xs">
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? t('chm_syncing') : t('chm_syncNow')}
                      </button>
                      <button onClick={() => setConfigChannel(c)} className="btn-ghost px-3 py-2 text-xs">
                        <Settings2 size={13} /> {t('chm_editMapping')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-4 rounded-lg bg-ink-50 py-4 text-center">
                      <p className="text-xs text-ink-400">{t('chm_commission')}: {c.commission}%</p>
                      <p className="text-[11px] text-ink-400 mt-1">{t('chm_connectToStart')}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => setConfigChannel(c)} className="btn-primary flex-1 px-3 py-2 text-xs">
                        <Plug size={13} /> {t('chm_connect')}
                      </button>
                      <button onClick={() => setConfigChannel(c)} className="btn-ghost px-3 py-2 text-xs">
                        <Settings2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Channel mix donut + breakdown ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-1 flex flex-col items-center justify-center">
          <SectionHeading title={t('chm_sourceMix')} />
          <Donut data={channelMix} />
          <p className="text-xs text-ink-400 mt-3 text-center">{t('chm_last30')} · {totalBookings}</p>
        </div>
        <div className="card p-5 lg:col-span-2">
          <SectionHeading title={t('chm_breakdown')} subtitle={t('chm_breakdownSub')} />
          <div className="mt-4 space-y-3">
            {channelMix.map((m) => (
              <div key={m.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-ink-700">{m.name}</span>
                  <span className="tabular font-semibold text-ink-800">{m.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.value}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Bulk update modal ---- */}
      {bulkOpen && <BulkUpdateModal channels={list} onClose={() => setBulkOpen(false)} onApply={applyBulk} />}

      {/* ---- Channel config modal ---- */}
      {configChannel && (
        <ChannelConfigModal channel={configChannel} onClose={() => setConfigChannel(null)} onConnect={connectChannel} onSave={saveConfig} />
      )}
    </div>
  );
}

function Donut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const { t } = useLang();
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const r = 60;
  const stroke = 24;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative mt-4" style={{ width: 180, height: 180 }}>
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {data.map((d) => {
          const len = (d.value / total) * circ;
          const el = (
            <circle
              key={d.name}
              cx="80" cy="80" r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-acc}
              strokeLinecap="butt"
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-ink-900 tabular">{total}%</p>
        <p className="text-[10px] text-ink-400 font-medium">{t('chm_distributed')}</p>
      </div>
    </div>
  );
}

// ---- Channel configuration modal ----
function ChannelConfigModal({
  channel,
  onClose,
  onConnect,
  onSave,
}: {
  channel: Channel;
  onClose: () => void;
  onConnect: (id: string) => void;
  onSave: (name: string) => void;
}) {
  const { t } = useLang();
  const [syncRates, setSyncRates] = useState(true);
  const [syncAvail, setSyncAvail] = useState(true);
  const [syncRestrictions, setSyncRestrictions] = useState(false);
  const [autoSync, setAutoSync] = useState(channel.syncActive);
  const [parityMode, setParityMode] = useState<'strict' | 'flexible'>('strict');
  const [markup, setMarkup] = useState(channel.commission);

  const isConn = channel.connected;

  return (
    <Modal
      open
      onClose={onClose}
      title={isConn ? `${t('chm_editMappingTitle')} ${channel.name}` : `${t('chm_connectTitle')} ${channel.name}`}
      size="lg"
      icon={<Settings2 size={18} className="text-indigo-600" />}
    >
      <div className="space-y-5">
        {/* Channel header */}
        <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-4">
          <div className={`h-12 w-12 rounded-xl ${channel.color} ${channel.textColor} flex items-center justify-center font-bold`}>
            {channel.initials}
          </div>
          <div className="flex-1">
            <p className="font-bold text-ink-900">{channel.name}</p>
            <p className="text-xs text-ink-400">{channel.region} · {channel.commission}% {t('chm_commission')}</p>
          </div>
          {isConn ? (
            <span className="chip text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20">
              <CheckCircle2 size={12} /> {t('chm_connectedStatus')}
            </span>
          ) : (
            <span className="chip bg-ink-100 text-ink-500">{t('chm_notConnectedCap')}</span>
          )}
        </div>

        {/* Sync settings */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">{t('chm_syncSettings')}</p>
          <div className="space-y-2.5">
            <ConfigToggle icon={<Percent size={16} />} label={t('chm_rateSync')} desc={t('chm_rateSyncDesc')} checked={syncRates} onChange={setSyncRates} />
            <ConfigToggle icon={<Calendar size={16} />} label={t('chm_availSync')} desc={t('chm_availSyncDesc')} checked={syncAvail} onChange={setSyncAvail} />
            <ConfigToggle icon={<Layers size={16} />} label={t('chm_restrictionsSync')} desc={t('chm_restrictionsDesc')} checked={syncRestrictions} onChange={setSyncRestrictions} />
            <ConfigToggle icon={<Zap size={16} />} label={t('chm_autoSync')} desc={t('chm_autoSyncDesc')} checked={autoSync} onChange={setAutoSync} />
          </div>
        </div>

        {/* Rate parity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('chm_parityMode')}</label>
            <Segmented
              options={[{ label: t('chm_strict'), value: 'strict' }, { label: t('chm_flexible'), value: 'flexible' }]}
              value={parityMode}
              onChange={(v) => setParityMode(v)}
            />
          </div>
          <div>
            <label className="label">{t('chm_markup')} ({markup}%)</label>
            <input type="range" min={0} max={25} value={markup} onChange={(e) => setMarkup(Number(e.target.value))} className="w-full accent-indigo-600 mt-3" />
          </div>
        </div>

        {isConn && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-ink-50 py-2.5">
              <p className="text-base font-bold text-ink-800 tabular">{pct(channel.rateParity)}</p>
              <p className="text-[10px] text-ink-400">{t('chm_currentParity')}</p>
            </div>
            <div className="rounded-lg bg-ink-50 py-2.5">
              <p className="text-base font-bold text-ink-800 tabular">{channel.listings}</p>
              <p className="text-[10px] text-ink-400">{t('chm_activeListings')}</p>
            </div>
            <div className="rounded-lg bg-ink-50 py-2.5">
              <p className="text-base font-bold text-ink-800 tabular">{channel.bookings30d}</p>
              <p className="text-[10px] text-ink-400">{t('chm_bookings30')}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-ink-100">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('gen_cancel')}</button>
          {isConn ? (
            <button onClick={() => onSave(channel.name)} className="btn-primary px-4 py-2 text-sm">
              <CheckCircle2 size={15} /> {t('chm_saveConfig')}
            </button>
          ) : (
            <button onClick={() => { onConnect(channel.id); onClose(); }} className="btn-primary px-4 py-2 text-sm">
              <Plug size={15} /> {t('chm_connectEnable')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ConfigToggle({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3.5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-ink-800">{label}</p>
          <p className="text-xs text-ink-400">{desc}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ---- Bulk update modal ----
function BulkUpdateModal({
  channels,
  onClose,
  onApply,
}: {
  channels: Channel[];
  onClose: () => void;
  onApply: (p: { delta: number; channels: string[]; nights: number }) => void;
}) {
  const { t } = useLang();
  const [mode, setMode] = useState<'increase' | 'decrease'>('increase');
  const [delta, setDelta] = useState(10);
  const [nights, setNights] = useState(7);
  const [selected, setSelected] = useState<string[]>(channels.filter((c) => c.connected).map((c) => c.id));
  const effectiveDelta = mode === 'increase' ? delta : -delta;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Modal open onClose={onClose} title={t('chm_bulkTitle')} size="lg" icon={<Layers size={18} className="text-indigo-600" />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('chm_adjustment')}</label>
          <Segmented
            options={[{ label: t('chm_increase'), value: 'increase' }, { label: t('chm_decrease'), value: 'decrease' }]}
            value={mode}
            onChange={(v) => setMode(v)}
          />
        </div>
        <div>
          <label className="label">{t('chm_percentage')} ({effectiveDelta > 0 ? '+' : ''}{effectiveDelta}%)</label>
          <input type="range" min={1} max={50} value={delta} onChange={(e) => setDelta(Number(e.target.value))} className="w-full accent-indigo-600 mt-2" />
        </div>
        <div>
          <label className="label">{t('chm_applyNights')}</label>
          <input type="number" min={1} max={90} value={nights} onChange={(e) => setNights(Number(e.target.value))} className="input" />
        </div>
        <div>
          <label className="label">{t('chm_affected')}</label>
          <p className="text-sm font-semibold text-ink-800 mt-2">{selected.length} {t('chm_selected')}</p>
        </div>
      </div>

      <div className="mt-4">
        <label className="label">{t('chm_selectChannels')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
          {channels.map((c) => {
            const on = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  on ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-100' : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg ${c.color} ${c.textColor} flex items-center justify-center text-xs font-bold shrink-0`}>{c.initials}</div>
                <span className="text-sm font-medium text-ink-700 flex-1 truncate">{c.name}</span>
                {on ? <CheckCircle2 size={16} className="text-indigo-600 shrink-0" /> : <AlertCircle size={16} className="text-ink-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between pt-4 border-t border-ink-100">
        <p className="text-xs text-ink-400">
          {nights} {t('be_nights')} · {effectiveDelta > 0 ? '+' : ''}{effectiveDelta}% · {selected.length} {t('chm_selected')}
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('gen_cancel')}</button>
          <button onClick={() => onApply({ delta: effectiveDelta, channels: selected, nights })} disabled={selected.length === 0} className="btn-primary px-4 py-2 text-sm">
            {t('chm_pushUpdate')} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
