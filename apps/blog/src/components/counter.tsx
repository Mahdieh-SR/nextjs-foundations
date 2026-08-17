'use client'

import { useState } from 'react'

import { Button } from '@repo/ui/components/button'

interface CounterProps {
  initialCount: number
}

export function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setCount((c) => c - 1)}
      >
        -
      </Button>
      <span className="min-w-[3ch] text-center font-mono text-2xl">{count}</span>
      <Button
        type="button"
        variant="outline"
        onClick={() => setCount((c) => c + 1)}
      >
        +
      </Button>
    </div>
  )
}