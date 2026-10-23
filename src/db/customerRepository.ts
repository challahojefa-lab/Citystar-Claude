import { db } from './database';
import { newId, nowIso } from './ids';
import { roundMoney } from './saleRepository';
import type { Customer, Payment, Sale } from './types';

export const CUSTOMER_NAME_MAX = 60;
export const CUSTOMER_NOTES_MAX = 200;
export const PAYMENT_NOTES_MAX = 200;

export type CustomerErrorCode = 'nameRequired' | 'nameTooLong' | 'invalidPhone' | 'notesTooLong';

/** Thrown when a customer cannot be saved. Nothing is changed when this happens. */
export class CustomerError extends Error {
  readonly code: CustomerErrorCode;
  constructor(code: CustomerErrorCode) {
    super(`Customer rejected: ${code}`);
    this.name = 'CustomerError';
    this.code = code;
  }
}

export class CustomerNotFoundError extends Error {
  constructor() {
    super('Customer not found');
    this.name = 'CustomerNotFoundError';
  }
}

export type PaymentErrorCode =
  | 'invalidAmount'
  | 'exceedsBalance'
  | 'invalidDate'
  | 'futureDate'
  | 'notesTooLong';

/** Thrown when a payment cannot be saved. Nothing is changed when this happens. */
export class PaymentError extends Error {
  readonly code: PaymentErrorCode;
  /** For exceedsBalance: the balance that is really due. */
  readonly outstanding?: number;
  constructor(code: PaymentErrorCode, outstanding?: number) {
    super(`Payment rejected: ${code}`);
    this.name = 'PaymentError';
    this.code = code;
    this.outstanding = outstanding;
  }
}

export interface CustomerInput {
  name: string;
  /** '' or a 10-digit mobile number. */
  phone: string;
  notes: string;
}

export interface PaymentInput {
  customerId: string;
  amount: number;
  /** YYYY-MM-DD, today or earlier. */
  paidOn: string;
  notes: string;
}

export interface CustomerSummary {
  customer: Customer;
  /** Sum of this customer's credit sales. */
  totalCredit: number;
  totalPaid: number;
  /** totalCredit - totalPaid. Never negative, because payments cannot exceed it. */
  outstanding: number;
}

export interface CustomerDetail {
  summary: CustomerSummary;
  /** This customer's credit sales, newest first. */
  creditSales: Sale[];
  /** Newest payment date first. */
  payments: Payment[];
}

const toCents = (rupees: number) => Math.round(rupees * 100);
const fromCents = (cents: number) => cents / 100;

function summarize(
  customer: Customer,
  creditCents: number,
  paidCents: number,
): CustomerSummary {
  return {
    customer,
    totalCredit: fromCents(creditCents),
    totalPaid: fromCents(paidCents),
    outstanding: fromCents(creditCents - paidCents),
  };
}

/** Today's date on this device as YYYY-MM-DD (local time, not UTC). */
export function todayLocal(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isRealDate(text: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const name = input.name.trim().replace(/\s+/g, ' ');
  if (name === '') throw new CustomerError('nameRequired');
  if (name.length > CUSTOMER_NAME_MAX) throw new CustomerError('nameTooLong');
  const phone = input.phone.trim();
  if (phone !== '' && !/^[6-9]\d{9}$/.test(phone)) throw new CustomerError('invalidPhone');
  const notes = input.notes.trim();
  if (notes.length > CUSTOMER_NOTES_MAX) throw new CustomerError('notesTooLong');

  const now = nowIso();
  const customer: Customer = {
    id: newId(),
    name,
    phone,
    notes,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };
  await db.customers.add(customer);
  return customer;
}

/** Every customer with their totals, sorted by name. One consistent snapshot. */
export function listCustomerSummaries(): Promise<CustomerSummary[]> {
  return db.transaction('r', [db.customers, db.sales, db.payments], async () => {
    const customers = await db.customers.toArray();
    // Only sales that have a customerId are in this index, so cash/walk-in sales are skipped.
    const linkedSales = await db.sales.where('customerId').aboveOrEqual('').toArray();
    const payments = await db.payments.toArray();

    const credit = new Map<string, number>();
    for (const sale of linkedSales) {
      if (sale.isCredit && sale.customerId) {
        credit.set(sale.customerId, (credit.get(sale.customerId) ?? 0) + toCents(sale.totalAmount));
      }
    }
    const paid = new Map<string, number>();
    for (const payment of payments) {
      paid.set(payment.customerId, (paid.get(payment.customerId) ?? 0) + toCents(payment.amount));
    }

    return customers
      .map((customer) => summarize(customer, credit.get(customer.id) ?? 0, paid.get(customer.id) ?? 0))
      .sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  });
}

/** One customer's totals, credit sales and payment history (one consistent snapshot). */
export function getCustomerDetail(customerId: string): Promise<CustomerDetail> {
  return db.transaction('r', [db.customers, db.sales, db.payments], async () => {
    const customer = await db.customers.get(customerId);
    if (!customer) throw new CustomerNotFoundError();
    const sales = await db.sales.where('customerId').equals(customerId).toArray();
    const payments = await db.payments.where('customerId').equals(customerId).toArray();

    const creditSales = sales
      .filter((sale) => sale.isCredit)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const creditCents = creditSales.reduce((sum, sale) => sum + toCents(sale.totalAmount), 0);
    const paidCents = payments.reduce((sum, payment) => sum + toCents(payment.amount), 0);

    payments.sort(
      (a, b) => b.paidOn.localeCompare(a.paidOn) || b.createdAt.localeCompare(a.createdAt),
    );
    return { summary: summarize(customer, creditCents, paidCents), creditSales, payments };
  });
}

/**
 * Records money received from a customer. The balance is calculated INSIDE the
 * transaction from the saved sales and payments, and the payment is rejected if
 * it is zero, negative, not a valid amount (more than 2 decimals), more than the
 * balance due, dated in the future, or not a real date. Nothing is changed when
 * it is rejected.
 */
export function recordPayment(input: PaymentInput): Promise<Payment> {
  return db.transaction('rw', [db.customers, db.sales, db.payments], async () => {
    const customer = await db.customers.get(input.customerId);
    if (!customer) throw new CustomerNotFoundError();

    const { amount } = input;
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 999_999_999 ||
      Math.abs(roundMoney(amount) - amount) > 1e-9
    ) {
      throw new PaymentError('invalidAmount');
    }
    if (!isRealDate(input.paidOn)) throw new PaymentError('invalidDate');
    if (input.paidOn > todayLocal()) throw new PaymentError('futureDate');
    const notes = input.notes.trim();
    if (notes.length > PAYMENT_NOTES_MAX) throw new PaymentError('notesTooLong');

    const sales = await db.sales.where('customerId').equals(input.customerId).toArray();
    const payments = await db.payments.where('customerId').equals(input.customerId).toArray();
    const creditCents = sales
      .filter((sale) => sale.isCredit)
      .reduce((sum, sale) => sum + toCents(sale.totalAmount), 0);
    const paidCents = payments.reduce((sum, payment) => sum + toCents(payment.amount), 0);
    const outstandingCents = creditCents - paidCents;
    if (toCents(amount) > outstandingCents) {
      throw new PaymentError('exceedsBalance', fromCents(Math.max(outstandingCents, 0)));
    }

    const now = nowIso();
    const payment: Payment = {
      id: newId(),
      customerId: input.customerId,
      amount,
      paidOn: input.paidOn,
      notes,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    };
    await db.payments.add(payment);
    return payment;
  });
}
