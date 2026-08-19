import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import AsyncLock from 'async-lock';
import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys';
import type {
  AuthenticationState,
  SignalDataSet,
  SignalDataTypeMap,
} from '@whiskeysockets/baileys';

// Same shape as Baileys' own `useMultiFileAuthState`, except every file's
// contents are AES-256-GCM encrypted before hitting disk — this is what
// backs WhatsAppSession.sessionData being "encrypted at rest" per the
// schema. `key` must be 32 bytes (see SESSION_ENCRYPTION_KEY in env).

const fileLock = new AsyncLock({ maxPending: Infinity });

function encrypt(plaintext: string, key: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
}

function decrypt(blob: Buffer, key: Buffer): string {
  const iv = blob.subarray(0, 12);
  const authTag = blob.subarray(12, 28);
  const ciphertext = blob.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

function fixFileName(file: string): string {
  return file.replace(/\//g, '__').replace(/:/g, '-');
}

export async function useEncryptedFileAuthState(
  folder: string,
  encryptionKey: Buffer,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const writeData = (data: unknown, file: string) => {
    const filePath = join(folder, fixFileName(file));
    const serialized = JSON.stringify(data, BufferJSON.replacer);
    return fileLock.acquire(filePath, () =>
      writeFile(filePath, encrypt(serialized, encryptionKey)),
    );
  };

  const readData = async (file: string) => {
    try {
      const filePath = join(folder, fixFileName(file));
      const blob = await fileLock.acquire(filePath, () => readFile(filePath));
      return JSON.parse(decrypt(blob, encryptionKey), BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const removeData = async (file: string) => {
    try {
      const filePath = join(folder, fixFileName(file));
      await fileLock.acquire(filePath, () => rm(filePath, { force: true }));
    } catch {
      // already gone — fine.
    }
  };

  const folderInfo = await stat(folder).catch(() => undefined);
  if (folderInfo) {
    if (!folderInfo.isDirectory()) {
      throw new Error(`found something that is not a directory at ${folder}`);
    }
  } else {
    await mkdir(folder, { recursive: true });
  }

  const creds = (await readData('creds.json')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[],
        ) => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}.json`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            }),
          );
          return data;
        },
        set: async (data: SignalDataSet) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            const key = category as keyof SignalDataSet;
            for (const id in data[key]) {
              const value = data[key]?.[id];
              const file = `${category}-${id}.json`;
              tasks.push(value ? writeData(value, file) : removeData(file));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData(creds, 'creds.json'),
  };
}
