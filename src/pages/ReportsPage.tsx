import { useMemo, useState } from 'react';
import { todayLocal } from '../db';
import type { DailyReport } from '../db';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../i18n/LanguageContext';
import { formatPaidOn } from '../features/customers/customerHelpers';
import { useDailyReport } from '../features/reports/useDailyReport';
import { formatRupeesExact } from '../utils/formatCurrency';

interface ReportsPageProps {
  /** Returns to the dashboard. */
  onBack: () => void;
}

const MAX_NAMES_SHOWN = 5;

export function ReportsPage({ onBack }: ReportsPageProps) {
  const { t, language } = useLanguage();
  const text = t.reports;
  const locale = language === 'gu' ? 'gu-IN' : 'en-IN';
  const today = useMemo(() => todayLocal(), []);
  const [date, setDate] = useState(today);
  const { report, status, reload } = useDailyReport(date);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, { timeStyle: 'short' });

  return (
    <div className="page">
      <PageHeader title={text.title} backLabel={text.back} onBack={onBack} />

      <main className="content">
        <section className="form-card" aria-label={text.dateLabel}>
          <div className="field">
            <label className="field-label" htmlFor="report-date">
              {text.dateLabel}
            </label>
            <input
              id="report-date"
              className="text-input"
              type="date"
              max={today}
              value={date}
              onChange={(event) => {
                // An empty box (date cleared) keeps the current report on screen.
                if (event.target.value) setDate(event.target.value);
              }}
            />
          </div>
          {date !== today && (
            <button type="button" className="secondary-button" onClick={() => setDate(today)}>
              {text.todayButton}
            </button>
          )}
        </section>

        <h2 className="section-title">{text.heading.replace('{date}', formatPaidOn(date, locale))}</h2>

        {status === 'loading' && !report && <p className="status-text">{text.loading}</p>}

        {status === 'error' && (
          <div className="error-box" role="alert">
            <p>{text.errors.loadFailed}</p>
            <button type="button" className="secondary-button" onClick={reload}>
              {text.retry}
            </button>
          </div>
        )}

        {report && report.date === date && (
          <ReportBody report={report} locale={locale} formatTime={formatTime} />
        )}
      </main>
    </div>
  );
}

