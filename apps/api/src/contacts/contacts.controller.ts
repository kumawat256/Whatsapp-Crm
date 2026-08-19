import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireModule } from '../auth/decorators/require-module.decorator';
import { PERMISSIONS } from '../common/permissions';
import { csvUploadOptions } from '../common/csv-upload.config';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
@RequirePermissions(PERMISSIONS.CONTACTS_MANAGE)
@RequireModule('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Query() query: QueryContactsDto) {
    return this.contactsService.findAll(query);
  }

  @Get('export')
  async export(@Query() query: QueryContactsDto, @Res() res: Response) {
    const csv = await this.contactsService.exportCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="contacts-export.csv"',
    );
    res.send(csv);
  }

  @Get('import/template')
  importTemplate(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="contacts-import-template.csv"',
    );
    res.send(this.contactsService.csvTemplate());
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', csvUploadOptions))
  importCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.contactsService.importCsv(file.buffer, organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateContactDto,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.contactsService.create(dto, organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  @Post(':id/opt-out')
  optOut(@Param('id') id: string) {
    return this.contactsService.setOptedOut(id, true);
  }

  @Post(':id/opt-in')
  optIn(@Param('id') id: string) {
    return this.contactsService.setOptedOut(id, false);
  }
}
