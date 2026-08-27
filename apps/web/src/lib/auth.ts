import 'server-only';

/**
 * Stand-in for real authentication.
 *
 * A production version verifies a signed token (its signature, its expiry, its
 * issuer) and looks the subject up. This one only demonstrates the shape: a
 * request either carries a credential that resolves to a user, or it does not,
 * and the caller decides what to do about it.
 */

export type AuthenticatedUser = {
  id: string;
  role: 'user' | 'admin';
};

/** The only token this demo accepts, standing in for a verified session. */
const DEMO_TOKENS: Record<string, AuthenticatedUser> = {
  'demo-user-token': {
    id: '3f4c9c1e-6b1e-4f9a-9a3d-6b2f8c5d1a70',
    role: 'user',
  },
  'demo-admin-token': {
    id: '8a2b7d40-1c55-4c3e-b8a1-2f9e4d6c0b31',
    role: 'admin',
  },
};

export function verifyAuth(request: Request): AuthenticatedUser | null {
  const header = request.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  const token = header.slice('Bearer '.length).trim();

  return DEMO_TOKENS[token] ?? null;
}

/**
 * Authorisation is a separate question from authentication: this user is who
 * they say they are, but may they act on this record?
 */
export function canActOnBehalfOf(
  user: AuthenticatedUser,
  userId: string
): boolean {
  return user.role === 'admin' || user.id === userId;
}
