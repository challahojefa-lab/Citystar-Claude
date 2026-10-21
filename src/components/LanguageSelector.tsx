import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-selector" role="group" aria-label={t.language.label}>
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          className="language-button"
          aria-pressed={language === item.code}
          onClick={() => setLanguage(item.code)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
