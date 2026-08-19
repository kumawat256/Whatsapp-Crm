import { jidToPhone, phoneToJid } from './jid.util';

describe('jid.util', () => {
  it('converts an E.164 phone number to a WhatsApp JID', () => {
    expect(phoneToJid('+1 555 123 4567')).toBe('15551234567@s.whatsapp.net');
    expect(phoneToJid('+15551234567')).toBe('15551234567@s.whatsapp.net');
  });

  it('converts a JID back to an E.164-style phone number', () => {
    expect(jidToPhone('15551234567@s.whatsapp.net')).toBe('+15551234567');
  });

  it('strips the multi-device suffix from a JID', () => {
    expect(jidToPhone('15551234567:12@s.whatsapp.net')).toBe('+15551234567');
  });

  it('round-trips a phone number through both conversions', () => {
    const phone = '+15551234567';
    expect(jidToPhone(phoneToJid(phone))).toBe(phone);
  });
});
