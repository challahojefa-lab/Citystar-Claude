import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { useProducts } from '../features/inventory/useProducts';
import { NewPurchaseForm } from '../features/purchases/NewPurchaseForm';
import { useRecentPurchases } from '../features/purchases/useRecentPurchases';
import { formatRupeesExact } from '../utils/formatCurrency';

interface PurchasePageProps {
  /** Returns to the dashboard. */
  onBack: () => void;
}

export function PurchasePage({ onBack }: PurchasePageProps) {
  const { t, language } = useLanguage();
  const text = t.purchases;
  const { products, stock, status, reload, refresh } = useProducts();
  const { purchases, refresh: refreshPurchases } = useRecentPurchases();

  const [creating, setCreating] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [creating]);

  const closeForm = useCallback(() => setCreating(false), []);

  const handleSaved = useCallback(
    async (purchase: { totalAmount: number }) => {
      // Reload products (prices) and stock so Inventory and Sales see the new values.
      await Promise.all([refresh(), refreshPurchases()]);
      setSavedTotal(purchase.totalAmount);
      setCreating(false);
    },
    [refresh, refreshPurchases],
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
          <NewPurchaseForm
            products={products}
            stock={stock}
            onSaved={handleSaved}
            onCancel={closeForm}
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
              + {text.newPurchase}
            </button>

            <section aria-labelledby="recent-purchases-heading">
              <h2 className="section-title" id="recent-purchases-heading">
                {text.recentTitle}
              </h2>
              {purchases.length === 0 ? (
                <p className="empty-state">{text.noPurchases}</p>
              ) : (
                <ul className="sale-list">
                  {purchases.map((purchase) => (
                    <li className="sale-row purchase-row" key={purchase.id}>
                      <div>
                        <p className="sale-customer">
                          {purchase.supplierName || text.noSupplier}
                        </p>
                        <p className="field-hint">
                          {formatTime(purchase.createdAt)} ·{' '}
                          {text.itemsCount.replace('{count}', String(purchase.itemCount))}
                        </p>
                      </div>
                      <strong className="sale-amount">
                        {formatRupeesExact(purchase.totalAmount)}
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
