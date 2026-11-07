import { createHmac, randomInt } from 'crypto';

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'blood-donor-platform-captcha-secret-key-2026';
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface CaptchaChallenge {
  token: string;
  question: string;
}

/**
 * Generate a new CAPTCHA challenge with an HMAC-signed token.
 */
export function generateCaptcha(): CaptchaChallenge {
  const a = randomInt(3, 19);
  const b = randomInt(2, 12);
  const isAddition = Math.random() > 0.35;
  const answer = isAddition ? a + b : a - b;
  const question = isAddition ? `${a} + ${b} = ?` : `${a} - ${b} = ?`;
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;

  const payload = `${answer}:${expiresAt}`;
  const signature = createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');

  return { token, question };
}

/**
 * Verify a user's answer against the signed CAPTCHA token.
 */
export function verifyCaptcha(token: string | undefined | null, answer: string | number | undefined | null): { valid: boolean; error?: string } {
  if (!token || answer === undefined || answer === null || String(answer).trim() === '') {
    return { valid: false, error: 'CAPTCHA verification is required.' };
  }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid CAPTCHA token format.' };
    }

    const [expectedAnswerStr, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) {
      return { valid: false, error: 'CAPTCHA has expired. Please refresh and try again.' };
    }

    const expectedPayload = `${expectedAnswerStr}:${expiresAtStr}`;
    const expectedSig = createHmac('sha256', CAPTCHA_SECRET).update(expectedPayload).digest('hex');

    if (signature !== expectedSig) {
      return { valid: false, error: 'CAPTCHA token verification failed.' };
    }

    const numericAnswer = parseInt(String(answer).trim(), 10);
    const numericExpected = parseInt(expectedAnswerStr, 10);

    if (numericAnswer !== numericExpected) {
      return { valid: false, error: 'Incorrect CAPTCHA answer. Please try again.' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Error validating CAPTCHA challenge.' };
  }
}
