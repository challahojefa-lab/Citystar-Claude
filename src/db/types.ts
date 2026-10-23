/**
 * Shared record shape for every table in the local database.
 *
 * - id:         globally unique (UUID v4) so records made on different
 *               devices never collide when sync is added later.
 * - createdAt / updatedAt: ISO 8601 UTC strings (e.g. 2026-10-21T06:00:00.000Z).
 *               Always set updatedAt when a record changes; sync will rely on it.
 * - syncStatus: 'pending' = changed on this device, not yet uploaded.
 *               'synced'  = matches the server copy.
 */
export type SyncStatus = 'pending' | 'synced';

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

/**
 * EXAMPLE record used only to prove the data layer works.
 * It is not a business entity and should be deleted once the first real
 * table (e.g. sales) exists.
 */
export interface TestRecord extends BaseRecord {
  label: string;
}

/**
 * Units a product can be counted in. These are stored as keys (not display
 * text) so each language can show its own word. To add a unit, add the key
 * here and its translation in src/i18n/translations.ts.
 */
export const PRODUCT_UNITS = [
  'piece',
  'kg',
  'metre',
  'box',
  'pair',
  'set',
  'litre',
  'dozen',
] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

/**
 * Units that can only be counted in whole numbers. The stock-entry rules use
 * this list. (features/sales/saleHelpers.ts keeps its own copy for the sale
 * screen: if you change one list, change the other.)
 */
export const WHOLE_NUMBER_UNITS: readonly ProductUnit[] = ['piece', 'box', 'pair', 'set'];

/** Product details only. Stock quantity is deliberately NOT stored here. */
export interface Product extends BaseRecord {
  name: string;
  /** Empty string means "no category". */
  category: string;
  unit: ProductUnit;
  /** null means "not entered". Amounts are in rupees. */
  purchasePrice: number | null;
  sellingPrice: number | null;
}

/** What the screens supply when creating or editing a product. */
export type ProductInput = Pick<
  Product,
  'name' | 'category' | 'unit' | 'purchasePrice' | 'sellingPrice'
>;

/**
 * Current stock of one product, kept in its own table so product details and
 * stock balances stay separate. Written by setStockQuantity (stock entry) and by
 * a saved sale (which reduces it) and a saved purchase (which increases it).
 */
export interface StockLevel extends BaseRecord {
  productId: string;
  quantity: number;
}

/**
 * A completed sale. The sold time is `createdAt`. Sales are never edited after
 * saving, so there is no update function for them.
 */
export interface Sale extends BaseRecord {
  /** Empty string = customer name not entered. */
  customerName: string;
  /** Digits only (or with a leading +91); empty string = not entered. */
  customerPhone: string;
  itemCount: number;
  /** Rupees, rounded to 2 decimals. */
  totalAmount: number;
  /**
   * Set only when the sale was made to a saved customer. Sales saved before
   * customers existed (or with no customer chosen) have neither field and never
   * count toward any customer's balance.
   */
  customerId?: string;
  /** With customerId: true = added to the customer's balance, false = paid in cash. */
  isCredit?: boolean;
}

/**
 * One line of a sale. The product name, unit and price are copied at the time
 * of sale, so later edits to the product never change old sales.
 */
export interface SaleItem extends BaseRecord {
  saleId: string;
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/**
 * A completed purchase (goods bought from a supplier). The time is `createdAt`.
 * Purchases are never edited after saving. The supplier is only free text here;
 * there are no supplier records.
 */
export interface Purchase extends BaseRecord {
  /** Empty string = supplier name not entered. */
  supplierName: string;
  /** 10 digits; empty string = not entered. */
  supplierPhone: string;
  itemCount: number;
  /** Rupees, rounded to 2 decimals. */
  totalAmount: number;
}

/**
 * One line of a purchase. The product name, unit and price are copied at the
 * time of purchase, so later product edits never change old purchases.
 */
export interface PurchaseItem extends BaseRecord {
  purchaseId: string;
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  /** Price paid per unit in this purchase (may differ from the product's usual price). */
  unitPrice: number;
  lineTotal: number;
}

/** A saved customer. Name is required; phone (10 digits) and notes may be empty. */
export interface Customer extends BaseRecord {
  name: string;
  phone: string;
  notes: string;
}

/**
 * Money received from a customer against their balance. `paidOn` is the date the
 * money was received (YYYY-MM-DD, chosen by the shopkeeper); `createdAt` is when
 * it was recorded. Payments are never edited or deleted after saving.
 */
export interface Payment extends BaseRecord {
  customerId: string;
  /** Rupees, more than 0, at most 2 decimals. */
  amount: number;
  paidOn: string;
  notes: string;
}
