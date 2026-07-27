import { useState } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Utensils,
} from 'lucide-react';
import type { Tariff, RoomCategory, CancellationPolicy, MealPlan } from '../../types';
import { UZS, UZS_SHORT } from '../../utils';
import { Modal, EmptyState, Toggle } from '../ui';
import { useToast } from '../../toast';
import { useLang } from '../../i18n';

const CANCEL_POLICIES: CancellationPolicy[] = ['Flexible', 'Moderate', 'Strict', 'Non-Refundable'];
const MEAL_PLANS: MealPlan[] = ['None', 'Breakfast', 'Half Board', 'Full Board'];

const CANCEL_LABEL_KEY: Record<CancellationPolicy, string> = {
  Flexible: 'cancel_flexible',
  Moderate: 'cancel_moderate',
  Strict: 'cancel_strict',
  'Non-Refundable': 'cancel_nonRefundable',
};

const MEAL_LABEL_KEY: Record<MealPlan, string> = {
  None: 'meal_none',
  Breakfast: 'meal_breakfast',
  'Half Board': 'meal_halfBoard',
  'Full Board': 'meal_fullBoard',
};

const CANCEL_STYLE: Record<CancellationPolicy, string> = {
  Flexible: 'text-emerald-700 bg-emerald-50',
  Moderate: 'text-amber-700 bg-amber-50',
  Strict: 'text-rose-700 bg-rose-50',
  'Non-Refundable': 'text-ink-700 bg-ink-100',
};

let tariffCounter = 20;

interface Props {
  tariffs: Tariff[];
  categories: RoomCategory[];
  onUpdate: (tariffs: Tariff[]) => void;
}

