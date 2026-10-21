import Dexie, { type EntityTable } from 'dexie';
import type { Product, Sale, SaleItem, StockLevel, TestRecord } from './types';

export const DB_NAME = 'citystar-hardware';

/**
 * Schema version. Increase by 1 whenever tables or indexes change, and add a
 * new `this.version(n).stores({...})` block (keep the old ones). Dexie then
 * upgrades existing devices automatically without losing data.
 */
export const DB_VERSION = 3;

export class CitystarDatabase extends Dexie {
  testRecords!: EntityTable<TestRecord, 'id'>;
  products!: EntityTable<Product, 'id'>;
  stockLevels!: EntityTable<StockLevel, 'id'>;
  sales!: EntityTable<Sale, 'id'>;
  saleItems!: EntityTable<SaleItem, 'id'>;

  constructor(name: string = DB_NAME) {
    super(name);

    // Only the listed fields are indexed; other fields are still stored.
    this.version(1).stores({
      testRecords: 'id, syncStatus, updatedAt',
    });

    // v2: adds products and stockLevels. Existing tables and data are kept.
    // '&productId' = unique index, so a product has at most one stock row.
    this.version(2).stores({
      products: 'id, name, category, syncStatus, updatedAt',
      stockLevels: 'id, &productId, syncStatus, updatedAt',
    });

    // v3: adds sales and saleItems. Products, stock and other data are untouched.
    this.version(3).stores({
      sales: 'id, createdAt, syncStatus, updatedAt',
      saleItems: 'id, saleId, productId, syncStatus, updatedAt',
    });
  }
}

/** The one database instance the whole app shares. */
export const db = new CitystarDatabase();

export interface DatabaseStatus {
  name: string;
  version: number;
  /** true if the browser/WebView agreed to protect the data from cleanup. */
  persistentStorage: boolean;
}

/**
 * Opens the database and asks the platform to keep it from being evicted.
 * Safe to call more than once. Throws if storage is unavailable (for example
 * IndexedDB blocked), so the caller can show a clear message.
 */
export async function initDatabase(): Promise<DatabaseStatus> {
  await db.open();

  let persistentStorage = false;
  try {
    if (navigator.storage?.persist) {
      persistentStorage =
        (await navigator.storage.persisted()) || (await navigator.storage.persist());
    }
  } catch {
    // Not supported in this environment; data is still saved, just unprotected.
  }

  return { name: db.name, version: DB_VERSION, persistentStorage };
}
