import { getRecentContactMessages } from '@/lib/server/contact-store';

/**
 * Server Component reading the cached, tagged list. It updates only because
 * the Server Action calls `updateTag` after a successful write.
 */
export async function RecentMessages() {
  const messages = await getRecentContactMessages();

  if (messages.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No messages yet. Send one and it appears here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li className="rounded-md border p-3" key={message.id}>
          <div className="flex items-baseline justify-between">
            <strong className="text-sm">{message.name}</strong>
            <span className="text-gray-500 text-xs">
              {new Date(message.receivedAt).toLocaleString('en-US', {
                timeZone: 'UTC',
              })}
            </span>
          </div>
          <p className="mt-1 text-gray-600 text-sm">{message.message}</p>
        </li>
      ))}
    </ul>
  );
}
