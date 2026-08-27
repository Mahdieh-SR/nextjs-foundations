'use client';

import { Button } from '@repo/ui/components/button';
import { useState } from 'react';

interface CounterProps {
  initialCount: number;
}

export function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => setCount((c) => c - 1)}
        type="button"
        variant="outline"
      >
        -
      </Button>
      <span className="min-w-[3ch] text-center font-mono text-2xl">
        {count}
      </span>
      <Button
        onClick={() => setCount((c) => c + 1)}
        type="button"
        variant="outline"
      >
        +
      </Button>
    </div>
  );
}
