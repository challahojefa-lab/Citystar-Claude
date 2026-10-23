import type { Product, ProductUnit } from '../../db';
import { roundMoney } from '../../db/saleRepository';
import { parsePrice } from '../inventory/productHelpers';
import { parseStockQuantity } from '../inventory/stockHelpers';

/** Pure helpers (no React, no database) so they are easy to test. */

export const MAX_SUPPLIER_NAME_LENGTH = 60;

/** One row of the purchase being built. Quantity and price are the text as typed. */
export interface CartLine {
  productId: string;
  quantity: string;
  price: string;
}

export type QuantityParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'invalid' | 'whole' };

/**
 * A purchased quantity must be above 0, with up to 3 decimals. Piece, box, pair
 * and set accept whole numbers only. (Same text rules as stock entry, but 0 is
 * not a valid purchase.)
 */
export function parsePurchaseQuantity(text: string, unit: ProductUnit): QuantityParseResult {
  const result = parseStockQuantity(text, unit);
  if (result.ok && !(result.value > 0)) return { ok: false, reason: 'invalid' };
  return result;
}

export type PriceResult = { ok: true; value: number } | { ok: false };

/** A purchase price is required: 0 or more, up to 2 decimals, never negative. */
export function parsePurchasePrice(text: string): PriceResult {
  const result = parsePrice(text);
  if (!result.ok || result.value === null) return { ok: false };
  return { ok: true, value: result.value };
}

/** The price box starts with the product's usual purchase price (or empty). */
export function defaultPriceText(product: Product): string {
  return product.purchasePrice === null ? '' : String(product.purchasePrice);
}

export type QuantityErrorKey = 'quantityInvalid' | 'quantityWhole';

export interface LineError {
  quantity?: QuantityErrorKey;
  price?: 'priceInvalid';
  product?: 'productMissing';
}

export type LineErrors = Record<string, LineError>;

/** Live line total, or null while the quantity or price is not valid. */
export function computeLineTotal(line: CartLine, product: Product | undefined): number | null {
  if (!product) return null;
  const quantity = parsePurchaseQuantity(line.quantity, product.unit);
  const price = parsePurchasePrice(line.price);
  if (!quantity.ok || !price.ok) return null;
  return roundMoney(quantity.value * price.value);
}

/** Sum of every row that currently has a valid quantity and price. */
export function computeGrandTotal(
  cart: readonly CartLine[],
  products: ReadonlyMap<string, Product>,
): number {
  return roundMoney(
    cart.reduce(
      (sum, line) => sum + (computeLineTotal(line, products.get(line.productId)) ?? 0),
      0,
    ),
  );
}

export type CartValidation =
  | { ok: true; lines: Array<{ productId: string; quantity: number; unitPrice: number }> }
  | { ok: false; errors: LineErrors };

/**
 * Checks every row. (The database checks again inside the save transaction, so
 * this is only for fast, row-by-row messages.)
 */
export function validateCart(
  cart: readonly CartLine[],
  products: ReadonlyMap<string, Product>,
): CartValidation {
  const errors: LineErrors = {};
  const lines: Array<{ productId: string; quantity: number; unitPrice: number }> = [];

  for (const line of cart) {
    const product = products.get(line.productId);
    if (!product) {
      errors[line.productId] = { product: 'productMissing' };
      continue;
    }
    const quantity = parsePurchaseQuantity(line.quantity, product.unit);
    const price = parsePurchasePrice(line.price);
    const error: LineError = {};
    if (!quantity.ok) {
      error.quantity = quantity.reason === 'whole' ? 'quantityWhole' : 'quantityInvalid';
    }
    if (!price.ok) error.price = 'priceInvalid';
    if (error.quantity || error.price) {
      errors[line.productId] = error;
    } else if (quantity.ok && price.ok) {
      lines.push({ productId: line.productId, quantity: quantity.value, unitPrice: price.value });
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, lines };
}
