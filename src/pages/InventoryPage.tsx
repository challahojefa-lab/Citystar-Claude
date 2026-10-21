import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product } from '../db';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { ProductCard } from '../features/inventory/ProductCard';
import { ProductForm } from '../features/inventory/ProductForm';
import { StockForm } from '../features/inventory/StockForm';
import { filterProducts } from '../features/inventory/productHelpers';
import { useProducts } from '../features/inventory/useProducts';

interface InventoryPageProps {
  /** Returns to the dashboard. */
  onBack: () => void;
}

/**
 * The product list, the add/edit form (product = null means "add"), or the
 * stock quantity form for one product.
 */
type Mode =
  | { kind: 'list' }
  | { kind: 'form'; product: Product | null }
  | { kind: 'stock'; product: Product };

export function InventoryPage({ onBack }: InventoryPageProps) {
  const { t } = useLanguage();
  const text = t.inventory;
  const { products, stock, status, reload, refresh } = useProducts();

  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<'saved' | 'stockSaved' | null>(null);

  // Always start a new view at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode.kind]);

  // The "Product saved" message disappears by itself.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleProducts = useMemo(
    () => filterProducts(products, query),
    [products, query],
  );

  const closeForm = useCallback(() => setMode({ kind: 'list' }), []);

  const handleSaved = useCallback(
    async (kind: 'saved' | 'stockSaved') => {
      await refresh();
      setMode({ kind: 'list' });
      setNotice(kind);
    },
    [refresh],
  );

  if (mode.kind === 'stock') {
    return (
      <div className="page">
        <PageHeader
          title={text.stock.formTitle}
          backLabel={text.back}
          onBack={closeForm}
        />
        <main className="content">
          <StockForm
            product={mode.product}
            currentQuantity={stock.get(mode.product.id)}
            onSaved={() => void handleSaved('stockSaved')}
            onCancel={closeForm}
          />
        </main>
      </div>
    );
  }

  if (mode.kind === 'form') {
    return (
      <div className="page">
        <PageHeader
          title={mode.product ? text.form.editTitle : text.form.addTitle}
          backLabel={text.back}
          onBack={closeForm}
        />
        <main className="content">
          <ProductForm
            product={mode.product}
            products={products}
            onSaved={() => void handleSaved('saved')}
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
        {notice && (
          <p className="notice" role="status">
            {notice === 'stockSaved' ? text.stock.saved : text.saved}
          </p>
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
              onClick={() => setMode({ kind: 'form', product: null })}
            >
              + {text.addProduct}
            </button>

            {products.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">{text.empty.title}</p>
                <p className="empty-message">{text.empty.message}</p>
              </div>
            ) : (
              <>
                <div className="field">
                  <label className="field-label" htmlFor="product-search">
                    {text.searchLabel}
                  </label>
                  <input
                    id="product-search"
                    className="text-input"
                    type="search"
                    value={query}
                    placeholder={text.searchPlaceholder}
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                <p className="count-text">
                  {text.count.replace('{count}', String(visibleProducts.length))}
                </p>

                {visibleProducts.length === 0 ? (
                  <p className="empty-state">
                    {text.noResults.replace('{query}', query.trim())}
                  </p>
                ) : (
                  <div className="product-grid">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        stockQuantity={stock.get(product.id)}
                        onEdit={() => setMode({ kind: 'form', product })}
                        onEditStock={() => setMode({ kind: 'stock', product })}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
