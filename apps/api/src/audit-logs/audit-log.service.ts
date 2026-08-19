import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

export interface AuditLogEntry {
  action: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  ipAddress?: string;
  metadata?: unknown;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Never let audit logging break the request it's observing — log and
  // swallow instead of throwing, since this always runs after the response
  // has already succeeded.
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          userId: entry.userId,
          ipAddress: entry.ipAddress,
          metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to write audit log entry: ${String(err)}`);
    }
  }

  async findAll(query: QueryAuditLogsDto) {
    const where = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.action ? { action: query.action } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }
}
