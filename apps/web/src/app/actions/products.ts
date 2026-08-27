'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import { PRODUCTS_TAG, productTag, updateProductInDb } from '@/lib/products';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.coerce.number().positive('Price must be greater than zero'),
});

export type ProductFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    price?: string[];
  };
};

/**
 * The product id travels in the form rather than being bound with
 * `updateProduct.bind(null, id)`: a bound action never finishes its response on
 * the no-JavaScript submit path in Next 16.1.1 — the request hangs open even
 * though the write itself lands.
 *
 * Because the id is therefore client-supplied, it is only ever used to look up
 * an existing product; `updateProductInDb` returns null for anything else. A
 * real application would also check that this user may edit that product.
 */
export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get('id') ?? '');

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    price: formData.get('price'),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const updated = await updateProductInDb(id, parsed.data);

  if (!updated) {
    return { message: 'That product no longer exists.' };
  }

  // `updateTag` expires the entries immediately, so the response this action
  // renders already shows the new values — read-your-own-writes. A background
  // refresh instead would be `revalidateTag(tag, 'max')`, which keeps serving
  // the old value until the refresh lands.
  updateTag(productTag(id));
  updateTag(PRODUCTS_TAG);

  return { success: true, message: `Saved at ${updated.updatedAt}.` };
}
