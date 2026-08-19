import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination.dto';
import { CampaignRecipientStatus } from '../generated/prisma/enums';
import { CampaignRunnerService } from './campaign-runner.service';
import { AddRecipientsDto } from './dto/add-recipients.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { QueryCampaignsDto } from './dto/query-campaigns.dto';
import { RelaunchCampaignDto } from './dto/relaunch-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import {
  CAMPAIGN_RECIPIENT_PROCESSED_EVENT,
  CampaignRecipientProcessedEvent,
} from './events/campaign.events';

const campaignInclude = {
  template: { select: { id: true, name: true } },
  whatsAppAccount: {
    select: { id: true, label: true, phoneNumber: true, status: true },
  },
} as const;

const ALL_RECIPIENT_STATUSES: CampaignRecipientStatus[] = [
  'PENDING',
  'QUEUED',
  'SENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'SKIPPED_OPTOUT',
  'CANCELLED',
];

const ACTIVE_RECIPIENT_STATUSES: CampaignRecipientStatus[] = [
  'PENDING',
  'QUEUED',
  'SENDING',
];
const LAUNCHED_STATUSES = ['DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED'];

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly runnerService: CampaignRunnerService,
  ) {}

  async findAll(query: QueryCampaignsDto) {
    const where = query.status ? { status: query.status as never } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.campaign.findMany({
        where,
        include: campaignInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.campaign.count({ where }),
    ]);
    const decorated = await this.decorateManyWithCounts(data);
    return paginate(decorated, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: campaignInclude,
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return this.decorateWithCounts(campaign);
  }

  async recipients(
    campaignId: string,
    query: QueryCampaignsDto & { status?: string },
  ) {
    await this.getRaw(campaignId);
    const where = {
      campaignId,
      ...(query.status ? { status: query.status as never } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.campaignRecipient.findMany({
        where,
        include: { contact: true },
        orderBy: { createdAt: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.campaignRecipient.count({ where }),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }

  async create(
    dto: CreateCampaignDto,
    organizationId: string,
    createdByUserId: string,
  ) {
    const template = await this.prisma.template.findUnique({
      where: { id: dto.templateId },
    });
    if (!template) throw new NotFoundException('Template not found');
    const account = await this.prisma.whatsAppAccount.findUnique({
      where: { id: dto.whatsAppAccountId },
    });
    if (!account) throw new NotFoundException('WhatsApp account not found');

    const campaign = await this.prisma.campaign.create({
      data: {
        name: dto.name,
        templateId: dto.templateId,
        whatsAppAccountId: dto.whatsAppAccountId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        organizationId,
        createdByUserId,
      },
      include: campaignInclude,
    });
    return this.decorateWithCounts(campaign);
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.getRaw(id);
    if (campaign.status !== 'DRAFT') {
      throw new BadRequestException('Only draft campaigns can be edited');
    }
    const updated = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: campaignInclude,
    });
    return this.decorateWithCounts(updated);
  }

  async remove(id: string) {
    const campaign = await this.getRaw(id);
    if (
      LAUNCHED_STATUSES.includes(campaign.status) &&
      campaign.status !== 'DRAFT'
    ) {
      throw new BadRequestException(
        'Cancel a running campaign before deleting it',
      );
    }
    await this.prisma.campaign.delete({ where: { id } });
  }

  async preview(campaignId: string, dto: AddRecipientsDto) {
    await this.getRaw(campaignId);
    const contactIds = await this.resolveContactIds(dto);
    if (contactIds.length === 0) {
      return {
        totalContacts: 0,
        excludedOptedOut: 0,
        alreadyAdded: 0,
        estimatedRecipients: 0,
      };
    }

    const contacts = await this.prisma.contact.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, isOptedOut: true },
    });
    const existing = new Set(
      (
        await this.prisma.campaignRecipient.findMany({
          where: { campaignId, contactId: { in: contactIds } },
          select: { contactId: true },
        })
      ).map((r) => r.contactId),
    );

    let excludedOptedOut = 0;
    let alreadyAdded = 0;
    let estimatedRecipients = 0;
    for (const contact of contacts) {
      if (existing.has(contact.id)) {
        alreadyAdded += 1;
      } else if (contact.isOptedOut) {
        excludedOptedOut += 1;
      } else {
        estimatedRecipients += 1;
      }
    }

    return {
      totalContacts: contacts.length,
      excludedOptedOut,
      alreadyAdded,
      estimatedRecipients,
    };
  }

  async addRecipients(campaignId: string, dto: AddRecipientsDto) {
    const campaign = await this.getRaw(campaignId);
    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      throw new BadRequestException(
        'Recipients can only be added to a draft or scheduled campaign',
      );
    }

    const contactIds = await this.resolveContactIds(dto);
    if (contactIds.length === 0) {
      throw new BadRequestException('No contacts matched the given selection');
    }

    const contacts = await this.prisma.contact.findMany({
      where: { id: { in: contactIds } },
    });
    await this.prisma.campaignRecipient.createMany({
      data: contacts.map((c) => ({
        campaignId,
        contactId: c.id,
        status: c.isOptedOut ? 'SKIPPED_OPTOUT' : 'PENDING',
        organizationId: campaign.organizationId,
      })),
      skipDuplicates: true,
    });

    return this.findOne(campaignId);
  }

  /**
   * Copies a completed campaign into a fresh DRAFT-then-RUNNING campaign:
   * same template, same WhatsApp account, same recipient list (re-checked
   * against each contact's current opt-out state, since that can have
   * changed since the original run) — only the name is new. Immediately
   * launches, matching "relaunch" rather than "duplicate as draft".
   */
  async relaunch(
    id: string,
    dto: RelaunchCampaignDto,
    organizationId: string,
    createdByUserId: string,
  ) {
    const source = await this.getRaw(id);
    if (source.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Only a completed campaign can be relaunched',
      );
    }

    const sourceRecipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId: id },
      select: { contactId: true },
    });
    if (sourceRecipients.length === 0) {
      throw new BadRequestException('This campaign has no recipients to copy');
    }

    const contacts = await this.prisma.contact.findMany({
      where: { id: { in: sourceRecipients.map((r) => r.contactId) } },
      select: { id: true, isOptedOut: true },
    });
    if (contacts.every((c) => c.isOptedOut)) {
      throw new BadRequestException(
        'Every contact in this campaign has opted out since — nothing to relaunch',
      );
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        name: dto.name,
        templateId: source.templateId,
        whatsAppAccountId: source.whatsAppAccountId,
        organizationId,
        createdByUserId,
      },
    });

    await this.prisma.campaignRecipient.createMany({
      data: contacts.map((c) => ({
        campaignId: campaign.id,
        contactId: c.id,
        status: c.isOptedOut ? 'SKIPPED_OPTOUT' : 'PENDING',
        organizationId,
      })),
    });

    return this.startRunning(campaign.id);
  }

  async launch(id: string) {
    const campaign = await this.getRaw(id);
    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      throw new BadRequestException('Campaign has already been launched');
    }
    const pendingCount = await this.prisma.campaignRecipient.count({
      where: { campaignId: id, status: 'PENDING' },
    });
    if (pendingCount === 0) {
      throw new BadRequestException('Add recipients before launching');
    }

    if (campaign.scheduledAt && campaign.scheduledAt.getTime() > Date.now()) {
      await this.prisma.campaign.update({
        where: { id },
        data: { status: 'SCHEDULED' },
      });
      return this.findOne(id);
    }

    return this.startRunning(id);
  }

  /** Called on manual launch and by the scheduler when a SCHEDULED campaign comes due. */
  async startRunning(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            campaignBatchSize: true,
            campaignBatchIntervalMinSeconds: true,
            campaignBatchIntervalMaxSeconds: true,
          },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING', startedAt: campaign.startedAt ?? new Date() },
    });

    const pending = await this.prisma.campaignRecipient.findMany({
      where: { campaignId: id, status: 'PENDING' },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (pending.length > 0) {
      await this.runnerService.enqueueMany(
        pending.map((r) => r.id),
        campaign.organization.campaignBatchSize,
        campaign.organization.campaignBatchIntervalMinSeconds,
        campaign.organization.campaignBatchIntervalMaxSeconds,
      );
    }
    return this.findOne(id);
  }

  async pause(id: string) {
    const campaign = await this.getRaw(id);
    if (campaign.status !== 'RUNNING') {
      throw new BadRequestException('Only a running campaign can be paused');
    }
    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
    return this.findOne(id);
  }

  async resume(id: string) {
    const campaign = await this.getRaw(id);
    if (campaign.status !== 'PAUSED') {
      throw new BadRequestException('Only a paused campaign can be resumed');
    }
    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
    return this.findOne(id);
  }

  async cancel(id: string) {
    const campaign = await this.getRaw(id);
    if (!LAUNCHED_STATUSES.includes(campaign.status)) {
      throw new BadRequestException('Campaign has already finished');
    }
    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });
    await this.prisma.campaignRecipient.updateMany({
      where: { campaignId: id, status: { in: ACTIVE_RECIPIENT_STATUSES } },
      data: { status: 'CANCELLED' },
    });
    return this.findOne(id);
  }

  async emergencyStopAll() {
    const running = await this.prisma.campaign.findMany({
      where: { status: { in: ['RUNNING', 'PAUSED', 'SCHEDULED'] } },
      select: { id: true },
    });
    for (const campaign of running) {
      await this.cancel(campaign.id);
    }
    return { stopped: running.length };
  }

  @OnEvent(CAMPAIGN_RECIPIENT_PROCESSED_EVENT)
  async handleRecipientProcessed(event: CampaignRecipientProcessedEvent) {
    const remaining = await this.prisma.campaignRecipient.count({
      where: {
        campaignId: event.campaignId,
        status: { in: ACTIVE_RECIPIENT_STATUSES },
      },
    });
    if (remaining > 0) return;

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: event.campaignId },
    });
    if (campaign && campaign.status === 'RUNNING') {
      await this.prisma.campaign.update({
        where: { id: event.campaignId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }
  }

  async insights(id: string) {
    const campaign = await this.getRaw(id);
    const { recipientCounts, totalRecipients } =
      await this.decorateWithCounts(campaign);

    const delivered = recipientCounts.DELIVERED + recipientCounts.READ;
    const sent = recipientCounts.SENT + delivered;
    const failed = recipientCounts.FAILED;
    const pending =
      recipientCounts.PENDING + recipientCounts.QUEUED + recipientCounts.SENDING;
    const finished = totalRecipients - pending;

    const recipientsWithMessage = await this.prisma.campaignRecipient.findMany(
      {
        where: { campaignId: id, messageId: { not: null } },
        select: { messageId: true },
      },
    );
    const messageIds = recipientsWithMessage
      .map((r) => r.messageId)
      .filter((id): id is string => !!id);
    const creditAgg =
      messageIds.length > 0
        ? await this.prisma.creditTransaction.aggregate({
            where: {
              type: 'DEBIT',
              referenceType: 'Message',
              referenceId: { in: messageIds },
            },
            _sum: { amount: true },
          })
        : { _sum: { amount: 0 } };
    const creditsUsed = creditAgg._sum.amount ?? 0;

    const durationSeconds =
      campaign.startedAt
        ? Math.round(
            ((campaign.completedAt ?? new Date()).getTime() -
              campaign.startedAt.getTime()) /
              1000,
          )
        : null;

    return {
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      totalRecipients,
      sent,
      delivered,
      failed,
      pending,
      skippedOptOut: recipientCounts.SKIPPED_OPTOUT,
      cancelled: recipientCounts.CANCELLED,
      deliveryRate: finished > 0 ? sent / finished : 0,
      failureRate: finished > 0 ? failed / finished : 0,
      creditsUsed,
      startedAt: campaign.startedAt,
      completedAt: campaign.completedAt,
      durationSeconds,
    };
  }

  /** Full per-recipient CSV — who got the message, who didn't, and why. */
  async exportReport(id: string): Promise<string> {
    await this.getRaw(id);
    const recipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId: id },
      include: { contact: { select: { firstName: true, lastName: true, phoneNumber: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const rows = recipients.map((r) => ({
      name: `${r.contact.firstName} ${r.contact.lastName ?? ''}`.trim(),
      phoneNumber: r.contact.phoneNumber,
      status: r.status,
      sentAt: r.sentAt ? r.sentAt.toISOString() : '',
      errorMessage: r.errorMessage ?? '',
    }));

    return stringify(rows, {
      header: true,
      columns: ['name', 'phoneNumber', 'status', 'sentAt', 'errorMessage'],
    });
  }

  private async getRaw(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  private async resolveContactIds(dto: AddRecipientsDto): Promise<string[]> {
    const ids = new Set<string>();
    dto.contactIds?.forEach((id) => ids.add(id));

    if (dto.listIds?.length) {
      const members = await this.prisma.listMember.findMany({
        where: { listId: { in: dto.listIds } },
        select: { contactId: true },
      });
      members.forEach((m) => ids.add(m.contactId));
    }
    return Array.from(ids);
  }

  private async decorateWithCounts<T extends { id: string }>(campaign: T) {
    const groups = await this.prisma.campaignRecipient.groupBy({
      by: ['status'],
      where: { campaignId: campaign.id },
      _count: true,
    });
    const recipientCounts = Object.fromEntries(
      ALL_RECIPIENT_STATUSES.map((s) => [s, 0]),
    ) as Record<CampaignRecipientStatus, number>;
    let totalRecipients = 0;
    for (const g of groups) {
      recipientCounts[g.status] = g._count;
      totalRecipients += g._count;
    }
    return { ...campaign, recipientCounts, totalRecipients };
  }

  /** Same as decorateWithCounts, but one groupBy for the whole page instead of one per row. */
  private async decorateManyWithCounts<T extends { id: string }>(
    campaigns: T[],
  ) {
    if (campaigns.length === 0) return [];
    const groups = await this.prisma.campaignRecipient.groupBy({
      by: ['campaignId', 'status'],
      where: { campaignId: { in: campaigns.map((c) => c.id) } },
      _count: true,
    });
    const byCampaign = new Map<
      string,
      { recipientCounts: Record<CampaignRecipientStatus, number>; totalRecipients: number }
    >();
    for (const g of groups) {
      let entry = byCampaign.get(g.campaignId);
      if (!entry) {
        entry = {
          recipientCounts: Object.fromEntries(
            ALL_RECIPIENT_STATUSES.map((s) => [s, 0]),
          ) as Record<CampaignRecipientStatus, number>,
          totalRecipients: 0,
        };
        byCampaign.set(g.campaignId, entry);
      }
      entry.recipientCounts[g.status] = g._count;
      entry.totalRecipients += g._count;
    }
    return campaigns.map((c) => {
      const counts = byCampaign.get(c.id) ?? {
        recipientCounts: Object.fromEntries(
          ALL_RECIPIENT_STATUSES.map((s) => [s, 0]),
        ) as Record<CampaignRecipientStatus, number>,
        totalRecipients: 0,
      };
      return { ...c, ...counts };
    });
  }
}
