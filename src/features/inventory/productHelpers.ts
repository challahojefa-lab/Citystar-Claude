import type { Translations } from '../../i18n/translations';
import type { Product, ProductInput, ProductUnit } from '../../db/types';

/** Pure helpers (no React, no database) so they are easy to test. */

export type InventoryErrorKey = keyof Translations['inventory']['errors'];

export const MAX_NAME_LENGTH = 100;
export const MAX_CATEGORY_LENGTH = 50;

/** Form fields hold text exactly as typed; numbers are parsed on save. */
export interface ProductFormValues {
  name: string;
  category: string;
  unit: ProductUnit;
  purchasePrice: string;
  sellingPrice: string;
}

export type ProductFormField = 'name' | 'category' | 'purchasePrice' | 'sellingPrice';
export type ProductFormErrors = Partial<Record<ProductFormField, InventoryErrorKey>>;

/** Top-to-bottom order of the form, used to focus the first problem. */
export const FORM_FIELD_ORDER: readonly ProductFormField[] = [
  'name',
  'category',
  'purchasePrice',
  'sellingPrice',
];

export function emptyFormValues(): ProductFormValues {
  return { name: '', category: '', unit: 'piece', purchasePrice: '', sellingPrice: '' };
}

export function formValuesFromProduct(product: Product): ProductFormValues {
  return {
    name: product.name,
    category: product.category,
    unit: product.unit,
    purchasePrice: product.purchasePrice === null ? '' : String(product.purchasePrice),
    sellingPrice: product.sellingPrice === null ? '' : String(product.sellingPrice),
  };
}

/** Gujarati keyboards can type ૦-૯; convert them to 0-9 before reading a number. */
function toAsciiDigits(text: string): string {
  return text.replace(/[૦-૯]/g, (digit) =>
    String(digit.charCodeAt(0) - 0x0ae6),
  );
}

export type PriceParseResult = { ok: true; value: number | null } | { ok: false };

/**
 * Empty text means "no price entered" (null). Otherwise only digits with an
 * optional decimal point and up to 2 decimals are accepted, e.g. 250 or 99.50.
 * Commas are rejected on purpose: "1,5" could mean 1.5 or 15.
 */
export function parsePrice(text: string): PriceParseResult {
  const cleaned = toAsciiDigits(text).trim().replace(/^₹\s*/, '');
  if (cleaned === '') return { ok: true, value: null };
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(cleaned)) return { ok: false };
  return { ok: true, value: Number(cleaned) };
}

function tidy(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function nameKey(text: string): string {
  return tidy(text).toLocaleLowerCase();
}

export type ValidationResult =
  | { ok: true; input: ProductInput }
  | { ok: false; errors: ProductFormErrors };

/**
 * Checks the form. `existing` is the current product list (used to stop two
 * products having the same name) and `editingId` is the product being edited
 * (so it does not clash with itself), or null when adding.
 */
export function validateProductForm(
  values: ProductFormValues,
  existing: readonly Product[],
  editingId: string | null,
): ValidationResult {
  const errors: ProductFormErrors = {};

  const name = tidy(values.name);
  if (name === '') {
    errors.name = 'nameRequired';
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = 'nameTooLong';
  } else if (
    existing.some((p) => p.id !== editingId && nameKey(p.name) === nameKey(name))
  ) {
    errors.name = 'nameDuplicate';
  }

  const category = tidy(values.category);
  if (category.length > MAX_CATEGORY_LENGTH) {
    errors.category = 'categoryTooLong';
  }

  const purchase = parsePrice(values.purchasePrice);
  if (!purchase.ok) errors.purchasePrice = 'priceInvalid';

  const selling = parsePrice(values.sellingPrice);
  if (!selling.ok) errors.sellingPrice = 'priceInvalid';

  if (Object.keys(errors).length > 0 || !purchase.ok || !selling.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      name,
      category,
      unit: values.unit,
      purchasePrice: purchase.value,
      sellingPrice: selling.value,
    },
  };
}

/** Case-insensitive search on name and category; every typed word must match. */
export function filterProducts(
  products: readonly Product[],
  query: string,
): Product[] {
  const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...products];
  return products.filter((product) => {
    const haystack = `${product.name} ${product.category}`.toLocaleLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

/** Sorted list of the distinct, non-empty categories already in use. */
export function distinctCategories(products: readonly Product[]): string[] {
  const unique = new Set(products.map((p) => p.category).filter((c) => c !== ''));
  return [...unique].sort((a, b) => a.localeCompare(b));
}
