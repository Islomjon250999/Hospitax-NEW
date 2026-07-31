import { ChevronDown, Check } from 'lucide-react';
import { useLang, LANGUAGES } from '../i18n';
import { useToast } from '../toast';
import { Dropdown, DropdownLabel, FlagIcon } from './ui';

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const toast = useToast();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <Dropdown
      width="w-52"
      trigger={
        <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-ink-100 transition-colors text-sm font-semibold text-ink-700">
          <FlagIcon code={lang} size="sm" />
          <span className="text-xs font-bold tracking-wide">{current.shortCode}</span>
          <ChevronDown size={13} className="text-ink-400" />
        </button>
      }
    >
      {(close) => (
        <>
          <DropdownLabel>Til / Язык / Language</DropdownLabel>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); close(); toast(l.label, 'info'); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                lang === l.code ? 'bg-cyan-50 text-cyan-700' : 'text-ink-700 hover:bg-ink-100'
              }`}
            >
              <FlagIcon code={l.code} size="sm" />
              <span className="flex-1">{l.label}</span>
              <span className="text-[10px] font-bold text-ink-400 uppercase">{l.shortCode}</span>
              {lang === l.code && <Check size={14} className="text-cyan-600" />}
            </button>
          ))}
        </>
      )}
    </Dropdown>
  );
}
