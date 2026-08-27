'use client';

import { useActionState } from 'react';
import { type ProductFormState, updateProduct } from '@/app/actions/products';
import { SubmitButton } from '@/app/ui/submit-button';
import type { Product } from '@/lib/products';

const initialState: ProductFormState = {};

export function ProductForm({ product }: { product: Product }) {
  const [state, formAction] = useActionState(updateProduct, initialState);

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input name="id" type="hidden" value={product.id} />
      <div>
        <label className="mb-1 block font-medium text-sm" htmlFor="name">
          Name
        </label>
        <input
          className="w-full rounded-md border px-3 py-2"
          defaultValue={product.name}
          id="name"
          name="name"
          required
          type="text"
        />
        {state.errors?.name && (
          <p className="mt-1 text-red-600 text-sm">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium text-sm" htmlFor="price">
          Price
        </label>
        <input
          className="w-full rounded-md border px-3 py-2"
          defaultValue={product.price}
          id="price"
          min="1"
          name="price"
          required
          type="number"
        />
        {state.errors?.price && (
          <p className="mt-1 text-red-600 text-sm">{state.errors.price[0]}</p>
        )}
      </div>

      <div aria-live="polite" className="min-h-6">
        {state.success && (
          <p className="text-green-600 text-sm">
            Product updated. {state.message}
          </p>
        )}
        {state.message && !state.success && (
          <p className="text-red-600 text-sm">{state.message}</p>
        )}
      </div>

      <SubmitButton label="Save product" pendingLabel="Saving..." />
    </form>
  );
}
