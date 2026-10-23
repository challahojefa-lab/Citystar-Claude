import { useCallback, useState } from 'react';
import { useDashboardSummary } from '../features/dashboard/useDashboardSummary';
import type { CardValue } from '../features/dashboard/useDashboardSummary';
import { useLanguage } from '../i18n/LanguageContext';
import type { Translations } from '../i18n/translations';
import { formatQuantity, formatRupeesExact } from '../utils/formatCurrency';
import type { IconName } from '../components/Icons';
import { LanguageSelector } from '../components/LanguageSelector';
import { BackupCard } from '../features/backup/BackupCard';
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
  onOpenPurchase: () => void;
  onOpenCustomers: () => void;
  onOpenReports: () => void;
}

export function Dashboard({
  onOpenInventory,
  onOpenSales,
  onOpenPurchase,
  onOpenCustomers,
  onOpenReports,
}: DashboardProps) {
  const { t } = useLanguage();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const summary = useDashboardSummary();
  const show = (v: CardValue, format: (n: number) => string): string =>
    v.state === 'ready' ? format(v.value) : v.state === 'loading' ? t.summary.loading : t.summary.unavailable;
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
          <div className="summary-grid">
            <SummaryCard
              label={t.summary.todaySales}
              value={show(summary.todaySales, formatRupeesExact)}
              accent="#1e8e3e"
            />
            <SummaryCard
              label={t.summary.todayPurchases}
              value={show(summary.todayPurchases, formatRupeesExact)}
              accent="#d97706"
            />
            <SummaryCard
              label={t.summary.products}
              value={show(summary.products, formatQuantity)}
              accent="#0f4c81"
            />
            <SummaryCard
              label={t.summary.toReceive}
              value={show(summary.toReceive, formatRupeesExact)}
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
              const readyActions: Partial<Record<MenuKey, () => void>> = {
                inventory: onOpenInventory,
                sales: onOpenSales,
                purchase: onOpenPurchase,
                customers: onOpenCustomers,
                reports: onOpenReports,
              };
              const openReady = readyActions[item.key];
              const isReady = openReady !== undefined;
              return (
                <NavCard
                  key={item.key}
                  icon={item.icon}
                  title={t.menu[item.key].title}
                  description={t.menu[item.key].description}
                  badge={isReady ? undefined : t.notReady.badge}
                  accent={item.accent}
                  onClick={() =>
                    openReady
                      ? openReady()
                      : setOpenSection(t.menu[item.key].title)
                  }
                />
              );
            })}
          </div>
        </section>

        <BackupCard />
      </main>

      <NotReadyDialog sectionName={openSection} onClose={closeDialog} />
    </div>
  );
}
