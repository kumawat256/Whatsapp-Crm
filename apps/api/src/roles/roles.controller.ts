import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Audit } from '../audit-logs/decorators/audit.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

// Role is a global table shared by every tenant — editing "Agent"/"Admin"
// here changes that role's permissions for EVERY organization on the
// platform at once, and the list itself includes the Super Admin role. So
// this is Super Admin only, not a tenant-facing capability (tenant Admins
// just use the two fixed system roles — see UsersService.assignableRoles).
@Controller()
@Roles('Super Admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get('roles')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('roles/:id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post('roles')
  @Audit('role.create', 'Role')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch('roles/:id')
  @Audit('role.update', 'Role')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete('roles/:id')
  @Audit('role.delete', 'Role')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
