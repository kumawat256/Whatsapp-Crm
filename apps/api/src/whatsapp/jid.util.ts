const WHATSAPP_USER_SUFFIX = '@s.whatsapp.net';

/** "+1 555 123 4567" -> "15551234567@s.whatsapp.net" */
export function phoneToJid(phoneNumber: string): string {
  const digitsOnly = phoneNumber.replace(/[^\d]/g, '');
  return `${digitsOnly}${WHATSAPP_USER_SUFFIX}`;
}

/** "15551234567:12@s.whatsapp.net" -> "+15551234567" (strips the device suffix) */
export function jidToPhone(jid: string): string {
  const withoutServer = jid.split('@')[0];
  const withoutDevice = withoutServer.split(':')[0];
  return `+${withoutDevice}`;
}
