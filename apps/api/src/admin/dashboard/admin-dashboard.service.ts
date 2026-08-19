import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/pagination.dto';
import { dateRangeWhere, resolveDateRange } from '../../common/date-range.util';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

const SENT_STATUSES = ['SENT', 'DELIVERED', 'READ'] as const;
const TREND_DAYS = 7;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Local-date label, deliberately not toISOString() — matches
// analytics.service.ts's reasoning: converting to UTC first mislabels
// "today" in any timezone ahead of UTC.
function localDateLabel(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(query: QueryDashboardDto) {
    const dateWhere = dateRangeWhere(resolveDateRange(query));

    const [
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      messagesSent,
      messagesFailed,
      creditsConsumed,
      totalWhatsAppAccounts,
      connectedWhatsAppAccounts,
      totalContacts,
      totalAdmins,
      totalAgents,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { status: 'ACTIVE' } }),
      this.prisma.organization.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.message.count({
        where: {
          direction: 'OUTBOUND',
          status: { in: [...SENT_STATUSES] },
          ...dateWhere,
        },
      }),
      this.prisma.message.count({
        where: { direction: 'OUTBOUND', status: 'FAILED', ...dateWhere },
      }),
      this.prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: { type: 'DEBIT', ...dateWhere },
      }),
      this.prisma.whatsAppAccount.count(),
      this.prisma.whatsAppAccount.count({ where: { status: 'CONNECTED' } }),
      this.prisma.contact.count(),
      this.prisma.user.count({ where: { role: { name: 'Admin' } } }),
      this.prisma.user.count({ where: { role: { name: 'Agent' } } }),
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        suspended: suspendedCustomers,
      },
      messages: { sent: messagesSent, failed: messagesFailed },
      credits: { consumed: creditsConsumed._sum.amount ?? 0 },
      whatsapp: {
        totalAccounts: totalWhatsAppAccounts,
        connectedAccounts: connectedWhatsAppAccounts,
      },
      contacts: { total: totalContacts },
      users: { totalAdmins, totalAgents },
    };
  }

  async getUsage(query: QueryDashboardDto) {
    const dateWhere = dateRangeWhere(resolveDateRange(query));

    const [organizations, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          plan: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.organization.count(),
    ]);

    const orgIds = organizations.map((o) => o.id);
    const [
      messageCounts,
      creditSums,
      contactCounts,
      campaignCounts,
      waCounts,
      agentCounts,
      wallets,
    ] =
      orgIds.length === 0
        ? [[], [], [], [], [], [], []]
        : await Promise.all([
            this.prisma.message.groupBy({
              by: ['organizationId'],
              where: {
                organizationId: { in: orgIds },
                direction: 'OUTBOUND',
                status: { in: [...SENT_STATUSES] },
                ...dateWhere,
              },
              _count: { _all: true },
            }),
            this.prisma.creditTransaction.groupBy({
              by: ['organizationId'],
              where: { organizationId: { in: orgIds }, type: 'DEBIT', ...dateWhere },
              _sum: { amount: true },
            }),
            this.prisma.contact.groupBy({
              by: ['organizationId'],
              where: { organizationId: { in: orgIds } },
              _count: { _all: true },
            }),
            this.prisma.campaign.groupBy({
              by: ['organizationId'],
              where: { organizationId: { in: orgIds } },
              _count: { _all: true },
            }),
            this.prisma.whatsAppAccount.groupBy({
              by: ['organizationId'],
              where: { organizationId: { in: orgIds } },
              _count: { _all: true },
            }),
            this.prisma.user.groupBy({
              by: ['organizationId'],
              where: { organizationId: { in: orgIds }, role: { name: 'Agent' } },
              _count: { _all: true },
            }),
            this.prisma.creditWallet.findMany({
              where: { organizationId: { in: orgIds } },
              select: { organizationId: true, balance: true },
            }),
          ]);

    const messagesByOrg = new Map(
      messageCounts.map((r) => [r.organizationId, r._count._all]),
    );
    const creditsByOrg = new Map(
      creditSums.map((r) => [r.organizationId, r._sum.amount ?? 0]),
    );
    const contactsByOrg = new Map(
      contactCounts.map((r) => [r.organizationId, r._count._all]),
    );
    const campaignsByOrg = new Map(
      campaignCounts.map((r) => [r.organizationId, r._count._all]),
    );
    const whatsAppAccountsByOrg = new Map(
      waCounts.map((r) => [r.organizationId, r._count._all]),
    );
    const agentsByOrg = new Map(
      agentCounts.map((r) => [r.organizationId, r._count._all]),
    );
    const balanceByOrg = new Map(wallets.map((w) => [w.organizationId, w.balance]));

    const data = organizations.map((o) => ({
      id: o.id,
      name: o.name,
      status: o.status,
      plan: o.plan?.name ?? null,
      messagesSent: messagesByOrg.get(o.id) ?? 0,
      creditsConsumed: creditsByOrg.get(o.id) ?? 0,
      contacts: contactsByOrg.get(o.id) ?? 0,
      campaigns: campaignsByOrg.get(o.id) ?? 0,
      whatsAppAccounts: whatsAppAccountsByOrg.get(o.id) ?? 0,
      agents: agentsByOrg.get(o.id) ?? 0,
      creditBalance: balanceByOrg.get(o.id) ?? 0,
    }));

    return paginate(data, total, query.page, query.pageSize);
  }

  /** Platform-wide daily messages-sent + credits-consumed for the last TREND_DAYS days. */
  async getTrend() {
    const today = startOfDay(new Date());
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (TREND_DAYS - 1));
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + 1);

    // Two queries for the whole window instead of 2*TREND_DAYS — bucketed
    // in memory since the row volume for a 7-day window is small and this
    // keeps the date-truncation logic portable across DBs.
    const [messages, transactions] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          direction: 'OUTBOUND',
          status: { in: [...SENT_STATUSES] },
          createdAt: { gte: rangeStart, lt: rangeEnd },
        },
        select: { createdAt: true },
      }),
      this.prisma.creditTransaction.findMany({
        where: { type: 'DEBIT', createdAt: { gte: rangeStart, lt: rangeEnd } },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const messagesByDate = new Map<string, number>();
    for (const m of messages) {
      const label = localDateLabel(m.createdAt);
      messagesByDate.set(label, (messagesByDate.get(label) ?? 0) + 1);
    }
    const creditsByDate = new Map<string, number>();
    for (const t of transactions) {
      const label = localDateLabel(t.createdAt);
      creditsByDate.set(label, (creditsByDate.get(label) ?? 0) + t.amount);
    }

    const results: { date: string; messagesSent: number; creditsConsumed: number }[] = [];
    for (let i = TREND_DAYS - 1; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const label = localDateLabel(dayStart);
      results.push({
        date: label,
        messagesSent: messagesByDate.get(label) ?? 0,
        creditsConsumed: creditsByDate.get(label) ?? 0,
      });
    }

    return results;
  }
}
