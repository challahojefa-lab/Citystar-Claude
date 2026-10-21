import { useCallback, useEffect, useState } from 'react';
import { initDatabase, listRecentSales } from '../../db';
import type { Sale } from '../../db';

/** The latest saved sales, newest first. Failure is non-fatal for the screen. */
export function useRecentSales(limit = 10) {
  const [sales, setSales] = useState<Sale[]>([]);

  const refresh = useCallback(async () => {
    try {
      await initDatabase();
      setSales(await listRecentSales(limit));
    } catch (error) {
      console.error('Could not load recent sales', error);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { sales, refresh };
}
