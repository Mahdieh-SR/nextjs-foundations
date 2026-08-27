import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clientKey, rateLimit } from '@/lib/rate-limit';

/**
 * Product analytics events from the client.
 *
 * Same shape of protection as the vitals endpoint next door: this is open to
 * the internet and what it receives ends up in the server log, so it takes a
 * known payload at a bounded rate or it answers 400.
 */

const eventSchema = z.object({
  name: z.string().min(1).max(100),
  // Free-form, but bounded: an event is a label with a few short values on it,
  // not somewhere to post a document.
  properties: z
    .record(
      z.string().max(100),
      z.union([z.string().max(500), z.number(), z.boolean()])
    )
    .optional(),
  url: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const limit = rateLimit(`analytics:${clientKey(request)}`, {
    limit: 60,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  const event = parsed.data;

  // biome-ignore lint/suspicious/noConsole: server-side diagnostics
  console.log(
    `[analytics] ${event.name}`,
    event.url ?? '',
    event.properties ?? {}
  );

  // In production this would go to an analytics service or a store.

  return NextResponse.json({ received: true });
}
