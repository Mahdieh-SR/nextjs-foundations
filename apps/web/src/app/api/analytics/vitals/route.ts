import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Receives one Core Web Vitals measurement per request.
 *
 * The client sends these with sendBeacon, which cannot read a response, so the
 * status code here is for debugging rather than for the page.
 */

const vitalsSchema = z.object({
  id: z.string().max(200),
  name: z.enum(['LCP', 'INP', 'CLS']),
  value: z.number().finite().nonnegative(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  navigationType: z.string().max(50),
  attribution: z.string().max(500).optional(),
  url: z.string().max(2000),
  timestamp: z.number().int().positive(),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected JSON' }, { status: 400 });
  }

  // This endpoint is open to the internet, so the payload is checked before it
  // is logged rather than after.
  const parsed = vitalsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Not a vitals measurement' },
      { status: 400 }
    );
  }

  const vitals = parsed.data;

  // biome-ignore lint/suspicious/noConsole: the lesson reads these from the server log
  console.log(
    `[vitals] ${vitals.name}=${vitals.value} (${vitals.rating}) on ${vitals.url}`,
    vitals.attribution ? `blamed on ${vitals.attribution}` : ''
  );

  // In production this would go to a store or an analytics service:
  // await db.vitals.create({ data: vitals })

  return NextResponse.json({ received: true });
}
