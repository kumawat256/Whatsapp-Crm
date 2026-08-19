import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
      include: {
        updatedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  findOne(key: string) {
    return this.prisma.systemSetting.findUnique({ where: { key } });
  }

  upsert(key: string, value: unknown, updatedByUserId: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue, updatedByUserId },
      create: { key, value: value as Prisma.InputJsonValue, updatedByUserId },
    });
  }
}
