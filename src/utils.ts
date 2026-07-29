// Formatting & small helpers used across modules.

export type CurrencyLang = 'uz' | 'ru' | 'en';

export const UZS = (n: number, lang: CurrencyLang = 'uz'): string => {
  const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
  const suffix = lang === 'uz' ? " so'm" : lang === 'ru' ? ' сум' : ' UZS';
  return num + suffix;
};

export const UZS_SHORT = (n: number): string => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
};

export const USD = (n: number): string =>
  '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

export const pct = (n: number): string => `${n.toFixed(1)}%`;

const DOW_BY_LANG: Record<CurrencyLang, string[]> = {
  uz: ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Shan'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const MONTH_BY_LANG: Record<CurrencyLang, string[]> = {
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export const formatDate = (offset: number, lang: CurrencyLang = 'uz'): { day: number; dow: string; month: string } => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return {
    day: d.getDate(),
    dow: DOW_BY_LANG[lang][d.getDay()],
    month: MONTH_BY_LANG[lang][d.getMonth()],
  };
};

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const addDaysISO = (iso: string, days: number): string => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const nightsBetween = (start: string, end: string): number => {
  const a = new Date(start + 'T00:00:00').getTime();
  const b = new Date(end + 'T00:00:00').getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
};

export const prettyDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

export interface DateRangeLike {
  id?: string;
  roomId: string;
  startOffset: number;
  nights: number;
}

export const hasDateConflict = (
  bookings: DateRangeLike[],
  roomId: string,
  startOffset: number,
  nights: number,
  excludeId?: string,
): boolean => {
  if (!roomId || nights <= 0) return false;
  const newEnd = startOffset + nights;
  return bookings.some((b) => {
    if (excludeId && b.id === excludeId) return false;
    if (b.roomId !== roomId) return false;
    const existingEnd = b.startOffset + b.nights;
    return startOffset < existingEnd && b.startOffset < newEnd;
  });
};

export const exceedsCapacity = (
  adults: number,
  children: number,
  maxAdults: number,
  maxChildren: number,
): boolean =>
  adults > maxAdults || children > maxChildren;

export const exceedsBase = (
  adults: number,
  children: number,
  baseAdults: number,
  baseKids: number,
): boolean =>
  adults > baseAdults || children > baseKids;
