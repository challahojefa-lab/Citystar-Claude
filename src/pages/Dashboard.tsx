import { useCallback, useState } from 'react';
import { demoSummary } from '../data/demoData';
import { useLanguage } from '../i18n/LanguageContext';
import type { Translations } from '../i18n/translations';
import { formatRupees } from '../utils/formatCurrency';
import type { IconName } from '../components/Icons';
import { LanguageSelector } from '../components/LanguageSelector';
import { NavCard } from '../components/NavCard';
import { NotReadyDialog } from '../components/NotReadyDialog';
import { SummaryCard } from '../components/SummaryCard';

type MenuKey = keyof Pick<
  Translations['menu'],
  'sales' | 'purchase' | 'inventory' | 'customers' | 'reports'
>;

const MENU_ITEMS: ReadonlyArray<{ key: MenuKey; icon: IconName; accent: string }> = [
  { key: 'sales', icon: 'sales', accent: '#1e8e3e' },
  { key: 'purchase', icon: 'purchase', accent: '#d97706' },
  { key: 'inventory', icon: 'inventory', accent: '#0f4c81' },
  { key: 'customers', icon: 'customers', accent: '#7c3aed' },
  { key: 'reports', icon: 'reports', accent: '#c2410c' },
];

interface DashboardProps {
  onOpenInventory: () => void;
  onOpenSales: () => void;
}

export function Dashboard({ onOpenInventory, onOpenSales }: DashboardProps) {
  const { t } = useLanguage();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const closeDialog = useCallback(() => setOpenSection(null), []);

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <h1 className="app-name">{t.app.name}</h1>
            <p className="app-tagline">{t.app.tagline}</p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="content">
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="section-title">
            {t.summary.title}
          </h2>
          <p className="demo-banner">{t.summary.demoNotice}</p>
          <div className="summary-grid">
            <SummaryCard
              label={t.summary.todaySales}
              value={formatRupees(demoSummary.todaySales)}
              accent="#1e8e3e"
            />
            <SummaryCard
              label={t.summary.toReceive}
              value={formatRupees(demoSummary.toReceive)}
              accent="#0f4c81"
            />
            <SummaryCard
              label={t.summary.toPay}
              value={formatRupees(demoSummary.toPay)}
              accent="#c2410c"
            />
          </div>
        </section>

        <section aria-labelledby="menu-heading">
          <h2 id="menu-heading" className="section-title">
            {t.menu.title}
          </h2>
          <div className="nav-grid">
            {MENU_ITEMS.map((item) => {
              const isReady = item.key === 'inventory' || item.key === 'sales';
              const openReady = item.key === 'sales' ? onOpenSales : onOpenInventory;
              return (
                <NavCard
                  key={item.key}
                  icon={item.icon}
                  title={t.menu[item.key].title}
                  description={t.menu[item.key].description}
                  badge={isReady ? undefined : t.notReady.badge}
                  accent={item.accent}
                  onClick={() =>
                    isReady
                      ? openReady()
                      : setOpenSection(t.menu[item.key].title)
                  }
                />
              );
            })}
          </div>
        </section>
      </main>

      <NotReadyDialog sectionName={openSection} onClose={closeDialog} />
    </div>
  );
}
