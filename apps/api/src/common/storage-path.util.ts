import { resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';

/**
 * Resolves a path under STORAGE_ROOT against process.cwd() — apps/api in
 * both dev (`nest start`) and prod (`node dist/main`, run from apps/api).
 * Same convention every STORAGE_ROOT consumer should use.
 */
export function resolveStoragePath(
  config: ConfigService,
  ...segments: string[]
): string {
  const root = resolve(process.cwd(), config.get<string>('STORAGE_ROOT')!);
  return resolve(root, ...segments);
}
