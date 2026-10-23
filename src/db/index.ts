// Public entry point of the data layer. Import from '../db', not from inner files.
export { db, initDatabase, DB_NAME, DB_VERSION } from './database';
export type { DatabaseStatus } from './database';
export { newId, nowIso } from './ids';
export { PRODUCT_UNITS } from './types';
export type {
  BaseRecord,
  Customer,
  Payment,
  Product,
  ProductInput,
  ProductUnit,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
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
export { getStockQuantities, setStockQuantity, StockError } from './stockRepository';
export type { StockErrorCode } from './stockRepository';
export {
  createTestRecord,
  deleteTestRecord,
  listPendingTestRecords,
  listTestRecords,
  markTestRecordSynced,
  updateTestRecordLabel,
} from './testRecordRepository';
export { createSale, listRecentSales, listSaleItems, SaleError } from './saleRepository';
export type { SaleErrorCode, SaleInput, SaleLineInput } from './saleRepository';
export {
  createPurchase,
  listPurchaseItems,
  listRecentPurchases,
  PurchaseError,
} from './purchaseRepository';
export type {
  PurchaseErrorCode,
  PurchaseInput,
  PurchaseLineInput,
} from './purchaseRepository';
export {
  createCustomer,
  CustomerError,
  CustomerNotFoundError,
  getCustomerDetail,
  listCustomerSummaries,
  PaymentError,
  recordPayment,
  todayLocal,
  CUSTOMER_NOTES_MAX,
  CUSTOMER_NAME_MAX,
  PAYMENT_NOTES_MAX,
} from './customerRepository';
export type {
  CustomerDetail,
  CustomerErrorCode,
  CustomerInput,
  CustomerSummary,
  PaymentErrorCode,
  PaymentInput,
} from './customerRepository';
export { computeProfit, dayRange, getDailyReport, ReportError } from './reportRepository';
export type { DailyReport, ProfitStatus, ProfitSummary } from './reportRepository';
export {
  BACKUP_TABLES,
  backupFileName,
  BackupError,
  createBackup,
  serializeBackup,
  verifyBackupText,
} from './backupRepository';
export type { BackupCheck, BackupFile } from './backupRepository';
