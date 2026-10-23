import { CUSTOMER_NAME_MAX, CUSTOMER_NOTES_MAX, PAYMENT_NOTES_MAX, todayLocal } from '../../db';
import { parsePrice } from '../inventory/productHelpers';
import { normalizePhone } from '../sales/saleHelpers';

/** Pure helpers (no React, no database) so they are easy to test. */

export type CustomerFormErrorKey = 'nameRequired' | 'nameTooLong' | 'phoneInvalid' | 'notesTooLong';

export interface CustomerFormValues {
  name: string;
  phone: string;
  notes: string;
}

export type CustomerFormErrors = Partial<
  Record<'name' | 'phone' | 'notes', CustomerFormErrorKey>
>;

export type CustomerValidation =
  | { ok: true; input: { name: string; phone: string; notes: string } }
  | { ok: false; errors: CustomerFormErrors };

export function validateCustomerForm(values: CustomerFormValues): CustomerValidation {
  const errors: CustomerFormErrors = {};
  const name = values.name.trim().replace(/\s+/g, ' ');
  if (name === '') errors.name = 'nameRequired';
  else if (name.length > CUSTOMER_NAME_MAX) errors.name = 'nameTooLong';

  const phone = normalizePhone(values.phone);
  if (!phone.ok) errors.phone = 'phoneInvalid';

  const notes = values.notes.trim();
  if (notes.length > CUSTOMER_NOTES_MAX) errors.notes = 'notesTooLong';

  if (Object.keys(errors).length > 0 || !phone.ok) return { ok: false, errors };
  return { ok: true, input: { name, phone: phone.value, notes } };
}

export type PaymentFormErrorKey =
  | 'amountInvalid'
  | 'amountExceeds'
  | 'dateInvalid'
  | 'dateFuture'
  | 'notesTooLong';

export interface PaymentFormValues {
  amount: string;
  paidOn: string;
  notes: string;
}

export type PaymentFormErrors = Partial<
  Record<'amount' | 'paidOn' | 'notes', PaymentFormErrorKey>
>;

export type PaymentValidation =
  | { ok: true; input: { amount: number; paidOn: string; notes: string } }
  | { ok: false; errors: PaymentFormErrors };

function isRealDate(text: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/**
 * Checks the payment form. Amount must be above 0 (up to 2 decimals) and not more
 * than `outstanding`. Date must be a real date, today or earlier. (The database
 * checks again inside the save transaction.)
 */
export function validatePaymentForm(
  values: PaymentFormValues,
  outstanding: number,
  today: string = todayLocal(),
): PaymentValidation {
  const errors: PaymentFormErrors = {};

  const amount = parsePrice(values.amount);
  let amountValue = 0;
  if (!amount.ok || amount.value === null || !(amount.value > 0)) {
    errors.amount = 'amountInvalid';
  } else if (Math.round(amount.value * 100) > Math.round(outstanding * 100)) {
    errors.amount = 'amountExceeds';
  } else {
    amountValue = amount.value;
  }

  if (!isRealDate(values.paidOn)) errors.paidOn = 'dateInvalid';
  else if (values.paidOn > today) errors.paidOn = 'dateFuture';

  const notes = values.notes.trim();
  if (notes.length > PAYMENT_NOTES_MAX) errors.notes = 'notesTooLong';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, input: { amount: amountValue, paidOn: values.paidOn, notes } };
}

/** Case-insensitive search on name and phone; every typed word must match. */
export function filterCustomers<T extends { customer: { name: string; phone: string } }>(
  summaries: readonly T[],
  query: string,
): T[] {
  const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...summaries];
  return summaries.filter((item) => {
    const haystack = `${item.customer.name} ${item.customer.phone}`.toLocaleLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

/** Shows a saved YYYY-MM-DD date in the shopkeeper's language, e.g. 21 Oct 2026. */
export function formatPaidOn(paidOn: string, locale: string): string {
  const [y, m, d] = paidOn.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, { dateStyle: 'medium' });
}
