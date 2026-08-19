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
import { Audit } from '../audit-logs/decorators/audit.decorator';
import { PaginationQueryDto } from '../common/pagination.dto';
import { PERMISSIONS } from '../common/permissions';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Controller('automations')
@RequirePermissions(PERMISSIONS.AUTOMATIONS_MANAGE)
@RequireModule('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.automationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.automationsService.findOne(id);
  }

  @Post()
  @Audit('automation.create', 'Automation')
  create(
    @Body() dto: CreateAutomationDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.automationsService.create(dto, organizationId, user.id);
  }

  @Patch(':id')
  @Audit('automation.update', 'Automation')
  update(@Param('id') id: string, @Body() dto: UpdateAutomationDto) {
    return this.automationsService.update(id, dto);
  }

  @Delete(':id')
  @Audit('automation.delete', 'Automation')
  remove(@Param('id') id: string) {
    return this.automationsService.remove(id);
  }
}
