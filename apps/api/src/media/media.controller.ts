import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireModule } from '../auth/decorators/require-module.decorator';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { PERMISSIONS } from '../common/permissions';
import { mediaUploadOptions } from './media-upload.config';
import { MediaService } from './media.service';

@Controller('media')
@RequirePermissions(PERMISSIONS.MESSAGES_MANAGE)
@RequireModule('whatsapp')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', mediaUploadOptions))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.mediaService.upload(file, organizationId, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Get(':id/file')
  async serveFile(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType, fileName } = await this.mediaService.readFile(id);
    const disposition =
      mimeType.startsWith('image/') ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/')
        ? 'inline'
        : 'attachment';
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(fileName)}"`,
    );
    res.send(buffer);
  }
}
