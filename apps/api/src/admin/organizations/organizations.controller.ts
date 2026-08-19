import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/types/jwt-payload.type';
import { Audit } from '../../audit-logs/decorators/audit.decorator';
import { OrganizationStatus } from '../../generated/prisma/enums';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ImpersonateDto } from './dto/impersonate.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { ResetOrganizationUserPasswordDto } from './dto/reset-organization-user-password.dto';
import { ToggleServiceDto } from './dto/toggle-service.dto';
import { UpdateModulesDto } from './dto/update-modules.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('admin/organizations')
@Roles('Super Admin')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@Query() query: QueryOrganizationsDto) {
    return this.organizationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @Audit('organization.create', 'Organization')
  create(@Body() dto: CreateOrganizationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.create(dto, user.id);
  }

  @Patch(':id')
  @Audit('organization.update', 'Organization')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.update(id, dto, user.id);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @Audit('organization.suspend', 'Organization')
  suspend(@Param('id') id: string) {
    return this.organizationsService.setStatus(id, OrganizationStatus.SUSPENDED);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Audit('organization.activate', 'Organization')
  activate(@Param('id') id: string) {
    return this.organizationsService.setStatus(id, OrganizationStatus.ACTIVE);
  }

  @Patch(':id/service')
  @Audit('organization.service_toggle', 'Organization')
  setService(@Param('id') id: string, @Body() dto: ToggleServiceDto) {
    return this.organizationsService.setServiceEnabled(id, dto.enabled);
  }

  @Patch(':id/modules')
  @Audit('organization.modules_update', 'Organization')
  updateModules(@Param('id') id: string, @Body() dto: UpdateModulesDto) {
    return this.organizationsService.updateModules(id, dto.modules);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @Audit('organization.user_password_reset', 'Organization')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetOrganizationUserPasswordDto,
  ) {
    return this.organizationsService.resetUserPassword(id, dto);
  }

  @Post(':id/impersonate')
  @HttpCode(HttpStatus.OK)
  @Audit('organization.impersonate', 'Organization')
  impersonate(
    @Param('id') id: string,
    @Body() dto: ImpersonateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.impersonate(id, user.id, dto.userId);
  }
}
