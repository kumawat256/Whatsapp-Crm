import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { useEncryptedFileAuthState } from './encrypted-file-auth-state';

describe('useEncryptedFileAuthState', () => {
  let dir: string;
  const key = randomBytes(32);

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'wa-session-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('persists creds encrypted at rest and round-trips them back', async () => {
    const { state, saveCreds } = await useEncryptedFileAuthState(dir, key);
    await saveCreds();

    const files = await readdir(dir);
    expect(files).toContain('creds.json');

    const raw = await readFile(join(dir, 'creds.json'));
    // Encrypted output must not be parseable JSON — proves it's not the
    // plaintext Baileys would otherwise write.
    expect(() => JSON.parse(raw.toString('utf8'))).toThrow();

    const { state: reloaded } = await useEncryptedFileAuthState(dir, key);
    expect(reloaded.creds.noiseKey.public).toEqual(state.creds.noiseKey.public);
    expect(reloaded.creds.registrationId).toBe(state.creds.registrationId);
  });

  it('treats a wrong key as unreadable state rather than exposing stale data', async () => {
    const { state: original, saveCreds } = await useEncryptedFileAuthState(
      dir,
      key,
    );
    await saveCreds();

    // Same fallback Baileys itself uses for a corrupt/missing creds.json:
    // GCM auth-tag verification fails, so it's read as "no creds yet"
    // rather than crashing or leaking ciphertext-derived data.
    const wrongKey = randomBytes(32);
    const { state: withWrongKey } = await useEncryptedFileAuthState(
      dir,
      wrongKey,
    );
    expect(withWrongKey.creds.registrationId).not.toBe(
      original.creds.registrationId,
    );
  });

  it('stores and retrieves signal keys via get/set', async () => {
    const { state } = await useEncryptedFileAuthState(dir, key);
    const sessionBytes = randomBytes(16);

    await state.keys.set({ session: { 'device-1': sessionBytes } });
    const result = await state.keys.get('session', ['device-1']);

    expect(result['device-1']).toEqual(sessionBytes);
  });

  it('removing a key deletes its file', async () => {
    const { state } = await useEncryptedFileAuthState(dir, key);
    await state.keys.set({ session: { 'device-1': randomBytes(16) } });
    expect(await readdir(dir)).toContain('session-device-1.json');

    await state.keys.set({ session: { 'device-1': null } });
    expect(await readdir(dir)).not.toContain('session-device-1.json');
  });
});
