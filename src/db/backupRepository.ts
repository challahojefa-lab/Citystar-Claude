import { DB_VERSION, db } from './database';
import { sha256Hex } from './sha256';
import type {
  Customer,
  Payment,
  Product,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  StockLevel,
} from './types';

/** The eight business tables. testRecords is deliberately NOT included. */
export const BACKUP_TABLES = [
  'products',
  'stockLevels',
  'sales',
  'saleItems',
  'purchases',
  'purchaseItems',
  'customers',
  'payments',
] as const;
export type BackupTable = (typeof BACKUP_TABLES)[number];

export const BACKUP_FORMAT = 'citystar-hardware-backup';
export const BACKUP_FORMAT_VERSION = 1;

export interface BackupData {
  products: Product[];
  stockLevels: StockLevel[];
  sales: Sale[];
  saleItems: SaleItem[];
  purchases: Purchase[];
  purchaseItems: PurchaseItem[];
  customers: Customer[];
  payments: Payment[];
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  /** Database schema version the records were read from. */
  schemaVersion: number;
  /** When the backup was made, ISO 8601 UTC. */
  createdAt: string;
  counts: Record<BackupTable, number>;
  totalRecords: number;
  /** SHA-256 of JSON.stringify(data) exactly as written in the file. */
  checksum: { algorithm: 'SHA-256'; value: string };
  data: BackupData;
}

export type BackupErrorCode = 'empty';

export class BackupError extends Error {
  constructor(
    public readonly code: BackupErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

/**
 * Reads every business table in ONE read-only transaction (so the copy is a consistent
 * snapshot even if a sale is being saved at the same moment). Changes nothing.
 * Throws BackupError('empty') when there is no data at all.
 */
export async function createBackup(now: Date = new Date()): Promise<BackupFile> {
  const data = await db.transaction(
    'r',
    [
      db.products,
      db.stockLevels,
      db.sales,
      db.saleItems,
      db.purchases,
      db.purchaseItems,
      db.customers,
      db.payments,
    ],
    async (): Promise<BackupData> => ({
      products: await db.products.orderBy('id').toArray(),
      stockLevels: await db.stockLevels.orderBy('id').toArray(),
      sales: await db.sales.orderBy('id').toArray(),
      saleItems: await db.saleItems.orderBy('id').toArray(),
      purchases: await db.purchases.orderBy('id').toArray(),
      purchaseItems: await db.purchaseItems.orderBy('id').toArray(),
      customers: await db.customers.orderBy('id').toArray(),
      payments: await db.payments.orderBy('id').toArray(),
    }),
  );

  const counts = {} as Record<BackupTable, number>;
  let totalRecords = 0;
  for (const table of BACKUP_TABLES) {
    counts[table] = data[table].length;
    totalRecords += data[table].length;
  }
  if (totalRecords === 0) {
    throw new BackupError('empty', 'There is no data to back up.');
  }

  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: DB_VERSION,
    createdAt: now.toISOString(),
    counts,
    totalRecords,
    checksum: { algorithm: 'SHA-256', value: sha256Hex(JSON.stringify(data)) },
    data,
  };
}

/** The exact text that is saved to the file. */
export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

/** "citystar-hardware-backup-2026-10-22-2155.json" (device-local date and time). */
export function backupFileName(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `citystar-hardware-backup-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}` +
    `-${p(now.getHours())}${p(now.getMinutes())}.json`
  );
}

export interface BackupCheck {
  ok: boolean;
  problems: string[];
}

/**
 * Checks backup text: valid JSON, right format, all eight tables present, record counts
 * match, checksum matches. Used to verify a file; it does NOT restore anything.
 */
export function verifyBackupText(text: string): BackupCheck {
  const problems: string[] = [];
  let file: Partial<BackupFile>;
  try {
    file = JSON.parse(text) as Partial<BackupFile>;
  } catch {
    return { ok: false, problems: ['Not valid JSON'] };
  }
  if (typeof file !== 'object' || file === null || file.format !== BACKUP_FORMAT) {
    return { ok: false, problems: ['Not a Citystar Hardware backup'] };
  }
  if (file.formatVersion !== BACKUP_FORMAT_VERSION) problems.push('Unknown format version');
  if (typeof file.schemaVersion !== 'number') problems.push('Missing schema version');
  if (typeof file.createdAt !== 'string' || Number.isNaN(Date.parse(file.createdAt))) {
    problems.push('Missing or invalid backup time');
  }
  const data = file.data as Partial<BackupData> | undefined;
  if (!data || typeof data !== 'object') {
    return { ok: false, problems: [...problems, 'Missing data'] };
  }
  let total = 0;
  for (const table of BACKUP_TABLES) {
    const rows = data[table];
    if (!Array.isArray(rows)) {
      problems.push(`Table ${table} is missing`);
      continue;
    }
    total += rows.length;
    if (file.counts?.[table] !== rows.length) problems.push(`Count mismatch in ${table}`);
  }
  if (file.totalRecords !== total) problems.push('Total record count mismatch');
  if (file.checksum?.algorithm !== 'SHA-256') {
    problems.push('Missing checksum');
  } else if (file.checksum.value !== sha256Hex(JSON.stringify(data))) {
    problems.push('Checksum does not match (file changed or damaged)');
  }
  return { ok: problems.length === 0, problems };
}
