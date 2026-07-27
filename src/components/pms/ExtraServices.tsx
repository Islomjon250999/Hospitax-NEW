import { useState } from 'react';
import {
  ConciergeBell,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Plane,
  Coffee,
  WashingMachine,
  Sparkles,
  BedSingle,
  Clock,
} from 'lucide-react';
import type { ExtraService, ServiceCalcType } from '../../types';
import { UZS } from '../../utils';
import { Modal, EmptyState, Toggle } from '../ui';
import { useToast } from '../../toast';
import { useLang } from '../../i18n';

const CALC_TYPES: ServiceCalcType[] = ['Per Night', 'Per Person', 'One-Time'];

const CALC_LABEL_KEY: Record<ServiceCalcType, string> = {
  'Per Night': 'sm_perNight',
  'Per Person': 'sm_perPerson',
  'One-Time': 'sm_oneTime',
};

const CALC_STYLE: Record<ServiceCalcType, string> = {
  'Per Night': 'text-sky-700 bg-sky-50',
  'Per Person': 'text-violet-700 bg-violet-50',
  'One-Time': 'text-amber-700 bg-amber-50',
};

const SERVICE_ICONS: Record<string, typeof Plane> = {
  Airport: Plane,
  Breakfast: Coffee,
  Laundry: WashingMachine,
  Spa: Sparkles,
  Bed: BedSingle,
  Check: Clock,
};

function iconFor(name: string) {
  const key = Object.keys(SERVICE_ICONS).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return key ? SERVICE_ICONS[key] : ConciergeBell;
}

let serviceCounter = 20;

interface Props {
  services: ExtraService[];
  onUpdate: (services: ExtraService[]) => void;
}

export function ExtraServices({ services, onUpdate }: Props) {
  const [editing, setEditing] = useState<ExtraService | null>(null);
  const [adding, setAdding] = useState(false);
  const { lang, t } = useLang();
  const toast = useToast();

  const deleteService = (id: string) => {
    const svc = services.find((x) => x.id === id);
    onUpdate(services.filter((x) => x.id !== id));
    toast(`${svc?.name} — ${t('gen_delete')}`, 'info');
  };

  const saveService = (s: ExtraService) => {
    if (services.find((x) => x.id === s.id)) {
      onUpdate(services.map((x) => (x.id === s.id ? s : x)));
      toast(`${s.name} — ${t('gen_save')}`, 'success');
    } else {
      onUpdate([...services, s]);
      toast(`${s.name} — ${t('sm_create')}`, 'success');
    }
    setEditing(null);
    setAdding(false);
  };

  const toggleActive = (id: string) => {
    onUpdate(services.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">{t('es_title')}</h2>
          <p className="text-sm text-ink-500 mt-0.5">{t('es_sub')} · {services.length} · {services.filter((s) => s.active).length} {t('sm_active').toLowerCase()}</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary px-4 py-2.5 text-sm">
          <Plus size={16} /> {t('es_add')}
        </button>
      </div>

      {services.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ConciergeBell size={24} />} title={t('es_noServices')} sub={t('es_noServicesSub')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => {
            const Icon = iconFor(s.name);
            const vatAmount = Math.round(s.unitPrice * (s.vat / 100));
            const totalWithVat = s.unitPrice + vatAmount;
            return (
              <div key={s.id} className="card p-5 hover:shadow-float transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-ink-900">{s.name}</p>
                      <span className={`chip ${CALC_STYLE[s.calcType]}`}>{t(CALC_LABEL_KEY[s.calcType])}</span>
                    </div>
                  </div>
                  <Toggle checked={s.active} onChange={() => toggleActive(s.id)} />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400">{t('es_unitPrice')}</span>
                    <span className="font-semibold text-ink-800 tabular">{UZS(s.unitPrice, lang)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-400">{t('es_vat')} ({s.vat}%)</span>
                    <span className="text-ink-600 tabular">+{UZS(vatAmount, lang)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-ink-100">
                    <span className="text-sm font-semibold text-ink-700">{t('es_totalVat')}</span>
                    <span className="font-bold text-ink-900 tabular">{UZS(totalWithVat, lang)}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditing(s)} className="btn-secondary flex-1 px-3 py-2 text-xs">
                    <Pencil size={13} /> {t('es_edit')}
                  </button>
                  <button onClick={() => deleteService(s.id)} className="btn-ghost px-3 py-2 text-xs text-rose-500 hover:bg-rose-50">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(editing || adding) && (
        <ServiceModal
          service={editing}
          onClose={() => { setEditing(null); setAdding(false); }}
          onSave={saveService}
        />
      )}
    </div>
  );
}

function ServiceModal({
  service,
  onClose,
  onSave,
}: {
  service: ExtraService | null;
  onClose: () => void;
  onSave: (s: ExtraService) => void;
}) {
  const isEdit = !!service;
  const { lang, t } = useLang();
  const [name, setName] = useState(service?.name ?? '');
  const [unitPrice, setUnitPrice] = useState(service?.unitPrice ?? 50000);
  const [calcType, setCalcType] = useState<ServiceCalcType>(service?.calcType ?? 'One-Time');
  const [vat, setVat] = useState(service?.vat ?? 12);
  const [active, setActive] = useState(service?.active ?? true);

  const vatAmount = Math.round(unitPrice * (vat / 100));

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      id: service?.id ?? `s${++serviceCounter}`,
      name: name.trim(),
      unitPrice,
      calcType,
      vat,
      active,
    });
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? t('sm_editTitle') : t('sm_addTitle')} size="md" icon={<ConciergeBell size={18} className="text-indigo-600" />}>
      <div className="space-y-4">
        <div>
          <label className="label">{t('sm_name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('sm_namePh')} className="input" autoFocus />
        </div>
        <div>
          <label className="label">{t('sm_calcType')}</label>
          <div className="grid grid-cols-3 gap-2">
            {CALC_TYPES.map((c) => (
              <button
                key={c}
                onClick={() => setCalcType(c)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  calcType === c ? 'border-indigo-400 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-100' : 'border-ink-200 text-ink-500 hover:border-ink-300'
                }`}
              >
                {t(CALC_LABEL_KEY[c])}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('sm_unitPrice')}</label>
            <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">{t('sm_vat')}</label>
            <input type="number" min={0} max={100} value={vat} onChange={(e) => setVat(Number(e.target.value))} className="input" />
          </div>
        </div>

        <div className="rounded-xl bg-ink-50 p-4 space-y-1.5">
          <div className="flex justify-between text-sm"><span className="text-ink-400">{t('es_unitPrice')}</span><span className="tabular text-ink-700">{UZS(unitPrice, lang)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-ink-400">{t('es_vat')} ({vat}%)</span><span className="tabular text-ink-600">+{UZS(vatAmount, lang)}</span></div>
          <div className="flex justify-between pt-1.5 border-t border-ink-200">
            <span className="font-bold text-ink-900">{t('qb_total')}</span>
            <span className="font-bold text-ink-900 tabular">{UZS(unitPrice + vatAmount, lang)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3.5">
          <div>
            <p className="text-sm font-semibold text-ink-800">{t('sm_active')}</p>
            <p className="text-xs text-ink-400">{t('sm_activeDesc')}</p>
          </div>
          <Toggle checked={active} onChange={setActive} />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-ink-100">
        <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('gen_cancel')}</button>
        <button onClick={submit} disabled={!name.trim()} className="btn-primary px-4 py-2 text-sm">
          <CheckCircle2 size={15} /> {isEdit ? t('gen_save') : t('sm_create')}
        </button>
      </div>
    </Modal>
  );
}
