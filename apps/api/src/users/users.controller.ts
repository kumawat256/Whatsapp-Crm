import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PERMISSIONS } from '../common/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { Audit } from '../audit-logs/decorators/audit.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@RequirePermissions(PERMISSIONS.USERS_MANAGE)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('assignable-roles')
  assignableRoles() {
    return this.usersService.assignableRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Audit('user.create', 'User')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createWithRoleName(dto);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    };
  }

  @Patch(':id')
  @Audit('user.update', 'User')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.update(id, dto, user.id);
  }

  @Post(':id/reset-password')
  @Audit('user.password_reset', 'User')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto.newPassword);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Audit('user.delete', 'User')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.remove(id, user.id);
  }
}
