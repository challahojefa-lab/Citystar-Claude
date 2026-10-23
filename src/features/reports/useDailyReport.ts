import { useCallback, useEffect, useState } from 'react';
import { getDailyReport, initDatabase } from '../../db';
import type { DailyReport } from '../../db';

export type LoadStatus = 'loading' | 'ready' | 'error';

/** Loads the report for one date, and again whenever the date changes. */
export function useDailyReport(date: string) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false; // ignore an old answer if the date changed meanwhile
    setStatus('loading');
    (async () => {
      try {
        await initDatabase();
        const loaded = await getDailyReport(date);
        if (cancelled) return;
        setReport(loaded);
        setStatus('ready');
      } catch (error) {
        console.error('Could not load report', error);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { report, status, reload };
}
