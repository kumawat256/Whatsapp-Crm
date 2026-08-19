import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaType } from '../generated/prisma/enums';
import { resolveStoragePath } from '../common/storage-path.util';
import { PrismaService } from '../prisma/prisma.service';

const MIME_CATEGORY: { prefix: string; type: MediaType; dir: string }[] = [
  { prefix: 'image/', type: MediaType.IMAGE, dir: 'images' },
  { prefix: 'video/', type: MediaType.VIDEO, dir: 'videos' },
  { prefix: 'audio/', type: MediaType.AUDIO, dir: 'audio' },
];

function categorize(mimetype: string): { type: MediaType; dir: string } {
  const match = MIME_CATEGORY.find((c) => mimetype.startsWith(c.prefix));
  return match
    ? { type: match.type, dir: match.dir }
    : { type: MediaType.DOCUMENT, dir: 'documents' };
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  upload(
    file: Express.Multer.File,
    organizationId: string,
    uploadedByUserId?: string,
  ) {
    return this.persist(
      file.buffer,
      file.mimetype,
      file.originalname,
      organizationId,
      uploadedByUserId,
    );
  }

  /** For media that arrived via WhatsApp itself, not an operator upload. */
  saveIncoming(
    buffer: Buffer,
    mimetype: string,
    fileName: string,
    organizationId: string,
  ) {
    return this.persist(buffer, mimetype, fileName, organizationId);
  }

  private async persist(
    buffer: Buffer,
    mimetype: string,
    originalFileName: string,
    organizationId: string,
    uploadedByUserId?: string,
  ) {
    const { type, dir } = categorize(mimetype);
    const targetDir = resolveStoragePath(this.config, 'media', dir);
    await mkdir(targetDir, { recursive: true });

    const fileName = `${randomUUID()}${extname(originalFileName) || ''}`;
    const absolutePath = join(targetDir, fileName);
    await writeFile(absolutePath, buffer);

    const checksum = createHash('sha256').update(buffer).digest('hex');

    return this.prisma.media.create({
      data: {
        type,
        filePath: join('media', dir, fileName),
        fileName: originalFileName,
        mimeType: mimetype,
        sizeBytes: buffer.byteLength,
        checksum,
        organizationId,
        uploadedByUserId,
      },
    });
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async readFile(
    id: string,
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    const media = await this.findOne(id);
    const buffer = await readFile(
      resolveStoragePath(this.config, media.filePath),
    );
    return { buffer, mimeType: media.mimeType, fileName: media.fileName };
  }

  absolutePath(filePath: string): string {
    return resolveStoragePath(this.config, filePath);
  }
}
