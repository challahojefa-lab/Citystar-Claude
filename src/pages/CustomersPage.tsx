import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CustomerDetail } from '../db';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { CustomerDetailView } from '../features/customers/CustomerDetailView';
import { CustomerForm } from '../features/customers/CustomerForm';
import { filterCustomers } from '../features/customers/customerHelpers';
import { PaymentForm } from '../features/customers/PaymentForm';
import { useCustomers } from '../features/customers/useCustomers';
import { formatRupeesExact } from '../utils/formatCurrency';

interface CustomersPageProps {
  /** Returns to the dashboard. */
  onBack: () => void;
}

type Mode =
  | { kind: 'list' }
  | { kind: 'add' }
  | { kind: 'detail'; customerId: string; name: string }
  | { kind: 'payment'; detail: CustomerDetail };

export function CustomersPage({ onBack }: CustomersPageProps) {
  const { t } = useLanguage();
  const text = t.customers;
  const { summaries, status, reload, refresh } = useCustomers();

  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [detailVersion, setDetailVersion] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode.kind]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visible = useMemo(() => filterCustomers(summaries, query), [summaries, query]);
  const toList = useCallback(() => setMode({ kind: 'list' }), []);

  if (mode.kind === 'add') {
    return (
      <div className="page">
        <PageHeader title={text.form.title} backLabel={text.back} onBack={toList} />
        <main className="content">
          <CustomerForm
            onSaved={async () => {
              await refresh();
              setNotice(text.saved);
              setMode({ kind: 'list' });
            }}
            onCancel={toList}
          />
        </main>
      </div>
    );
  }

  if (mode.kind === 'payment') {
    const { summary } = mode.detail;
    return (
      <div className="page">
        <PageHeader
          title={text.payment.title}
          backLabel={text.back}
          onBack={() =>
            setMode({ kind: 'detail', customerId: summary.customer.id, name: summary.customer.name })
          }
        />
        <main className="content">
          <PaymentForm
            summary={summary}
            onSaved={async () => {
              await refresh();
              setDetailVersion((v) => v + 1);
              setNotice(null);
              setMode({ kind: 'detail', customerId: summary.customer.id, name: summary.customer.name });
              setNotice('payment');
            }}
            onCancel={() =>
              setMode({ kind: 'detail', customerId: summary.customer.id, name: summary.customer.name })
            }
          />
        </main>
      </div>
    );
  }

  if (mode.kind === 'detail') {
    const current = summaries.find((s) => s.customer.id === mode.customerId);
    return (
      <div className="page">
        <PageHeader title={mode.name} backLabel={text.back} onBack={toList} />
        <main className="content">
          {notice === 'payment' && current && (
            <p className="notice" role="status">
              {text.paymentSaved.replace('{balance}', formatRupeesExact(current.outstanding))}
            </p>
          )}
          <CustomerDetailView
            customerId={mode.customerId}
            version={detailVersion}
            onSummaryLoaded={() => {}}
            onRecordPayment={(detail) => setMode({ kind: 'payment', detail })}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title={text.title} backLabel={text.back} onBack={onBack} />

      <main className="content">
        {notice && notice !== 'payment' && (
          <p className="notice" role="status">
            {notice}
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
              onClick={() => setMode({ kind: 'add' })}
            >
              + {text.addCustomer}
            </button>

            {summaries.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">{text.empty.title}</p>
                <p className="empty-message">{text.empty.message}</p>
              </div>
            ) : (
              <>
                <div className="field">
                  <label className="field-label" htmlFor="customer-search">
                    {text.searchLabel}
                  </label>
                  <input
                    id="customer-search"
                    className="text-input"
                    type="search"
                    value={query}
                    placeholder={text.searchPlaceholder}
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>

                <p className="count-text">
                  {text.count.replace('{count}', String(visible.length))}
                </p>

                {visible.length === 0 ? (
                  <p className="empty-state">
                    {text.noResults.replace('{query}', query.trim())}
                  </p>
                ) : (
                  <div className="product-grid">
                    {visible.map(({ customer, totalCredit, totalPaid, outstanding }) => (
                      <button
                        type="button"
                        key={customer.id}
                        className="customer-card"
                        aria-label={text.card.openAria.replace('{name}', customer.name)}
                        onClick={() =>
                          setMode({ kind: 'detail', customerId: customer.id, name: customer.name })
                        }
                      >
                        <span className="product-name">{customer.name}</span>
                        {customer.phone && <span className="product-meta">{customer.phone}</span>}
                        <dl className="value-grid">
                          <div className="value-box">
                            <dt>{text.card.credit}</dt>
                            <dd>{formatRupeesExact(totalCredit)}</dd>
                          </div>
                          <div className="value-box">
                            <dt>{text.card.paid}</dt>
                            <dd>{formatRupeesExact(totalPaid)}</dd>
                          </div>
                          <div className={`value-box wide ${outstanding > 0 ? 'due' : ''}`}>
                            <dt>{text.card.balance}</dt>
                            <dd>{formatRupeesExact(outstanding)}</dd>
                          </div>
                        </dl>
                      </button>
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
