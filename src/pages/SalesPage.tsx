import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { useProducts } from '../features/inventory/useProducts';
import { NewSaleForm } from '../features/sales/NewSaleForm';
import { useRecentSales } from '../features/sales/useRecentSales';
import { formatRupeesExact } from '../utils/formatCurrency';

interface SalesPageProps {
  /** Returns to the dashboard. */
  onBack: () => void;
}

export function SalesPage({ onBack }: SalesPageProps) {
  const { t, language } = useLanguage();
  const text = t.sales;
  const { products, stock, status, reload, refresh } = useProducts();
  const { sales, refresh: refreshSales } = useRecentSales();

  const [creating, setCreating] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [creating]);

  const closeForm = useCallback(() => setCreating(false), []);

  const handleSaved = useCallback(
    async (sale: { totalAmount: number }) => {
      // Reload stock and the recent list so the next sale sees the new balances.
      await Promise.all([refresh(), refreshSales()]);
      setSavedTotal(sale.totalAmount);
      setCreating(false);
    },
    [refresh, refreshSales],
  );

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  if (creating) {
    return (
      <div className="page">
        <PageHeader title={text.form.title} backLabel={text.back} onBack={closeForm} />
        <main className="content">
          <NewSaleForm
            products={products}
            stock={stock}
            onSaved={handleSaved}
            onCancel={closeForm}
            onStockOutdated={() => void refresh()}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title={text.title} backLabel={text.back} onBack={onBack} />

      <main className="content">
        {savedTotal !== null && (
          <div className="notice" role="status">
            <p>{text.saved.replace('{total}', formatRupeesExact(savedTotal))}</p>
            <p>{text.savedStockNote}</p>
          </div>
        )}

        {status === 'loading' && <p className="status-text">{text.loading}</p>}

        {status === 'error' && (
          <div className="error-box" role="alert">
            <p>{text.errors.loadFailed}</p>
            <button type="button" className="secondary-button" onClick={reload}>
              {text.retry}
            </button>
          </div>
        )}

        {status === 'ready' && (
          <div className="stack">
            <button
              type="button"
              className="primary-button add-button"
              onClick={() => {
                setSavedTotal(null);
                setCreating(true);
              }}
            >
              + {text.newSale}
            </button>

            <section aria-labelledby="recent-sales-heading">
              <h2 className="section-title" id="recent-sales-heading">
                {text.recentTitle}
              </h2>
              {sales.length === 0 ? (
                <p className="empty-state">{text.noSales}</p>
              ) : (
                <ul className="sale-list">
                  {sales.map((sale) => (
                    <li className="sale-row" key={sale.id}>
                      <div>
                        <p className="sale-customer">
                          {sale.customerName || text.walkIn}
                        </p>
                        <p className="field-hint">
                          {formatTime(sale.createdAt)} ·{' '}
                          {text.itemsCount.replace('{count}', String(sale.itemCount))}
                        </p>
                      </div>
                      <strong className="sale-amount">
                        {formatRupeesExact(sale.totalAmount)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
