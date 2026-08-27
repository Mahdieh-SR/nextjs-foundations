'use client';

import { type ReactNode, useState } from 'react';

export function Collapsible({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded border">
      <button
        className="flex w-full items-center justify-between p-4 text-left font-semibold hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {title}
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="border-t p-4">{children}</div>}
    </div>
  );
}
