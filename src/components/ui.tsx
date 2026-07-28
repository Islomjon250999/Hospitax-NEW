import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, X, ChevronDown, Check } from 'lucide-react';

// ---- Status badges & chips ----
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Trial: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    Suspended: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    Onboarding: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Operational: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Degraded: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Maintenance: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Overdue: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  };
  return (
    <span className={`chip ring-1 ring-inset ${map[status] ?? 'bg-ink-100 text-ink-700 ring-ink-600/20'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    Basic: 'bg-ink-100 text-ink-700',
    Pro: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    Enterprise: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
  };
  return <span className={`chip ${map[plan] ?? 'bg-ink-100 text-ink-700'}`}>{plan}</span>;
}

// ---- KPI card ----
export function KpiCard({
  label,
  value,
  sub,
  delta,
  icon,
  accent = 'indigo',
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  delta?: { value: number; up: boolean };
  icon: ReactNode;
  accent?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';
}) {
  const accents: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card p-5 group hover:shadow-float transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accents[accent]}`}>
          {icon}
        </div>
        {delta && (
          <span className={`chip ${delta.up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
            {delta.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta.value}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-ink-900 tabular">{value}</p>
      <p className="text-sm font-medium text-ink-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-ink-400 mt-1.5">{sub}</p>}
    </div>
  );
}

// ---- Section heading ----
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---- Modal ----
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
}) {
  if (!open) return null;
  const w = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-full ${w} bg-white rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[85vh] overflow-hidden`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-ink-100 shrink-0">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-base font-bold text-ink-900">{title}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost h-8 w-8 !p-0 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 h-16 border-t border-ink-100 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>);
}

// ---- SlideOver (right drawer) ----
export function SlideOver({
  open,
  onClose,
  title,
  children,
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-float animate-slide-in flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-200 shrink-0">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-base font-bold text-ink-900">{title}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost h-8 w-8 !p-0 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// ---- Dropdown (click-to-open, click-away closes) ----
export function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-56',
}: {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} ${width} card p-1.5 z-50 animate-scale-in`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
        danger ? 'text-rose-600 hover:bg-rose-50' : 'text-ink-700 hover:bg-ink-100'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-ink-100" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-400">{children}</p>;
}

// ---- Segmented control ----
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex p-1 bg-ink-100 rounded-xl gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            value === o.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---- Toggle switch ----
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-ink-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
      {label && <span className="text-sm font-medium text-ink-700">{label}</span>}
    </button>
  );
}

// ---- Sparkline (inline SVG) ----
export function Sparkline({
  data,
  color = '#4f46e5',
  height = 40,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const w = 100;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((d - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(' L ')}`;
  const area = `${path} L ${w},${height} L 0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---- Empty state ----
export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-14 w-14 rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}

// ---- Avatar ----
export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-[11px]';
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

// ---- Circular Flag Icon (CSS-based, no emoji dependency) ----
const flagStyles: Record<string, string> = {
  uz: 'linear-gradient(to bottom, #0099b5 33%, #fff 33%, #fff 66%, #1eb53a 66%)',
  ru: 'linear-gradient(to bottom, #fff 33%, #0039a6 33%, #0039a6 66%, #d52b1e 66%)',
  en: 'linear-gradient(to bottom, #012169 40%, #fff 40%, #fff 60%, #c8102e 60%), linear-gradient(to right, #c8102e 40%, #fff 40%, #fff 60%, #012169 60%)',
};
export function FlagIcon({ code, size = 'md' }: { code: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  return (
    <span
      className={`${s} rounded-full shrink-0 ring-1 ring-black/10 overflow-hidden inline-block`}
      style={{ background: flagStyles[code] ?? flagStyles.en }}
      aria-label={code}
    />
  );
}

export { ChevronDown, Check };
