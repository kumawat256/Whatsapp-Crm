import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const MAX_MEDIA_SIZE_BYTES = 20 * 1024 * 1024;

// Explicit allow-list, not a block-list — mirrors what WhatsApp itself
// accepts for personal-app media, and keeps anything executable/script-like
// out regardless of how it's disguised.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/3gpp',
  'video/quicktime',
  'audio/mpeg',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/amr',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
]);

// No `storage` set — multer defaults to in-memory buffering (file.buffer);
// MediaService writes the buffer to /storage itself once validated.
export const mediaUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_MEDIA_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new BadRequestException(`Unsupported file type: ${file.mimetype}`),
        false,
      );
      return;
    }
    callback(null, true);
  },
};