export function Tariffs({ tariffs, categories, onUpdate }: Props) {
  const [editing, setEditing] = useState<Tariff | null>(null);
  const [adding, setAdding] = useState(false);
  const { lang, t } = useLang();
  const toast = useToast();

  const deleteTariff = (id: string) => {
    const trf = tariffs.find((x) => x.id === id);
    onUpdate(tariffs.filter((x) => x.id !== id));
    toast(`${trf?.name} — ${t('gen_delete')}`, 'info');
  };

  const saveTariff = (trf: Tariff) => {
    if (tariffs.find((x) => x.id === trf.id)) {
      onUpdate(tariffs.map((x) => (x.id === trf.id ? trf : x)));
      toast(`${trf.name} — ${t('gen_save')}`, 'success');
    } else {
      onUpdate([...tariffs, trf]);
      toast(`${trf.name} — ${t('tfm_create')}`, 'success');
    }
    setEditing(null);
    setAdding(false);
  };

  const toggleActive = (id: string) => {
    onUpdate(tariffs.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">{t('tf_title')}</h2>
          <p className="text-sm text-ink-500 mt-0.5">{t('tf_sub')} · {tariffs.length} {t('gen_tariffs')} · {tariffs.filter((x) => x.active).length} {t('tf_active').toLowerCase()}</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary px-4 py-2.5 text-sm">
          <Plus size={16} /> {t('tf_add')}
        </button>
      </div>

      {tariffs.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Tag size={24} />} title={t('tf_noTariffs')} sub={t('tf_noTariffsSub')} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-200/70 bg-ink-50/50">
                  <th className="px-5 py-3 font-semibold">{t('tf_tariffName')}</th>
                  <th className="px-3 py-3 font-semibold">{t('tf_category')}</th>
                  <th className="px-3 py-3 font-semibold">{t('tf_cancellation')}</th>
                  <th className="px-3 py-3 font-semibold">{t('tf_meals')}</th>
                  <th className="px-3 py-3 font-semibold text-right">{t('tf_dailyRate')}</th>
                  <th className="px-3 py-3 font-semibold text-center">{t('tf_minStay')}</th>
                  <th className="px-3 py-3 font-semibold">{t('tf_activeCol')}</th>
                  <th className="px-5 py-3 font-semibold text-right">{t('tf_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {tariffs.map((trf) => {
                  const cat = categories.find((c) => c.id === trf.categoryId);
                  return (
                    <tr key={trf.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Tag size={15} />
                          </div>
                          <p className="font-semibold text-ink-800">{trf.name}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-ink-600">{cat?.name ?? '-'}</td>
                      <td className="px-3 py-3.5"><span className={`chip ${CANCEL_STYLE[trf.cancellation]}`}>{t(CANCEL_LABEL_KEY[trf.cancellation])}</span></td>
                      <td className="px-3 py-3.5">
                        {trf.mealPlan === 'None' ? <span className="text-ink-400 text-xs">{t('meal_none')}</span> : (
                          <span className="inline-flex items-center gap-1 text-ink-600"><Utensils size={13} className="text-ink-400" /> {t(MEAL_LABEL_KEY[trf.mealPlan])}</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-right tabular font-semibold text-ink-800">{UZS(trf.dailyRate, lang)}</td>
                      <td className="px-3 py-3.5 text-center tabular text-ink-600">{trf.minStay}n</td>
                      <td className="px-3 py-3.5"><Toggle checked={trf.active} onChange={() => toggleActive(trf.id)} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => setEditing(trf)} className="btn-ghost h-8 w-8 !p-0 rounded-lg" title={t('gen_edit')}><Pencil size={14} /></button>
                          <button onClick={() => deleteTariff(trf.id)} className="btn-ghost h-8 w-8 !p-0 rounded-lg text-rose-500 hover:bg-rose-50" title={t('gen_delete')}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(editing || adding) && (
        <TariffModal
          tariff={editing}
          categories={categories}
          onClose={() => { setEditing(null); setAdding(false); }}
          onSave={saveTariff}
        />
      )}
    </div>
  );
}

function TariffModal({
  tariff,
  categories,
  onClose,
  onSave,
}: {
  tariff: Tariff | null;
  categories: RoomCategory[];
  onClose: () => void;
  onSave: (t: Tariff) => void;
}) {
  const isEdit = !!tariff;
  const { lang, t } = useLang();
  const [name, setName] = useState(tariff?.name ?? '');
  const [categoryId, setCategoryId] = useState(tariff?.categoryId ?? categories[0]?.id ?? '');
  const [cancellation, setCancellation] = useState<CancellationPolicy>(tariff?.cancellation ?? 'Flexible');
  const [mealPlan, setMealPlan] = useState<MealPlan>(tariff?.mealPlan ?? 'Breakfast');
  const [mealCost, setMealCost] = useState(tariff?.mealCost ?? 45000);
  const [dailyRate, setDailyRate] = useState(tariff?.dailyRate ?? 500000);
  const [minStay, setMinStay] = useState(tariff?.minStay ?? 1);
  const [active, setActive] = useState(tariff?.active ?? true);

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      id: tariff?.id ?? `t${++tariffCounter}`,
      name: name.trim(),
      categoryId,
      cancellation,
      mealPlan,
      mealCost: mealPlan === 'None' ? 0 : mealCost,
      dailyRate,
      minStay,
      active,
    });
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? t('tfm_editTitle') : t('tfm_addTitle')} size="lg" icon={<Tag size={18} className="text-indigo-600" />}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">{t('tfm_name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('tfm_namePh')} className="input" autoFocus />
          </div>
          <div>
            <label className="label">{t('tfm_category')}</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('tfm_cancellation')}</label>
            <select value={cancellation} onChange={(e) => setCancellation(e.target.value as CancellationPolicy)} className="input">
              {CANCEL_POLICIES.map((p) => <option key={p} value={p}>{t(CANCEL_LABEL_KEY[p])}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('tfm_mealPlan')}</label>
            <select value={mealPlan} onChange={(e) => setMealPlan(e.target.value as MealPlan)} className="input">
              {MEAL_PLANS.map((m) => <option key={m} value={m}>{t(MEAL_LABEL_KEY[m])}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('tfm_mealCost')}</label>
            <input type="number" min={0} value={mealCost} disabled={mealPlan === 'None'} onChange={(e) => setMealCost(Number(e.target.value))} className="input disabled:opacity-50" />
          </div>
          <div>
            <label className="label">{t('tfm_dailyRate')}</label>
            <input type="number" min={0} value={dailyRate} onChange={(e) => setDailyRate(Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">{t('tfm_minStay')}</label>
            <input type="number" min={1} value={minStay} onChange={(e) => setMinStay(Number(e.target.value))} className="input" />
          </div>
        </div>

        <div className="rounded-xl bg-ink-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">{t('tfm_ratePreview')}</p>
            <p className="text-lg font-bold text-ink-900">{UZS(dailyRate, lang)}<span className="text-sm font-normal text-ink-400">{t('tfm_perNight')}</span></p>
          </div>
          {mealPlan !== 'None' && (
            <div className="text-right">
              <p className="text-xs text-ink-400">+ {t(MEAL_LABEL_KEY[mealPlan])}</p>
              <p className="text-sm font-semibold text-ink-600">{UZS(mealCost, lang)}/pax</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3.5">
          <div>
            <p className="text-sm font-semibold text-ink-800">{t('tfm_active')}</p>
            <p className="text-xs text-ink-400">{t('tfm_activeDesc')}</p>
          </div>
          <Toggle checked={active} onChange={setActive} />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-ink-100">
        <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('gen_cancel')}</button>
        <button onClick={submit} disabled={!name.trim()} className="btn-primary px-4 py-2 text-sm">
          <CheckCircle2 size={15} /> {isEdit ? t('tfm_save') : t('tfm_create')}
        </button>
      </div>
    </Modal>
  );
}
