import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts } from '@/lib/products';

/**
 * Cached listing. It carries the `products` tag, so saving any product expires
 * this entry too and the new price shows up here as well.
 */
async function ProductList() {
  const products = await getProducts();

  return (
    <ul className="space-y-3">
      {products.map((product) => (
        <li key={product.id}>
          <Link
            className="flex items-baseline justify-between rounded-lg border p-4 hover:bg-gray-50"
            href={`/products/${product.id}`}
          >
            <span>
              <span className="font-semibold">{product.name}</span>
              <span className="mt-1 block text-gray-600 text-sm">
                {product.description}
              </span>
            </span>
            <span className="font-mono">${product.price}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-1 font-bold text-3xl">Products</h1>
      <p className="mb-6 text-gray-500 text-sm">
        Prices come from a cached read; editing one expires its tag and the
        listing that shares it.
      </p>

      <Suspense
        fallback={<div className="h-40 animate-pulse rounded bg-gray-100" />}
      >
        <ProductList />
      </Suspense>
    </main>
  );
}