export function ReportBody({
  report,
  locale: _locale,
  formatTime,
}: {
  report: DailyReport;
  locale: string;
  formatTime: (iso: string) => string;
}) {
  const { t } = useLanguage();
  const text = t.reports;
  const money = formatRupeesExact;
  const { profit } = report;

  const shownNames = profit.missingProductNames.slice(0, MAX_NAMES_SHOWN).join(', ');
  const extra = profit.missingProductNames.length - MAX_NAMES_SHOWN;
  const missingNames =
    extra > 0 ? `${shownNames} ${text.profit.andMore.replace('{count}', String(extra))}` : shownNames;

  return (
    <div className="stack">
      <div className="report-grid">
        <div className="report-card" style={{ ['--accent' as string]: '#1e8e3e' }}>
          <span className="summary-label">{text.figures.totalSales}</span>
          <span className="report-value">{money(report.totalSales)}</span>
          <span className="report-sub">
            {text.figures.salesCount.replace('{count}', String(report.salesCount))}
          </span>
        </div>

        <div className="report-card" style={{ ['--accent' as string]: '#0f4c81' }}>
          <span className="summary-label">{text.figures.cashSales}</span>
          <span className="report-value">{money(report.cashSales)}</span>
          <span className="report-sub">{text.figures.cashHint}</span>
        </div>

        <div className="report-card" style={{ ['--accent' as string]: '#d97706' }}>
          <span className="summary-label">{text.figures.creditSales}</span>
          <span className="report-value">{money(report.creditSales)}</span>
          <span className="report-sub">{text.figures.creditHint}</span>
        </div>

        <div className="report-card" style={{ ['--accent' as string]: '#c2410c' }}>
          <span className="summary-label">{text.figures.totalPurchases}</span>
          <span className="report-value">{money(report.totalPurchases)}</span>
          <span className="report-sub">
            {text.figures.purchasesCount.replace('{count}', String(report.purchasesCount))}
          </span>
        </div>

        <div className="report-card" style={{ ['--accent' as string]: '#7c3aed' }}>
          <span className="summary-label">{text.figures.payments}</span>
          <span className="report-value">{money(report.paymentsTotal)}</span>
          <span className="report-sub">
            {text.figures.paymentsCount.replace('{count}', String(report.paymentsCount))}
            {' · '}
            {text.figures.paymentsHint}
          </span>
        </div>
      </div>

      <section className="form-card" aria-labelledby="profit-heading">
        <h2 className="section-title" id="profit-heading">
          {text.profit.title}
        </h2>

        {profit.status === 'none' && <p className="field-hint">{text.profit.noSales}</p>}

        {profit.status === 'unavailable' && (
          <div className="warn-box" role="status">
            <p className="warn-title">{text.profit.unavailableTitle}</p>
            <p>{text.profit.unavailableText}</p>
            <p>{text.profit.missingItems.replace('{names}', missingNames)}</p>
          </div>
        )}

        {(profit.status === 'complete' || profit.status === 'incomplete') && (
          <>
            <p className="report-value profit-value">{money(profit.profit)}</p>
            {profit.status === 'complete' ? (
              <p className="field-hint">{text.profit.completeNote}</p>
            ) : (
              <div className="warn-box" role="status">
                <p className="warn-title">{text.profit.incompleteTitle}</p>
                <p>{text.profit.knownLabel}</p>
                <p>
                  {text.profit.incompleteText
                    .replace('{count}', String(profit.missingProductCount))
                    .replace('{amount}', money(profit.uncostedSalesValue))}
                </p>
                <p>{text.profit.missingItems.replace('{names}', missingNames)}</p>
              </div>
            )}
          </>
        )}
        <p className="field-hint">{text.profit.estimateNote}</p>
      </section>

      <section className="form-card" aria-labelledby="owed-heading">
        <h2 className="section-title" id="owed-heading">
          {text.owed.title}
        </h2>
        <p className="report-value due-value">{money(report.outstanding.total)}</p>
        <p className="field-hint">
          {report.outstanding.customersWithBalance === 0
            ? text.owed.none
            : text.owed.customers.replace('{count}', String(report.outstanding.customersWithBalance))}
        </p>
        <p className="field-hint">{text.owed.nowNote}</p>
      </section>

      <section aria-labelledby="day-sales-heading">
        <h2 className="section-title" id="day-sales-heading">
          {text.lists.salesTitle}
        </h2>
        {report.sales.length === 0 ? (
          <p className="empty-state">{text.lists.noSales}</p>
        ) : (
          <ul className="sale-list">
            {report.sales.map((sale) => {
              const credit = sale.customerId !== undefined && sale.isCredit === true;
              return (
                <li className={`sale-row ${credit ? 'credit-row' : ''}`} key={sale.id}>
                  <div>
                    <p className="sale-customer">
                      {sale.customerName || text.lists.walkIn}{' '}
                      {credit && <span className="credit-tag">{text.lists.creditTag}</span>}
                    </p>
                    <p className="field-hint">
                      {formatTime(sale.createdAt)} ·{' '}
                      {text.lists.itemsCount.replace('{count}', String(sale.itemCount))}
                    </p>
                  </div>
                  <strong className="sale-amount">{money(sale.totalAmount)}</strong>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="day-purchases-heading">
        <h2 className="section-title" id="day-purchases-heading">
          {text.lists.purchasesTitle}
        </h2>
        {report.purchases.length === 0 ? (
          <p className="empty-state">{text.lists.noPurchases}</p>
        ) : (
          <ul className="sale-list">
            {report.purchases.map((purchase) => (
              <li className="sale-row purchase-row" key={purchase.id}>
                <div>
                  <p className="sale-customer">
                    {purchase.supplierName || text.lists.noSupplier}
                  </p>
                  <p className="field-hint">
                    {formatTime(purchase.createdAt)} ·{' '}
                    {text.lists.itemsCount.replace('{count}', String(purchase.itemCount))}
                  </p>
                </div>
                <strong className="sale-amount">{money(purchase.totalAmount)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="form-card" aria-labelledby="about-heading">
        <h2 className="section-title" id="about-heading">
          {text.about.title}
        </h2>
        <ul className="about-list">
          <li>{text.about.cash}</li>
          <li>{text.about.payments}</li>
          <li>{text.about.profit}</li>
          <li>{text.about.notAccounting}</li>
        </ul>
      </section>
    </div>
  );
}
