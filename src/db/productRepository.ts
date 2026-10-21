import { db } from './database';
import { newId, nowIso } from './ids';
import type { Product, ProductInput } from './types';

export class ProductNotFoundError extends Error {
  constructor() {
    super('Product not found');
    this.name = 'ProductNotFoundError';
  }
}

function cleanInput(input: ProductInput): ProductInput {
  const name = input.name.trim();
  if (name === '') {
    throw new Error('Product name is required');
  }
  return { ...input, name, category: input.category.trim() };
}

/** All products, sorted by name. The list is small, so sorting in memory is fine. */
export async function listProducts(): Promise<Product[]> {
  const products = await db.products.toArray();
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const now = nowIso();
  const product: Product = {
    ...cleanInput(input),
    id: newId(),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };
  await db.products.add(product);
  return product;
}

/**
 * Edits a product. The id and createdAt never change; updatedAt is refreshed
 * and the record becomes 'pending' again so it will be uploaded by future sync.
 */
export function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const clean = cleanInput(input);
  return db.transaction('rw', db.products, async () => {
    const existing = await db.products.get(id);
    if (!existing) throw new ProductNotFoundError();
    const updated: Product = {
      ...existing,
      ...clean,
      updatedAt: nowIso(),
      syncStatus: 'pending',
    };
    await db.products.put(updated);
    return updated;
  });
}
