import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';

// Simulate a database call that uses server secrets
// biome-ignore lint/suspicious/useAwait: the "use cache" directive requires an async function
export async function getUserFromDB(userId: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`user-${userId}`);

  // In real code, this would use process.env.DATABASE_URL
  // The INTERNAL_CONFIG demonstrates server-only variable access
  const config = process.env.INTERNAL_CONFIG ?? 'default';

  // Simulated database response with sensitive fields
  return {
    id: userId,
    email: 'user@example.com',
    passwordHash: 'bcrypt$2b$10$...', // NEVER expose this
    internalNotes: `VIP customer (config: ${config})`, // NEVER expose this
    name: 'Jane Developer',
    // A stored property of the account, not the current time: reading the
    // clock here would move the "joined" date on every render.
    createdAt: '2024-03-12T09:00:00.000Z',
  };
}
