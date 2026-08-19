import { randomBytes } from 'node:crypto';

// Same shape as the one-off multi-tenant backfill script's bootstrap
// password: URL-safe, no padding, printed/returned exactly once.
export function generateRandomPassword(): string {
  return randomBytes(9).toString('base64url');
}
