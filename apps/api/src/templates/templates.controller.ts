import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentOrganizationId } from '../auth/decorators/current-organization-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireModule } from '../auth/decorators/require-module.decorator';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { PaginationQueryDto } from '../common/pagination.dto';
import { PERMISSIONS } from '../common/permissions';
import { CreateTemplateDto } from './dto/create-template.dto';
import { PreviewTemplateDto } from './dto/preview-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplatesService } from './templates.service';

@Controller('templates')
@RequirePermissions(PERMISSIONS.TEMPLATES_MANAGE)
@RequireModule('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.templatesService.create(dto, organizationId, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @Post(':id/preview')
  preview(@Param('id') id: string, @Body() dto: PreviewTemplateDto) {
    return this.templatesService.preview(id, dto.variables);
  }
}
