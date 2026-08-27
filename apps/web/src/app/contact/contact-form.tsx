'use client';

import { useActionState } from 'react';
import {
  type ContactFormState,
  submitContactForm,
} from '@/app/actions/contact';
import { SubmitButton } from '@/app/ui/submit-button';

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label className="mb-1 block font-medium text-sm" htmlFor="name">
          Name
        </label>
        <input
          className="w-full rounded-md border px-3 py-2"
          defaultValue={state.values?.name}
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
        <label className="mb-1 block font-medium text-sm" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md border px-3 py-2"
          defaultValue={state.values?.email}
          id="email"
          name="email"
          required
          type="email"
        />
        {state.errors?.email && (
          <p className="mt-1 text-red-600 text-sm">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium text-sm" htmlFor="message">
          Message
        </label>
        <textarea
          className="w-full rounded-md border px-3 py-2"
          defaultValue={state.values?.message}
          id="message"
          name="message"
          required
          rows={4}
        />
        {state.errors?.message && (
          <p className="mt-1 text-red-600 text-sm">{state.errors.message[0]}</p>
        )}
      </div>

      {/*
        One live region that is always in the DOM. Screen readers announce
        changes inside it; a region that only appears together with its message
        is not reliably announced.
      */}
      <div aria-live="polite" className="min-h-6">
        {state.success && (
          <p className="font-medium text-green-600">{state.message}</p>
        )}
        {state.message && !state.success && (
          <p className="text-red-600">{state.message}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
