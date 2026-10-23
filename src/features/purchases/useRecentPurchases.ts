import { useCallback, useEffect, useState } from 'react';
import { initDatabase, listRecentPurchases } from '../../db';
import type { Purchase } from '../../db';

/** The latest saved purchases, newest first. Failure is non-fatal for the screen. */
export function useRecentPurchases(limit = 10) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const refresh = useCallback(async () => {
    try {
      await initDatabase();
      setPurchases(await listRecentPurchases(limit));
    } catch (error) {
      console.error('Could not load recent purchases', error);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { purchases, refresh };
}
