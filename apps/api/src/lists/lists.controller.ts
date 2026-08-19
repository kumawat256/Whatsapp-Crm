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
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { RequireModule } from '../auth/decorators/require-module.decorator';
import { PERMISSIONS } from '../common/permissions';
import { PaginationQueryDto } from '../common/pagination.dto';
import { AddMembersDto } from './dto/add-members.dto';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ListsService } from './lists.service';

@Controller('lists')
@RequirePermissions(PERMISSIONS.LISTS_MANAGE)
@RequireModule('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findAll() {
    return this.listsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listsService.findOne(id);
  }

  @Get(':id/members')
  members(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.listsService.members(id, query);
  }

  @Post()
  create(
    @Body() dto: CreateListDto,
    @CurrentOrganizationId() organizationId: string,
  ) {
    return this.listsService.create(dto, organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListDto) {
    return this.listsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listsService.remove(id);
  }

  @Post(':id/members')
  addMembers(@Param('id') id: string, @Body() dto: AddMembersDto) {
    return this.listsService.addMembers(id, dto);
  }

  @Delete(':id/members/:contactId')
  removeMember(@Param('id') id: string, @Param('contactId') contactId: string) {
    return this.listsService.removeMember(id, contactId);
  }
}
