import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { ProductForm } from '@/components/product-form';
import { getProduct, getProductIds } from '@/lib/products';
import { OG_SITE_DEFAULTS } from '@/lib/site';

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  const ids = getProductIds();

  return ids.map((id) => ({ id }));
}

/**
 * Reads the product through the same cached function the page uses, so the
 * metadata costs nothing extra and never depends on a relative fetch.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const url = `/products/${id}`;

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title: product.name,
      description: product.description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
    },
  };
}

/**
 * Request-time region: genuinely different per request, so it sits in its own
 * boundary instead of holding up the rest of the page.
 */
async function ViewedAt() {
  await connection();

  return (
    <p className="text-gray-400 text-xs">
      Rendered for this request at {new Date().toISOString()}
    </p>
  );
}

export default async function ProductPage({ params }: Props) {
  // `params` comes from generateStaticParams and `getProduct` is a cached read,
  // so all of this belongs to the prerendered shell.
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <Link className="text-blue-600 text-sm hover:underline" href="/products">
        ← All products
      </Link>

      <h1 className="mt-4 font-bold text-3xl">{product.name}</h1>
      <p className="mt-1 text-gray-600">{product.description}</p>
      <p className="mt-4 font-mono text-2xl">${product.price}</p>
      <p className="mt-1 text-gray-500 text-xs">
        Last updated {product.updatedAt}
      </p>

      <section className="mt-8 border-t pt-6">
        <h2 className="mb-3 font-semibold text-lg">Edit</h2>
        <ProductForm product={product} />
      </section>

      <div className="mt-8 border-t pt-4">
        <Suspense fallback={<p className="text-gray-400 text-xs">…</p>}>
          <ViewedAt />
        </Suspense>
      </div>
    </main>
  );
}
