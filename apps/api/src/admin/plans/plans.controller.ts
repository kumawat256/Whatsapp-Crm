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
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Audit } from '../../audit-logs/decorators/audit.decorator';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlansService } from './plans.service';

@Controller('admin/plans')
@Roles('Super Admin')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Post()
  @Audit('plan.create', 'Plan')
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @Audit('plan.update', 'Plan')
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Audit('plan.delete', 'Plan')
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
