import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TREND_DAYS = 7;
const CREDIT_SPEND_WINDOW_DAYS = 30;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Local-date label, deliberately not toISOString() — that converts to UTC
// first, which mislabels the day in any timezone ahead of UTC (local
// midnight becomes the previous day once shifted to UTC).
function localDateLabel(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalContacts,
      optedOutContacts,
      totalConversations,
      unreadConversations,
      messagesSent,
      messagesFailed,
      totalCampaigns,
      runningCampaigns,
      completedCampaigns,
      recipientsSent,
      recipientsFailed,
      wallet,
      creditsSpent,
      totalAccounts,
      connectedAccounts,
      totalUsers,
      activeUsers,
      messagesLast7Days,
    ] = await Promise.all([
      this.prisma.contact.count(),
      this.prisma.contact.count({ where: { isOptedOut: true } }),
      this.prisma.conversation.count(),
      this.prisma.conversation.count({ where: { unreadCount: { gt: 0 } } }),
      this.prisma.message.count({
        where: {
          direction: 'OUTBOUND',
          status: { in: ['SENT', 'DELIVERED', 'READ'] },
        },
      }),
      this.prisma.message.count({
        where: { direction: 'OUTBOUND', status: 'FAILED' },
      }),
      this.prisma.campaign.count(),
      this.prisma.campaign.count({ where: { status: 'RUNNING' } }),
      this.prisma.campaign.count({ where: { status: 'COMPLETED' } }),
      this.prisma.campaignRecipient.count({
        where: { status: { in: ['SENT', 'DELIVERED', 'READ'] } },
      }),
      this.prisma.campaignRecipient.count({ where: { status: 'FAILED' } }),
      this.prisma.creditWallet.findFirst(),
      this.prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'DEBIT',
          createdAt: {
            gte: new Date(
              Date.now() - CREDIT_SPEND_WINDOW_DAYS * 24 * 60 * 60 * 1000,
            ),
          },
        },
      }),
      this.prisma.whatsAppAccount.count(),
      this.prisma.whatsAppAccount.count({ where: { status: 'CONNECTED' } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.getMessageTrend(TREND_DAYS),
    ]);

    return {
      contacts: { total: totalContacts, optedOut: optedOutContacts },
      conversations: { total: totalConversations, unread: unreadConversations },
      messages: {
        sent: messagesSent,
        failed: messagesFailed,
        last7Days: messagesLast7Days,
      },
      campaigns: {
        total: totalCampaigns,
        running: runningCampaigns,
        completed: completedCampaigns,
        recipientsSent,
        recipientsFailed,
      },
      credits: {
        balance: wallet?.balance ?? 0,
        spentLast30Days: creditsSpent._sum.amount ?? 0,
      },
      whatsapp: { totalAccounts, connectedAccounts },
      users: { total: totalUsers, active: activeUsers },
    };
  }

  private async getMessageTrend(days: number) {
    const today = startOfDay(new Date());
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (days - 1));
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + 1);

    // One query for the whole window instead of one `count()` per day —
    // bucketed in memory since the row volume for a 7-day window is small
    // and this keeps the date-truncation logic portable across DBs.
    const rows = await this.prisma.message.findMany({
      where: {
        direction: 'OUTBOUND',
        status: { in: ['SENT', 'DELIVERED', 'READ'] },
        createdAt: { gte: rangeStart, lt: rangeEnd },
      },
      select: { createdAt: true },
    });
    const countByDate = new Map<string, number>();
    for (const row of rows) {
      const label = localDateLabel(row.createdAt);
      countByDate.set(label, (countByDate.get(label) ?? 0) + 1);
    }

    const results: { date: string; sent: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const label = localDateLabel(dayStart);
      results.push({ date: label, sent: countByDate.get(label) ?? 0 });
    }
    return results;
  }
}
