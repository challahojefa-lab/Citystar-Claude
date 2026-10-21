import { ProductNotFoundError } from '../../db/productRepository';
import { StockError } from '../../db/stockRepository';
import type { InventoryErrorKey } from './productHelpers';

/**
 * Turns any thrown error into a translation key for a plain-language message.
 * The technical error itself is only written to the console for the developer.
 */
export function getErrorKey(
  error: unknown,
  fallback: 'saveFailed' | 'loadFailed',
): InventoryErrorKey {
  if (error instanceof ProductNotFoundError) return 'notFound';
  if (error instanceof StockError) {
    return error.code === 'notWholeNumber' ? 'stockQuantityWhole' : 'stockQuantityInvalid';
  }
  if (error instanceof Error && error.name === 'QuotaExceededError') {
    return 'storageFull';
  }
  return fallback;
}
