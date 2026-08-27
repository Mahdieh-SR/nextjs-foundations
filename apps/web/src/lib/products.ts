import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Product reads, cached and tagged.
 *
 * `cacheLife('products')` refers to the profile declared in next.config.ts
 * (stale 5m, revalidate 15m, expire 1h). `cacheTag` labels each entry so a
 * Server Action can invalidate exactly the product it just wrote, and the
 * listing alongside it.
 *
 * The array below stands in for a database; it is process memory, so it resets
 * on restart.
 */

export const PRODUCTS_TAG = 'products';

export function productTag(id: string): string {
  return `product-${id}`;
}

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  updatedAt: string;
};

const products: Product[] = [
  {
    id: 'desk-lamp',
    name: 'Desk Lamp',
    price: 89,
    description: 'Warm, dimmable light with a weighted base.',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'mechanical-keyboard',
    name: 'Mechanical Keyboard',
    price: 149,
    description: 'Low-profile switches, aluminium frame, no backlight.',
    updatedAt: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'standing-desk',
    name: 'Standing Desk',
    price: 620,
    description: 'Electric height adjustment with three saved positions.',
    updatedAt: '2026-06-29T10:00:00.000Z',
  },
];

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProducts(): Promise<Product[]> {
  'use cache';
  cacheLife('products');
  cacheTag(PRODUCTS_TAG);

  await simulateLatency(200);

  return products.map((product) => ({ ...product }));
}

export async function getProduct(id: string): Promise<Product | null> {
  'use cache';
  cacheLife('products');
  cacheTag(PRODUCTS_TAG, productTag(id));

  await simulateLatency(150);

  const product = products.find((candidate) => candidate.id === id);

  return product ? { ...product } : null;
}

export function getProductIds(): string[] {
  // Build-time only, and it must not be cached: it is read by
  // generateStaticParams, where a cached read sharing the products tag would
  // nest inside another cached scope.
  return products.map((product) => product.id);
}

/**
 * The write side. Not cached: it mutates, and the action that calls it is
 * responsible for invalidating the tags above.
 */
export async function updateProductInDb(
  id: string,
  data: { name: string; price: number }
): Promise<Product | null> {
  await simulateLatency(150);

  const product = products.find((candidate) => candidate.id === id);

  if (!product) {
    return null;
  }

  product.name = data.name;
  product.price = data.price;
  product.updatedAt = new Date().toISOString();

  return { ...product };
}
