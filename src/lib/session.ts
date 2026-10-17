import { randomUUID } from 'crypto';

// In-memory session store (can be connected to Redis or DB table in production)
const sessionStore = new Map<string, { userId: string; expiresAt: number }>();
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_COOKIE = 'bdp_session';

export function createSession(userId: string): string {
  const sessionId = randomUUID();
  sessionStore.set(sessionId, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return sessionId;
}

export function getSession(sessionId: string): { userId: string } | null {
  const session = sessionStore.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(sessionId);
    return null;
  }
  return { userId: session.userId };
}

export function deleteSession(sessionId: string): void {
  sessionStore.delete(sessionId);
}
