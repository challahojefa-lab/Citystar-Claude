// Public entry point of the data layer. Import from '../db', not from inner files.
export { db, initDatabase, DB_NAME, DB_VERSION } from './database';
export type { DatabaseStatus } from './database';
export { newId, nowIso } from './ids';
export { PRODUCT_UNITS } from './types';
export type {
  BaseRecord,
  Product,
  ProductInput,
  ProductUnit,
  StockLevel,
  SyncStatus,
  TestRecord,
} from './types';
export {
  createProduct,
  listProducts,
  ProductNotFoundError,
  updateProduct,
} from './productRepository';
export { getStockQuantities } from './stockRepository';
export {
  createTestRecord,
  deleteTestRecord,
  listPendingTestRecords,
  listTestRecords,
  markTestRecordSynced,
  updateTestRecordLabel,
} from './testRecordRepository';
