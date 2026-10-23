import { useCallback, useEffect, useState } from 'react';
import { initDatabase, listCustomerSummaries } from '../../db';
import type { CustomerSummary } from '../../db';

export type LoadStatus = 'loading' | 'ready' | 'error';

/** Customers with their credit / payment / balance totals, sorted by name. */
export function useCustomers() {
  const [summaries, setSummaries] = useState<CustomerSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const load = useCallback(async (showLoading: boolean) => {
    if (showLoading) setStatus('loading');
    try {
      await initDatabase();
      setSummaries(await listCustomerSummaries());
      setStatus('ready');
    } catch (error) {
      console.error('Could not load customers', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const reload = useCallback(() => load(true), [load]);
  const refresh = useCallback(() => load(false), [load]);

  return { summaries, status, reload, refresh };
}
