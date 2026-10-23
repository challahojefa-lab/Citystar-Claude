import { useEffect, useState } from 'react';
import { getCustomerDetail } from '../../db';
import type { CustomerDetail } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatRupeesExact } from '../../utils/formatCurrency';
import { formatPaidOn } from './customerHelpers';

interface CustomerDetailViewProps {
  customerId: string;
  /** Changes when something was saved, so the numbers are loaded again. */
  version: number;
  onSummaryLoaded: (detail: CustomerDetail) => void;
  onRecordPayment: (detail: CustomerDetail) => void;
}

/** One customer: totals, a Record Payment button, credit sales and payment history. */
export function CustomerDetailView({
  customerId,
  version,
  onSummaryLoaded,
  onRecordPayment,
}: CustomerDetailViewProps) {
  const { t, language } = useLanguage();
  const text = t.customers;
  const locale = language === 'gu' ? 'gu-IN' : 'en-IN';
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCustomerDetail(customerId)
      .then((loaded) => {
        if (cancelled) return;
        setDetail(loaded);
        setFailed(false);
        onSummaryLoaded(loaded);
      })
      .catch((error) => {
        console.error('Could not load customer', error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // onSummaryLoaded is intentionally left out: it only reports the loaded data upward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, version]);

  if (failed) {
    return (
      <p className="error-box" role="alert">
        {text.errors.loadFailed}
      </p>
    );
  }
  if (!detail) return <p className="status-text">{text.loading}</p>;

  const { summary, creditSales, payments } = detail;
  const { customer } = summary;

  return (
    <div className="stack">
      <section className="form-card">
        <h2 className="product-name">{customer.name}</h2>
        {(customer.phone || customer.notes) && (
          <p className="product-meta">
            {customer.phone && (
              <span>
                {text.detail.phone}: <strong>{customer.phone}</strong>
              </span>
            )}
            {customer.notes && (
              <span>
                {text.detail.notes}: <strong>{customer.notes}</strong>
              </span>
            )}
          </p>
        )}

        <dl className="value-grid">
          <div className="value-box">
            <dt>{text.card.credit}</dt>
            <dd>{formatRupeesExact(summary.totalCredit)}</dd>
          </div>
          <div className="value-box">
            <dt>{text.card.paid}</dt>
            <dd>{formatRupeesExact(summary.totalPaid)}</dd>
          </div>
          <div className={`value-box wide ${summary.outstanding > 0 ? 'due' : ''}`}>
            <dt>{text.card.balance}</dt>
            <dd>{formatRupeesExact(summary.outstanding)}</dd>
          </div>
        </dl>

        {summary.outstanding > 0 ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => onRecordPayment(detail)}
          >
            {text.detail.recordPayment}
          </button>
        ) : (
          <p className="field-hint">{text.detail.noBalance}</p>
        )}
      </section>

      <section aria-labelledby="credit-sales-heading">
        <h2 className="section-title" id="credit-sales-heading">
          {text.detail.creditSalesTitle}
        </h2>
        {creditSales.length === 0 ? (
          <p className="empty-state">{text.detail.noCreditSales}</p>
        ) : (
          <ul className="sale-list">
            {creditSales.map((sale) => (
              <li className="sale-row credit-row" key={sale.id}>
                <div>
                  <p className="sale-customer">
                    <span className="credit-tag">{text.detail.creditTag}</span>
                  </p>
                  <p className="field-hint">
                    {new Date(sale.createdAt).toLocaleString(locale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}{' '}
                    · {text.detail.itemsCount.replace('{count}', String(sale.itemCount))}
                  </p>
                </div>
                <strong className="sale-amount credit-amount">
                  {formatRupeesExact(sale.totalAmount)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="payments-heading">
        <h2 className="section-title" id="payments-heading">
          {text.detail.paymentsTitle}
        </h2>
        {payments.length === 0 ? (
          <p className="empty-state">{text.detail.noPayments}</p>
        ) : (
          <ul className="sale-list">
            {payments.map((payment) => (
              <li className="sale-row" key={payment.id}>
                <div>
                  <p className="sale-customer">{formatPaidOn(payment.paidOn, locale)}</p>
                  {payment.notes && <p className="field-hint">{payment.notes}</p>}
                </div>
                <strong className="sale-amount">{formatRupeesExact(payment.amount)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
