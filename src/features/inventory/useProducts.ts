import { useCallback, useEffect, useState } from 'react';
import { getStockQuantities, initDatabase, listProducts } from '../../db';
import type { Product } from '../../db';

export type LoadStatus = 'loading' | 'ready' | 'error';

/** Loads products and their (separately stored) stock quantities. */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Map<string, number>>(() => new Map());
  const [status, setStatus] = useState<LoadStatus>('loading');

  const load = useCallback(async (showLoading: boolean) => {
    if (showLoading) setStatus('loading');
    try {
      await initDatabase();
      const [loadedProducts, loadedStock] = await Promise.all([
        listProducts(),
        getStockQuantities(),
      ]);
      setProducts(loadedProducts);
      setStock(loadedStock);
      setStatus('ready');
    } catch (error) {
      console.error('Could not load products', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  /** Shows the loading text again (used by the "Try again" button). */
  const reload = useCallback(() => load(true), [load]);
  /** Reloads quietly in the background (used after saving). */
  const refresh = useCallback(() => load(false), [load]);

  return { products, stock, status, reload, refresh };
}
