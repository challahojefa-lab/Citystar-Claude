import type { Product, ProductUnit } from '../../db';
import { roundMoney, roundQuantity } from '../../db/saleRepository';
import { toAsciiDigits } from '../inventory/productHelpers';

/** Pure helpers (no React, no database) so they are easy to test. */

export const MAX_CUSTOMER_NAME_LENGTH = 60;

/** Units that can only be sold in whole numbers (you cannot sell 1.5 pieces). */
const WHOLE_NUMBER_UNITS: readonly ProductUnit[] = ['piece', 'box', 'pair', 'set'];

/** One row of the sale being built. The quantity is the text as typed. */
export interface CartLine {
  productId: string;
  quantity: string;
}

export type QuantityParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'invalid' | 'whole' };

/**
 * Accepts a positive number with up to 3 decimals (250, 2.5, 0.250).
 * Gujarati digits work. Whole-number units (piece, box, pair, set) reject decimals.
 */
export function parseQuantity(text: string, unit: ProductUnit): QuantityParseResult {
  const cleaned = toAsciiDigits(text).trim();
  if (!/^\d{1,7}(\.\d{1,3})?$/.test(cleaned)) return { ok: false, reason: 'invalid' };
  const value = Number(cleaned);
  if (!(value > 0)) return { ok: false, reason: 'invalid' };
  if (WHOLE_NUMBER_UNITS.includes(unit) && !Number.isInteger(value)) {
    return { ok: false, reason: 'whole' };
  }
  return { ok: true, value };
}

export type PhoneParseResult = { ok: true; value: string } | { ok: false };

/**
 * Phone is optional. Accepts a 10-digit Indian mobile number (starting 6-9),
 * with an optional +91 / 91 / 0 in front, and spaces or dashes. Stored as the
 * plain 10 digits.
 */
export function normalizePhone(text: string): PhoneParseResult {
  const cleaned = toAsciiDigits(text).replace(/[\s-]/g, '');
  if (cleaned === '') return { ok: true, value: '' };
  const match = /^(?:\+?91|0)?([6-9]\d{9})$/.exec(cleaned);
  return match ? { ok: true, value: match[1] } : { ok: false };
}

export type LineErrorKey =
  | 'quantityInvalid'
  | 'quantityWhole'
  | 'insufficientStock'
  | 'priceMissing'
  | 'productMissing';

export interface LineError {
  key: LineErrorKey;
  /** For insufficientStock: how much can really be sold. */
  available?: number;
}

export type LineErrors = Record<string, LineError>;

export interface LineTotal {
  /** null while the quantity is not a valid number or the product has no price. */
  quantity: number | null;
  lineTotal: number | null;
}

/** Live numbers for one row, used to show the line total while typing. */
export function computeLine(line: CartLine, product: Product | undefined): LineTotal {
  if (!product || product.sellingPrice === null) return { quantity: null, lineTotal: null };
  const parsed = parseQuantity(line.quantity, product.unit);
  if (!parsed.ok) return { quantity: null, lineTotal: null };
  return {
    quantity: parsed.value,
    lineTotal: roundMoney(parsed.value * product.sellingPrice),
  };
}

/** Sum of every row that currently has a valid quantity. */
export function computeGrandTotal(
  cart: readonly CartLine[],
  products: ReadonlyMap<string, Product>,
): number {
  return roundMoney(
    cart.reduce(
      (sum, line) => sum + (computeLine(line, products.get(line.productId)).lineTotal ?? 0),
      0,
    ),
  );
}

export type CartValidation =
  | { ok: true; lines: Array<{ productId: string; quantity: number }> }
  | { ok: false; errors: LineErrors };

/**
 * Checks every row against the product and the stock the screen last loaded.
 * (The database checks again inside the save transaction, so this is only for
 * giving the shopkeeper fast, row-by-row messages.)
 */
export function validateCart(
  cart: readonly CartLine[],
  products: ReadonlyMap<string, Product>,
  stock: ReadonlyMap<string, number>,
): CartValidation {
  const errors: LineErrors = {};
  const lines: Array<{ productId: string; quantity: number }> = [];

  for (const line of cart) {
    const product = products.get(line.productId);
    if (!product) {
      errors[line.productId] = { key: 'productMissing' };
      continue;
    }
    if (product.sellingPrice === null) {
      errors[line.productId] = { key: 'priceMissing' };
      continue;
    }
    const parsed = parseQuantity(line.quantity, product.unit);
    if (!parsed.ok) {
      errors[line.productId] = {
        key: parsed.reason === 'whole' ? 'quantityWhole' : 'quantityInvalid',
      };
      continue;
    }
    const available = stock.get(line.productId) ?? 0;
    if (parsed.value > available) {
      errors[line.productId] = {
        key: 'insufficientStock',
        available: roundQuantity(available),
      };
      continue;
    }
    lines.push({ productId: line.productId, quantity: parsed.value });
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, lines };
}
