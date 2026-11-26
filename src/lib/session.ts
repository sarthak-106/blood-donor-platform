import { createHmac, timingSafeEqual } from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'lifelink-secure-jwt-secret-key-2026-safe-production';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_COOKIE = 'bdp_session';

// Blocklist for explicitly revoked tokens
const revokedTokens = new Set<string>();

export interface SessionPayload {
  userId: string;
  role?: string;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function createSession(userId: string, role?: string): string {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = createHmac('sha256', SECRET_KEY).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function getSession(token: string): { userId: string; role?: string } | null {
  if (!token || typeof token !== 'string') return null;
  if (revokedTokens.has(token)) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;

  try {
    const expectedSignature = createHmac('sha256', SECRET_KEY).update(encodedPayload).digest('base64url');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const providedBuffer = Buffer.from(providedSignature, 'utf-8');

    if (expectedBuffer.length !== providedBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.userId || !payload.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export function deleteSession(token: string): void {
  if (token && typeof token === 'string') {
    revokedTokens.add(token);
    if (revokedTokens.size > 1000) {
      const iterator = revokedTokens.values();
      for (let i = 0; i < 200; i++) {
        const next = iterator.next();
        if (next.done) break;
        revokedTokens.delete(next.value);
      }
    }
  }
}
