import { db } from './database';
import { newId, nowIso } from './ids';
import { roundMoney, roundQuantity } from './saleRepository';
import {
  WHOLE_NUMBER_UNITS,
  type Product,
  type Purchase,
  type PurchaseItem,
  type StockLevel,
} from './types';

export type PurchaseErrorCode =
  | 'noItems'
  | 'invalidQuantity'
  | 'notWholeNumber'
  | 'invalidPrice'
  | 'productMissing'
  | 'duplicateProduct';

/** Thrown when a purchase cannot be saved. Nothing is changed when this happens. */
export class PurchaseError extends Error {
  readonly code: PurchaseErrorCode;
  readonly productId?: string;

  constructor(code: PurchaseErrorCode, productId?: string) {
    super(`Purchase rejected: ${code}`);
    this.name = 'PurchaseError';
    this.code = code;
    this.productId = productId;
  }
}

export interface PurchaseLineInput {
  productId: string;
  quantity: number;
  /** Price paid per unit, in rupees. */
  unitPrice: number;
}

export interface PurchaseInput {
  supplierName: string;
  supplierPhone: string;
  lines: readonly PurchaseLineInput[];
}

const MAX_QUANTITY = 9_999_999;
const MAX_PRICE = 999_999_999;
const EPSILON = 1e-9;

/**
 * Saves a purchase, increases stock, and updates product purchase prices in ONE
 * transaction. If anything fails (bad quantity, bad price, missing product,
 * storage error) the whole transaction is rolled back, so there is never a
 * purchase without its stock increase or the reverse.
 *
 * Every rule is checked here, inside the transaction, against the products as
 * they are right now, so the database (not the screen) decides what is allowed:
 * - at least one line, and each product at most once (a price per product),
 * - quantity above 0, at most 3 decimals; piece/box/pair/set whole numbers only,
 * - price 0 or more (never negative), at most 2 decimals.
 *
 * Effects per line:
 * - stock: added to the existing stock row, or a new row is created. A product
 *   with no stock row is treated as having 0 (the same rule Sales uses).
 * - product purchase price: set to this line's price when it is above 0 and
 *   different. A price of 0 (free sample) does not change it. The selling price
 *   and all other product fields are never touched.
 */
export function createPurchase(input: PurchaseInput): Promise<Purchase> {
  return db.transaction(
    'rw',
    [db.purchases, db.purchaseItems, db.stockLevels, db.products],
    async () => {
      if (input.lines.length === 0) throw new PurchaseError('noItems');

      const now = nowIso();
      const purchaseId = newId();
      const seen = new Set<string>();
      const items: PurchaseItem[] = [];
      const stockWrites: StockLevel[] = [];
      const productWrites: Product[] = [];

      for (const line of input.lines) {
        const { productId, quantity, unitPrice } = line;
        if (seen.has(productId)) throw new PurchaseError('duplicateProduct', productId);
        seen.add(productId);

        const product = await db.products.get(productId);
        if (!product) throw new PurchaseError('productMissing', productId);

        if (
          !Number.isFinite(quantity) ||
          quantity <= 0 ||
          quantity > MAX_QUANTITY ||
          Math.abs(roundQuantity(quantity) - quantity) > EPSILON
        ) {
          throw new PurchaseError('invalidQuantity', productId);
        }
        if (WHOLE_NUMBER_UNITS.includes(product.unit) && !Number.isInteger(quantity)) {
          throw new PurchaseError('notWholeNumber', productId);
        }
        if (
          !Number.isFinite(unitPrice) ||
          unitPrice < 0 ||
          unitPrice > MAX_PRICE ||
          Math.abs(roundMoney(unitPrice) - unitPrice) > EPSILON
        ) {
          throw new PurchaseError('invalidPrice', productId);
        }

        items.push({
          id: newId(),
          purchaseId,
          productId,
          productName: product.name,
          unit: product.unit,
          quantity,
          unitPrice,
          lineTotal: roundMoney(quantity * unitPrice),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
        });

        const stock = await db.stockLevels.where('productId').equals(productId).first();
        stockWrites.push(
          stock
            ? {
                ...stock,
                quantity: roundQuantity(stock.quantity + quantity),
                updatedAt: now,
                syncStatus: 'pending',
              }
            : {
                id: newId(),
                productId,
                quantity,
                createdAt: now,
                updatedAt: now,
                syncStatus: 'pending',
              },
        );

        if (unitPrice > 0 && product.purchasePrice !== unitPrice) {
          productWrites.push({
            ...product,
            purchasePrice: unitPrice,
            updatedAt: now,
            syncStatus: 'pending',
          });
        }
      }

      const purchase: Purchase = {
        id: purchaseId,
        supplierName: input.supplierName.trim(),
        supplierPhone: input.supplierPhone.trim(),
        itemCount: items.length,
        totalAmount: roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0)),
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      };

      // Nothing is written until every line has passed the checks above.
      await db.purchases.add(purchase);
      await db.purchaseItems.bulkAdd(items);
      for (const stock of stockWrites) await db.stockLevels.put(stock);
      for (const product of productWrites) await db.products.put(product);
      return purchase;
    },
  );
}

/** Newest purchases first. */
export function listRecentPurchases(limit = 10): Promise<Purchase[]> {
  return db.purchases.orderBy('createdAt').reverse().limit(limit).toArray();
}

export function listPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
  return db.purchaseItems.where('purchaseId').equals(purchaseId).toArray();
}
