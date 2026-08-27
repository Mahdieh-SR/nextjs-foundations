import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  type AuthenticatedUser,
  canActOnBehalfOf,
  verifyAuth,
} from '@/lib/auth';
import { clientKey, rateLimit } from '@/lib/rate-limit';

/**
 * Five checks, in the order that spends the least work on a request that is
 * going to be refused: rate limit, authenticate, validate, authorise, then act.
 *
 * Every failure answers with a generic message. The detail goes to the server
 * log under a correlation id, which is also returned so a caller can quote it
 * without being told anything about the internals.
 */

const TransactionSchema = z.object({
  userId: z.uuid(),
  amount: z.number().positive().max(10_000),
});

const RATE_LIMIT = { limit: 10, windowMs: 60_000 };

function identify(request: NextRequest, user: AuthenticatedUser | null) {
  // A user id is the honest key; the forwarded address is a fallback that a
  // determined caller can change.
  return user ? `user:${user.id}` : `ip:${clientKey(request)}`;
}

function tooManyRequests(resetAt: number) {
  return NextResponse.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'Retry-After': String(
          Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
        ),
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();

  try {
    const user = verifyAuth(request);

    const limit = rateLimit(identify(request, user), RATE_LIMIT);

    if (!limit.allowed) {
      return tooManyRequests(limit.resetAt);
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const parsed = TransactionSchema.safeParse(body);

    if (!parsed.success) {
      // The reason stays on the server: telling a caller which field failed
      // and why is a description of the validation rules.
      // biome-ignore lint/suspicious/noConsole: server-side diagnostics
      console.error(
        `[transactions ${correlationId}] validation failed:`,
        z.flattenError(parsed.error).fieldErrors
      );

      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { userId, amount } = parsed.data;

    // Authenticated is not the same as entitled: without this, any valid token
    // could post a transaction against someone else's account.
    if (!canActOnBehalfOf(user, userId)) {
      // biome-ignore lint/suspicious/noConsole: server-side diagnostics
      console.error(
        `[transactions ${correlationId}] ${user.id} attempted to act as ${userId}`
      );

      // 403, not 404: the caller is known, and the resource they asked about
      // is one they were told about by supplying it.
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transaction = {
      id: crypto.randomUUID(),
      userId,
      amount,
      timestamp: Date.now(),
    };

    // In production: await db.transactions.create({ data: transaction })

    return NextResponse.json(
      {
        success: true,
        transactionId: transaction.id,
        timestamp: transaction.timestamp,
      },
      { headers: { 'X-RateLimit-Remaining': String(limit.remaining) } }
    );
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server-side diagnostics
    console.error(`[transactions ${correlationId}] unhandled:`, error);

    // No stack trace, no message from the thrown error.
    return NextResponse.json(
      { error: 'Server error', correlationId },
      { status: 500 }
    );
  }
}

/**
 * Listing transactions is as sensitive as creating one, so it takes the same
 * authentication and returns only what belongs to the caller.
 */
export function GET(request: NextRequest) {
  const user = verifyAuth(request);

  const limit = rateLimit(identify(request, user), RATE_LIMIT);

  if (!limit.allowed) {
    return tooManyRequests(limit.resetAt);
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allTransactions = [
    {
      id: '1',
      userId: '3f4c9c1e-6b1e-4f9a-9a3d-6b2f8c5d1a70',
      amount: 100,
      status: 'completed',
    },
    {
      id: '2',
      userId: '8a2b7d40-1c55-4c3e-b8a1-2f9e4d6c0b31',
      amount: 250,
      status: 'pending',
    },
  ];

  const transactions = allTransactions.filter((transaction) =>
    canActOnBehalfOf(user, transaction.userId)
  );

  return NextResponse.json({ transactions });
}
