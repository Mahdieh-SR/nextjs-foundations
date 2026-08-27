'use client';

import { useFormStatus } from 'react-dom';

type Props = {
  label?: string;
  pendingLabel?: string;
};

/**
 * `useFormStatus` reads the pending state of the nearest parent <form>, so this
 * has to be its own component: a hook called inside the form component itself
 * would not see its own submission.
 */
export function SubmitButton({
  label = 'Send Message',
  pendingLabel = 'Submitting...',
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
