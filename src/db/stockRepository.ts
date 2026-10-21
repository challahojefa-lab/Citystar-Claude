import { db } from './database';
import { newId, nowIso } from './ids';
import { ProductNotFoundError } from './productRepository';
import { roundQuantity } from './saleRepository';
import { WHOLE_NUMBER_UNITS, type StockLevel } from './types';

/**
 * Returns productId -> current quantity for every product that has a stock row.
 * Products with no row have no recorded stock (the Sales screen treats that as
 * "nothing to sell"). Stock changes in exactly two places: createSale
 * (saleRepository.ts) reduces it, and setStockQuantity (below) sets it.
 */
export async function getStockQuantities(): Promise<Map<string, number>> {
  const rows = await db.stockLevels.toArray();
  return new Map(rows.map((row) => [row.productId, row.quantity]));
}

export type StockErrorCode = 'invalidQuantity' | 'notWholeNumber';

/** Thrown when a stock quantity is not allowed. Nothing is changed when this happens. */
export class StockError extends Error {
  readonly code: StockErrorCode;

  constructor(code: StockErrorCode) {
    super(`Stock rejected: ${code}`);
    this.name = 'StockError';
    this.code = code;
  }
}

/**
 * Sets the current stock of a product to exactly `quantity` (0 is allowed).
 * Creates the stock row the first time, otherwise updates it. Either way the row
 * becomes 'pending' with a new updatedAt. Product details and prices are never
 * touched. The rules are enforced here, not only on screen:
 * - the product must exist,
 * - quantity must be a number of 0 or more (never negative),
 * - piece / box / pair / set must be whole numbers.
 * Runs in one transaction, so it cannot interleave with a sale being saved.
 */
export function setStockQuantity(productId: string, quantity: number): Promise<StockLevel> {
  return db.transaction('rw', [db.products, db.stockLevels], async () => {
    const product = await db.products.get(productId);
    if (!product) throw new ProductNotFoundError();

    if (!Number.isFinite(quantity) || quantity < 0) throw new StockError('invalidQuantity');
    const rounded = roundQuantity(quantity);
    if (WHOLE_NUMBER_UNITS.includes(product.unit) && !Number.isInteger(rounded)) {
      throw new StockError('notWholeNumber');
    }

    const now = nowIso();
    const existing = await db.stockLevels.where('productId').equals(productId).first();
    if (existing) {
      const updated: StockLevel = {
        ...existing,
        quantity: rounded,
        updatedAt: now,
        syncStatus: 'pending',
      };
      await db.stockLevels.put(updated);
      return updated;
    }

    const created: StockLevel = {
      id: newId(),
      productId,
      quantity: rounded,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };
    await db.stockLevels.add(created);
    return created;
  });
}
