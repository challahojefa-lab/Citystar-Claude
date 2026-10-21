import { WHOLE_NUMBER_UNITS, type ProductUnit } from '../../db/types';
import { toAsciiDigits } from './productHelpers';

export type StockParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'invalid' | 'whole' };

/**
 * Reads the stock quantity the shopkeeper typed. Accepts 0 or more with up to
 * 3 decimals (0, 25, 2.5). Gujarati digits work. Negative numbers, letters and
 * empty text are rejected, and piece/box/pair/set accept whole numbers only.
 * Empty is NOT treated as 0, so stock is never recorded by accident.
 */
export function parseStockQuantity(text: string, unit: ProductUnit): StockParseResult {
  const cleaned = toAsciiDigits(text).trim();
  if (!/^\d{1,7}(\.\d{1,3})?$/.test(cleaned)) return { ok: false, reason: 'invalid' };
  const value = Number(cleaned);
  if (WHOLE_NUMBER_UNITS.includes(unit) && !Number.isInteger(value)) {
    return { ok: false, reason: 'whole' };
  }
  return { ok: true, value };
}
