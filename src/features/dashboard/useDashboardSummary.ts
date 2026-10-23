import { useEffect, useState } from 'react';
import { getDailyReport, initDatabase, listProducts, todayLocal } from '../../db';

/** One card's value: still loading, a real number, or could not be calculated. */
export type CardValue = { state: 'loading' } | { state: 'ready'; value: number } | { state: 'unavailable' };

export interface DashboardSummary {
  todaySales: CardValue;
  todayPurchases: CardValue;
  products: CardValue;
  toReceive: CardValue;
}

const LOADING: CardValue = { state: 'loading' };
const UNAVAILABLE: CardValue = { state: 'unavailable' };
const ready = (value: number): CardValue => ({ state: 'ready', value });

/**
 * Real figures for the dashboard cards, read-only.
 * Sales, purchases and money to receive come from the same report used by the Reports page
 * (payments are not sales; only customer-linked credit sales count toward balances).
 * If a source fails, only its cards show "not available" - nothing is guessed.
 */
export function useDashboardSummary(): DashboardSummary {
  const [summary, setSummary] = useState<DashboardSummary>({
    todaySales: LOADING,
    todayPurchases: LOADING,
    products: LOADING,
    toReceive: LOADING,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let dbReady = true;
      try {
        await initDatabase();
      } catch (error) {
        console.error('Dashboard: database not ready', error);
        dbReady = false;
      }
      const [report, products] = dbReady
        ? await Promise.allSettled([getDailyReport(todayLocal()), listProducts()])
        : [
            { status: 'rejected', reason: 'db' } as PromiseRejectedResult,
            { status: 'rejected', reason: 'db' } as PromiseRejectedResult,
          ];
      if (cancelled) return;
      if (report.status === 'rejected') console.error('Dashboard: report failed', report.reason);
      if (products.status === 'rejected') console.error('Dashboard: products failed', products.reason);
      const r = report.status === 'fulfilled' ? report.value : null;
      setSummary({
        todaySales: r ? ready(r.totalSales) : UNAVAILABLE,
        todayPurchases: r ? ready(r.totalPurchases) : UNAVAILABLE,
        toReceive: r ? ready(r.outstanding.total) : UNAVAILABLE,
        products: products.status === 'fulfilled' ? ready(products.value.length) : UNAVAILABLE,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return summary;
}
