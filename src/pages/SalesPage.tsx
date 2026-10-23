import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { useCustomers } from '../features/customers/useCustomers';
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
  const { summaries: customers, refresh: refreshCustomers } = useCustomers();

  const [creating, setCreating] = useState(false);
  const [saved, setSaved] = useState<{ total: number; creditTo: string | null } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [creating]);

  const closeForm = useCallback(() => setCreating(false), []);

  const handleSaved = useCallback(
    async (sale: { totalAmount: number; customerName: string; isCredit?: boolean }) => {
      // Reload stock, the recent list and customer balances for the next sale.
      await Promise.all([refresh(), refreshSales(), refreshCustomers()]);
      setSaved({ total: sale.totalAmount, creditTo: sale.isCredit ? sale.customerName : null });
      setCreating(false);
    },
    [refresh, refreshSales, refreshCustomers],
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
            customers={customers}
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
        {saved !== null && (
          <div className="notice" role="status">
            <p>
              {saved.creditTo !== null
                ? text.savedCredit
                    .replace('{total}', formatRupeesExact(saved.total))
                    .replace('{name}', saved.creditTo)
                : text.saved.replace('{total}', formatRupeesExact(saved.total))}
            </p>
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
                setSaved(null);
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
                    <li
                      className={`sale-row ${sale.isCredit ? 'credit-row' : ''}`}
                      key={sale.id}
                    >
                      <div>
                        <p className="sale-customer">
                          {sale.customerName || text.walkIn}{' '}
                          {sale.isCredit && <span className="credit-tag">{text.creditBadge}</span>}
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
