import { db } from './database';
import { newId, nowIso } from './ids';
import type { Customer, Sale, SaleItem } from './types';

export type SaleErrorCode =
  | 'noItems'
  | 'invalidQuantity'
  | 'productMissing'
  | 'priceMissing'
  | 'insufficientStock'
  | 'customerMissing';

/** Thrown when a sale cannot be saved. Nothing is changed when this happens. */
export class SaleError extends Error {
  readonly code: SaleErrorCode;
  readonly productId?: string;
  /** For insufficientStock: how much is really available. */
  readonly available?: number;

  constructor(code: SaleErrorCode, productId?: string, available?: number) {
    super(`Sale rejected: ${code}`);
    this.name = 'SaleError';
    this.code = code;
    this.productId = productId;
    this.available = available;
  }
}

export interface SaleLineInput {
  productId: string;
  quantity: number;
}

export interface SaleInput {
  customerName: string;
  customerPhone: string;
  /**
   * Optional saved customer. When given, the customer's name and phone are copied
   * onto the sale and the sale is a credit sale (added to their balance) unless
   * isCredit is false. Without a customer, isCredit is ignored: a sale with no
   * customer never counts toward anyone's balance.
   */
  customerId?: string;
  isCredit?: boolean;
  lines: readonly SaleLineInput[];
}

/** Money is kept to 2 decimals and stock to 3 so floating-point noise never builds up. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

/**
 * Saves a sale AND reduces stock in ONE transaction. If anything fails (bad
 * quantity, not enough stock, storage error) the whole transaction is rolled
 * back, so there is never a sale without its stock change or the reverse.
 *
 * Prices, names and stock are read inside the transaction, so the database,
 * not the screen, decides what is allowed.
 */
export function createSale(input: SaleInput): Promise<Sale> {
  return db.transaction(
    'rw',
    [db.sales, db.saleItems, db.stockLevels, db.products, db.customers],
    async () => {
      if (input.lines.length === 0) throw new SaleError('noItems');

      let customer: Customer | undefined;
      if (input.customerId !== undefined) {
        customer = await db.customers.get(input.customerId);
        if (!customer) throw new SaleError('customerMissing');
      }

      // Merge accidental duplicates of the same product into one line.
      const wanted = new Map<string, number>();
      for (const line of input.lines) {
        const quantity = line.quantity;
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new SaleError('invalidQuantity', line.productId);
        }
        wanted.set(line.productId, roundQuantity((wanted.get(line.productId) ?? 0) + quantity));
      }

      const now = nowIso();
      const saleId = newId();
      const items: SaleItem[] = [];
      const stockUpdates: Array<{ id: string; quantity: number }> = [];

      for (const [productId, quantity] of wanted) {
        const product = await db.products.get(productId);
        if (!product) throw new SaleError('productMissing', productId);
        if (product.sellingPrice === null) throw new SaleError('priceMissing', productId);

        const stock = await db.stockLevels.where('productId').equals(productId).first();
        const available = stock ? stock.quantity : 0;
        if (!stock || quantity > available) {
          throw new SaleError('insufficientStock', productId, available);
        }

        stockUpdates.push({ id: stock.id, quantity: roundQuantity(available - quantity) });
        items.push({
          id: newId(),
          saleId,
          productId,
          productName: product.name,
          unit: product.unit,
          quantity,
          unitPrice: product.sellingPrice,
          lineTotal: roundMoney(quantity * product.sellingPrice),
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
        });
      }

      const sale: Sale = {
        id: saleId,
        customerName: customer ? customer.name : input.customerName.trim(),
        customerPhone: customer ? customer.phone : input.customerPhone.trim(),
        ...(customer ? { customerId: customer.id, isCredit: input.isCredit ?? true } : {}),
        itemCount: items.length,
        totalAmount: roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0)),
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      };

      await db.sales.add(sale);
      await db.saleItems.bulkAdd(items);
      for (const update of stockUpdates) {
        await db.stockLevels.update(update.id, {
          quantity: update.quantity,
          updatedAt: now,
          syncStatus: 'pending',
        });
      }
      return sale;
    },
  );
}

/** Newest sales first. */
export async function listRecentSales(limit = 20): Promise<Sale[]> {
  return db.sales.orderBy('createdAt').reverse().limit(limit).toArray();
}

export function listSaleItems(saleId: string): Promise<SaleItem[]> {
  return db.saleItems.where('saleId').equals(saleId).toArray();
}
