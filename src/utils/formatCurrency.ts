const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const exactRupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 3,
});

/** Like formatRupees but keeps paise, e.g. 99.5 -> ₹99.50, 250 -> ₹250 */
export function formatRupeesExact(amount: number): string {
  const formatted = exactRupeeFormatter.format(amount);
  // Intl drops a trailing zero (₹99.5); shopkeepers expect ₹99.50.
  return /\.\d$/.test(formatted) ? `${formatted}0` : formatted;
}

/** Formats a stock quantity, e.g. 1250.5 -> 1,250.5 */
export function formatQuantity(quantity: number): string {
  return quantityFormatter.format(quantity);
}

/** Formats a number as Indian rupees, e.g. 48200 -> ₹48,200 */
export function formatRupees(amount: number): string {
  return rupeeFormatter.format(amount);
}
