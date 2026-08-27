'use client';

import { useRouter } from 'next/navigation';

export function NavigationButtons() {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      <button
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        onClick={() => router.push('/nav-demo/page-a')}
        type="button"
      >
        router.push()
      </button>

      <button
        className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        onClick={() => router.back()}
        type="button"
      >
        router.back()
      </button>

      <button
        className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
        onClick={() => router.replace('/nav-demo/page-b')}
        type="button"
      >
        router.replace()
      </button>
    </div>
  );
}
