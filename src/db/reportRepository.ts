import { db } from './database';
import { isRealDate, listCustomerSummaries } from './customerRepository';
import { roundMoney } from './saleRepository';
import type { Payment, Purchase, PurchaseItem, Sale, SaleItem } from './types';

/**
 * READ-ONLY. Nothing in this file writes to the database, so reports can never
 * change a sale, purchase, payment or stock quantity.
 */

export class ReportError extends Error {
  constructor() {
    super('Invalid report date');
    this.name = 'ReportError';
  }
}

const toCents = (rupees: number) => Math.round(rupees * 100);
const fromCents = (cents: number) => cents / 100;

/**
 * The start (included) and end (excluded) of a calendar day on THIS device, as
 * the UTC timestamps that sales and purchases are stored with. A sale saved at
 * 11:59 pm belongs to that day; one at 12:00 am belongs to the next.
 */
export function dayRange(date: string): { start: string; end: string } {
  if (!isRealDate(date)) throw new ReportError();
  const [year, month, day] = date.split('-').map(Number);
  return {
    start: new Date(year, month - 1, day).toISOString(),
    end: new Date(year, month - 1, day + 1).toISOString(),
  };
}

export type ProfitStatus =
  /** No sales on this date, so there is nothing to work out. */
  | 'none'
  /** Every sold item has a recorded purchase cost. */
  | 'complete'
  /** Some sold items have a cost and some do not: the profit shown is partial. */
  | 'incomplete'
  /** No sold item has a recorded purchase cost: no profit can be shown. */
  | 'unavailable';

export interface ProfitSummary {
  status: ProfitStatus;
  /**
   * Sales value minus cost, counting ONLY the sold items that have a recorded
   * cost. For 'complete' this is the whole estimated gross profit. For
   * 'incomplete' it is NOT the day's profit. For 'unavailable' and 'none' it is 0.
   */
  profit: number;
  /** Sales value of the items whose cost is known. */
  costedSalesValue: number;
  /** Sales value of the items whose cost is unknown (left out of `profit`). */
  uncostedSalesValue: number;
  /** How many different products were sold without a recorded cost. */
  missingProductCount: number;
  /** Names of those products (distinct, in order of first sale). */
  missingProductNames: string[];
}

/**
 * Works out estimated gross profit from sold lines.
 *
 * Cost of a sold line = the price per unit on the LATEST recorded purchase of
 * that product made at or before the moment of the sale. Purchases recorded at
 * a price of 0 (free samples) are ignored, because a cost of 0 would overstate
 * profit. The product's current purchase price is deliberately NOT used: it can
 * be edited at any time, so it does not say what was paid when the sale happened.
 *
 * A line with no such purchase has no reliable cost. It is left out of the
 * profit and reported as missing; the cost is never guessed.
 */
export function computeProfit(
  saleItems: readonly SaleItem[],
  purchaseLines: readonly PurchaseItem[],
): ProfitSummary {
  const linesByProduct = new Map<string, PurchaseItem[]>();
  for (const line of purchaseLines) {
    if (!(line.unitPrice > 0)) continue;
    const list = linesByProduct.get(line.productId) ?? [];
    list.push(line);
    linesByProduct.set(line.productId, list);
  }
  for (const list of linesByProduct.values()) {
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  let profitCents = 0;
  let costedCents = 0;
  let uncostedCents = 0;
  const missing = new Map<string, string>();

  for (const item of saleItems) {
    const revenueCents = toCents(item.lineTotal);
    const candidates = linesByProduct.get(item.productId) ?? [];
    let cost: PurchaseItem | undefined;
    for (const candidate of candidates) {
      if (candidate.createdAt <= item.createdAt) cost = candidate;
      else break;
    }

    if (!cost) {
      uncostedCents += revenueCents;
      if (!missing.has(item.productId)) missing.set(item.productId, item.productName);
      continue;
    }
    const costCents = toCents(roundMoney(item.quantity * cost.unitPrice));
    costedCents += revenueCents;
    profitCents += revenueCents - costCents;
  }

  const status: ProfitStatus =
    saleItems.length === 0
      ? 'none'
      : missing.size === 0
        ? 'complete'
        : costedCents === 0 && saleItems.every((item) => missing.has(item.productId))
          ? 'unavailable'
          : 'incomplete';

  return {
    status,
    profit: status === 'unavailable' || status === 'none' ? 0 : fromCents(profitCents),
    costedSalesValue: fromCents(costedCents),
    uncostedSalesValue: fromCents(uncostedCents),
    missingProductCount: missing.size,
    missingProductNames: [...missing.values()],
  };
}

export interface DailyReport {
  date: string;
  /** Newest first. */
  sales: Sale[];
  /** Newest first. */
  purchases: Purchase[];
  salesCount: number;
  /** cashSales + creditSales, always exactly. */
  totalSales: number;
  /** Every sale that was not put on a customer's credit (includes older sales). */
  cashSales: number;
  creditSales: number;
  creditSalesCount: number;
  purchasesCount: number;
  totalPurchases: number;
  /** Customer payments whose "date received" is this date. NOT part of sales. */
  paymentsCount: number;
  paymentsTotal: number;
  profit: ProfitSummary;
  /** What customers owe RIGHT NOW (not as of `date`). */
  outstanding: { total: number; customersWithBalance: number };
}

/** Everything for one day, read in one consistent snapshot. */
export function getDailyReport(date: string): Promise<DailyReport> {
  const { start, end } = dayRange(date);
  return db.transaction(
    'r',
    [db.sales, db.saleItems, db.purchases, db.purchaseItems, db.payments, db.customers],
    async () => {
      const sales = (await db.sales.where('createdAt').between(start, end, true, false).toArray()).sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt),
      );
      const purchases = (
        await db.purchases.where('createdAt').between(start, end, true, false).toArray()
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const payments: Payment[] = await db.payments.where('paidOn').equals(date).toArray();

      const saleItems = sales.length
        ? await db.saleItems.where('saleId').anyOf(sales.map((sale) => sale.id)).toArray()
        : [];
      const productIds = [...new Set(saleItems.map((item) => item.productId))];
      const purchaseLines = productIds.length
        ? await db.purchaseItems.where('productId').anyOf(productIds).toArray()
        : [];

      let creditCents = 0;
      let creditCount = 0;
      let totalCents = 0;
      for (const sale of sales) {
        const cents = toCents(sale.totalAmount);
        totalCents += cents;
        // Only a sale made to a saved customer AND flagged as credit is a credit sale.
        if (sale.customerId !== undefined && sale.isCredit === true) {
          creditCents += cents;
          creditCount += 1;
        }
      }

      const summaries = await listCustomerSummaries();
      const owing = summaries.filter((summary) => summary.outstanding > 0);

      return {
        date,
        sales,
        purchases,
        salesCount: sales.length,
        totalSales: fromCents(totalCents),
        cashSales: fromCents(totalCents - creditCents),
        creditSales: fromCents(creditCents),
        creditSalesCount: creditCount,
        purchasesCount: purchases.length,
        totalPurchases: fromCents(purchases.reduce((sum, p) => sum + toCents(p.totalAmount), 0)),
        paymentsCount: payments.length,
        paymentsTotal: fromCents(payments.reduce((sum, p) => sum + toCents(p.amount), 0)),
        profit: computeProfit(saleItems, purchaseLines),
        outstanding: {
          total: fromCents(owing.reduce((sum, s) => sum + toCents(s.outstanding), 0)),
          customersWithBalance: owing.length,
        },
      };
    },
  );
}
