// Loosely E.164: a leading "+" (the actual signal we care about — a bare
// local number with no country code silently produces a broken WhatsApp
// JID, see phoneToJid) followed by 7-20 digits. Deliberately wider than the
// real E.164 15-digit cap so it doesn't reject legitimate numbers on a
// technicality; WhatsApp itself (via onWhatsApp()) is the final authority
// on whether a number is real.
export const PHONE_NUMBER_PATTERN = /^\+[1-9]\d{6,19}$/;

export function isValidPhoneNumber(value: string): boolean {
  return PHONE_NUMBER_PATTERN.test(value);
}

// This deployment is India-only, so a number typed without a country code
// is assumed to be a local Indian one. Applied wherever a phone number is
// written (single add/edit, CSV import) so "forgot the +91" never has to
// be caught by hand — see the country-code contact-matching bug this
// exact gap caused.
const INDIA_COUNTRY_CODE = '91';

export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) return trimmed;

  // Strip everything but digits, then a leading trunk-prefix "0" some
  // people type out of habit (e.g. "06377720778") — it's never part of
  // the actual number once a country code is added.
  const digitsOnly = trimmed.replace(/\D/g, '').replace(/^0+/, '');

  if (digitsOnly.startsWith(INDIA_COUNTRY_CODE) && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }
  return `+${INDIA_COUNTRY_CODE}${digitsOnly}`;
}
