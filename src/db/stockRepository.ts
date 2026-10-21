import { db } from './database';

/**
 * Read-only for now. Returns productId -> current quantity for every product
 * that has a stock row. Products with no row have no recorded stock (not zero).
 * Writing stock is intentionally left for the Purchase/Sales features.
 */
export async function getStockQuantities(): Promise<Map<string, number>> {
  const rows = await db.stockLevels.toArray();
  return new Map(rows.map((row) => [row.productId, row.quantity]));
}
