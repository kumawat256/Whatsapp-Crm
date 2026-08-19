import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginationQueryDto } from '../common/pagination.dto';
import { TemplatesService } from '../templates/templates.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Injectable()
export class AutomationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.automation.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.automation.count(),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const automation = await this.prisma.automation.findUnique({
      where: { id },
    });
    if (!automation) {
      throw new NotFoundException('Automation not found');
    }
    return automation;
  }

  async create(
    dto: CreateAutomationDto,
    organizationId: string,
    createdByUserId?: string,
  ) {
    await this.assertActionConfigValid(dto.actionType, dto.actionConfig);
    return this.prisma.automation.create({
      data: {
        name: dto.name,
        triggerType: dto.triggerType,
        triggerConfig: (dto.triggerConfig ?? {}) as Prisma.InputJsonValue,
        actionType: dto.actionType,
        actionConfig: dto.actionConfig as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
        organizationId,
        createdByUserId,
      },
    });
  }

  async update(id: string, dto: UpdateAutomationDto) {
    const current = await this.findOne(id);
    if (dto.actionType || dto.actionConfig) {
      await this.assertActionConfigValid(
        dto.actionType ??
          (current.actionType as CreateAutomationDto['actionType']),
        (dto.actionConfig ??
          (current.actionConfig as Record<string, unknown>)) as Record<
          string,
          unknown
        >,
      );
    }
    return this.prisma.automation.update({
      where: { id },
      data: {
        name: dto.name,
        triggerType: dto.triggerType,
        triggerConfig: dto.triggerConfig as Prisma.InputJsonValue | undefined,
        actionType: dto.actionType,
        actionConfig: dto.actionConfig as Prisma.InputJsonValue | undefined,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.automation.delete({ where: { id } });
  }

  private async assertActionConfigValid(
    actionType: string,
    actionConfig: Record<string, unknown>,
  ) {
    if (actionType === 'send_template') {
      const templateId = actionConfig.templateId;
      if (typeof templateId !== 'string') {
        throw new BadRequestException(
          'send_template requires actionConfig.templateId',
        );
      }
      await this.templatesService.findOne(templateId); // throws 404 if unknown
    }
  }
}
