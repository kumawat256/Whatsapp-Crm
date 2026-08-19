import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCampaignSettingsDto } from './dto/update-campaign-settings.dto';

// Tenant-facing — every method here answers "what does MY OWN organization
// look like", scoped by an explicit organizationId the caller already
// proved ownership of (via @CurrentOrganizationId()). Organization itself
// isn't a tenant-scoped Prisma model (see tenant-scope.util.ts), so unlike
// the rest of the tenant-facing app this service filters explicitly rather
// than relying on the query-scoping extension.
@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getSelf(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        status: true,
        serviceEnabled: true,
        plan: {
          select: { name: true, credits: true, maxWhatsAppAccounts: true },
        },
        planExpiresAt: true,
        campaignBatchSize: true,
        campaignBatchIntervalMinSeconds: true,
        campaignBatchIntervalMaxSeconds: true,
      },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const [totalAdmins, totalAgents, whatsAppAccounts] = await Promise.all([
      this.prisma.user.count({
        where: { organizationId, role: { name: 'Admin' } },
      }),
      this.prisma.user.count({
        where: { organizationId, role: { name: 'Agent' } },
      }),
      this.prisma.whatsAppAccount.count({ where: { organizationId } }),
    ]);

    const {
      campaignBatchSize,
      campaignBatchIntervalMinSeconds,
      campaignBatchIntervalMaxSeconds,
      ...rest
    } = organization;

    return {
      ...rest,
      counts: { admins: totalAdmins, agents: totalAgents, whatsAppAccounts },
      campaignSettings: {
        batchSize: campaignBatchSize,
        intervalMinSeconds: campaignBatchIntervalMinSeconds,
        intervalMaxSeconds: campaignBatchIntervalMaxSeconds,
      },
    };
  }

  async updateCampaignSettings(
    organizationId: string,
    dto: UpdateCampaignSettingsDto,
  ) {
    if (dto.intervalMaxSeconds < dto.intervalMinSeconds) {
      throw new BadRequestException(
        'intervalMaxSeconds must be greater than or equal to intervalMinSeconds',
      );
    }
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        campaignBatchSize: dto.batchSize,
        campaignBatchIntervalMinSeconds: dto.intervalMinSeconds,
        campaignBatchIntervalMaxSeconds: dto.intervalMaxSeconds,
      },
    });
    return {
      batchSize: dto.batchSize,
      intervalMinSeconds: dto.intervalMinSeconds,
      intervalMaxSeconds: dto.intervalMaxSeconds,
    };
  }

  /** Every user in the org (Admin + Agent) with their own successful-send count, for the tenant dashboard's team breakdown. */
  async getTeamActivity(organizationId: string) {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        role: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const messageCounts = await this.prisma.message.groupBy({
      by: ['sentByUserId'],
      where: {
        organizationId,
        direction: 'OUTBOUND',
        status: { in: ['SENT', 'DELIVERED', 'READ'] },
        sentByUserId: { not: null },
      },
      _count: { _all: true },
    });
    const messagesByUser = new Map(
      messageCounts.map((r) => [r.sentByUserId, r._count._all]),
    );

    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      isActive: u.isActive,
      role: u.role.name,
      messagesSent: messagesByUser.get(u.id) ?? 0,
    }));
  }
}
