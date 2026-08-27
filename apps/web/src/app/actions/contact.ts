'use server';

import { updateTag } from 'next/cache';
import { z } from 'zod';
import {
  CONTACT_MESSAGES_TAG,
  saveContactMessage,
} from '@/lib/server/contact-store';

// Validation runs on the server, so it cannot be skipped from the client.
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
  /**
   * What the user submitted, echoed back so the form can refill itself after a
   * failed attempt. Without this the no-JavaScript path loses everything the
   * user typed on every validation error.
   */
  values?: ContactFormValues;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const values: ContactFormValues = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
  };

  const validatedFields = contactSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      values,
    };
  }

  try {
    await saveContactMessage(validatedFields.data);

    // Read-your-own-writes: expire the cached list so the message this request
    // just stored is visible in the response it renders.
    updateTag(CONTACT_MESSAGES_TAG);

    return {
      success: true,
      message: 'Message sent successfully!',
    };
  } catch {
    // The real error stays on the server; the client gets a safe summary and
    // keeps its input so the attempt can be retried.
    return {
      message: 'Failed to send message. Please try again.',
      values,
    };
  }
}
