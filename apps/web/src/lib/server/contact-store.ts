import 'server-only';
import { cacheTag } from 'next/cache';

/**
 * Server-only store for contact submissions.
 *
 * The array below stands in for a database: it is process memory, so it is
 * emptied on restart and is not shared between instances. Swap
 * `saveContactMessage` for a real insert and the rest of the flow is unchanged.
 */

export const CONTACT_MESSAGES_TAG = 'contact-messages';

export type ContactMessage = {
  id: string;
  name: string;
  message: string;
  receivedAt: string;
};

type ContactInput = {
  name: string;
  email: string;
  message: string;
};

type StoredMessage = ContactMessage & { email: string };

const messages: StoredMessage[] = [];

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function saveContactMessage(
  input: ContactInput
): Promise<ContactMessage> {
  await simulateLatency(150);

  const stored: StoredMessage = {
    id: crypto.randomUUID(),
    name: input.name,
    // Kept server-side only; `getRecentContactMessages` never returns it.
    email: input.email,
    message: input.message,
    receivedAt: new Date().toISOString(),
  };

  messages.unshift(stored);

  return {
    id: stored.id,
    name: stored.name,
    message: stored.message,
    receivedAt: stored.receivedAt,
  };
}

/**
 * The public list of recent messages. Cached and tagged, so a Server Action
 * can invalidate exactly this read after it writes.
 */
export async function getRecentContactMessages(
  limit = 3
): Promise<ContactMessage[]> {
  'use cache';
  cacheTag(CONTACT_MESSAGES_TAG);

  await simulateLatency(100);

  // The email address is deliberately dropped before the data leaves the
  // server: the sender's address is not part of the public list.
  return messages.slice(0, limit).map(({ id, name, message, receivedAt }) => ({
    id,
    name,
    message,
    receivedAt,
  }));
}
