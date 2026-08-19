import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024;

// The .csv extension is the only reliable signal here: browsers report all
// sorts of mimetypes for a plain CSV file (text/csv, application/vnd.ms-excel,
// often just text/plain), so mimetype can only be used to reject, never to
// accept — it can't tell a real CSV apart from any other text/plain upload.
//
// No `storage` set — multer defaults to in-memory buffering (file.buffer),
// which is all a CSV import needs; nothing is written to /storage here.
export const csvUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_CSV_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      callback(new BadRequestException('Only .csv files are accepted'), false);
      return;
    }
    callback(null, true);
  },
};
