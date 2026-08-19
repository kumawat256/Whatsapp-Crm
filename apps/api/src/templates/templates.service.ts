import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginationQueryDto } from '../common/pagination.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import {
  contactVariables,
  extractVariables,
  renderTemplate,
} from './template-render.util';

const templateInclude = { media: true } as const;

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.template.findMany({
        include: templateInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.template.count(),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: templateInclude,
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async create(
    dto: CreateTemplateDto,
    organizationId: string,
    createdByUserId?: string,
  ) {
    const existing = await this.prisma.template.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A template with this name already exists');
    }
    return this.prisma.template.create({
      data: {
        name: dto.name,
        category: dto.category,
        body: dto.body,
        mediaId: dto.mediaId,
        isActive: dto.isActive ?? true,
        variables: extractVariables(dto.body),
        organizationId,
        createdByUserId,
      },
      include: templateInclude,
    });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const template = await this.findOne(id);
    return this.prisma.template.update({
      where: { id },
      data: {
        ...dto,
        variables:
          dto.body !== undefined
            ? extractVariables(dto.body)
            : (template.variables ?? undefined),
      },
      include: templateInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.template.delete({ where: { id } });
  }

  async preview(id: string, variables: Record<string, string> = {}) {
    const template = await this.findOne(id);
    return renderTemplate(template.body, variables);
  }

  /** Used by the campaign engine: merges standard contact fields with any campaign-level extras. */
  async renderForContact(
    templateId: string,
    contact: {
      firstName: string;
      lastName?: string | null;
      phoneNumber: string;
    },
    extraVariables: Record<string, string> = {},
  ) {
    const template = await this.findOne(templateId);
    return renderTemplate(template.body, {
      ...contactVariables(contact),
      ...extraVariables,
    });
  }
}
