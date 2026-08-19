import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.plan.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A plan with this name already exists');
    }
    return this.prisma.plan.create({ data: dto });
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.prisma.plan.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('A plan with this name already exists');
      }
    }
    return this.prisma.plan.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.organization.count({
      where: { planId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `This plan can’t be deleted — ${inUse} organization(s) are still on it.`,
      );
    }
    await this.prisma.plan.delete({ where: { id } });
  }
}
