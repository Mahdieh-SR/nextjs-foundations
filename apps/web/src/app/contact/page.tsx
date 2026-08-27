import { Suspense } from 'react';
import { ContactForm } from './contact-form';
import { RecentMessages } from './recent-messages';

/**
 * Server Component: it holds no state itself, so only the form below it ships
 * JavaScript. The action it calls runs on the server, which is why the form
 * still works with JavaScript disabled.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 font-bold text-2xl">Contact Us</h1>

      <ContactForm />

      <section className="mt-10 border-t pt-6">
        <h2 className="mb-3 font-semibold text-lg">Recent messages</h2>
        <Suspense
          fallback={
            <div className="h-16 animate-pulse rounded-md bg-gray-100" />
          }
        >
          <RecentMessages />
        </Suspense>
      </section>
    </div>
  );
}
