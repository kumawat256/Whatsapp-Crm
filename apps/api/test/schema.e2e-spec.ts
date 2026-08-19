import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Data model (e2e)', () => {
  let prisma: PrismaService;
  const suffix = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    prisma = moduleFixture.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('walks the full contact -> conversation -> message -> campaign -> credit graph', async () => {
    const org = await prisma.organization.create({
      data: { name: `Schema Test Org ${suffix}` },
    });

    const account = await prisma.whatsAppAccount.create({
      data: { label: 'Test Line', organizationId: org.id },
    });

    const list = await prisma.list.create({
      data: { name: `Launch list ${suffix}`, organizationId: org.id },
    });

    const contact = await prisma.contact.create({
      data: {
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: `+1555${suffix}`,
        organizationId: org.id,
        lists: { create: [{ listId: list.id, organizationId: org.id }] },
      },
      include: {
        lists: { include: { list: true } },
      },
    });
    expect(contact.lists[0].list.name).toBe(`Launch list ${suffix}`);

    const conversation = await prisma.conversation.create({
      data: {
        whatsAppAccountId: account.id,
        contactId: contact.id,
        organizationId: org.id,
      },
    });

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        whatsAppAccountId: account.id,
        organizationId: org.id,
        direction: 'OUTBOUND',
        type: 'TEXT',
        content: 'Hello from the schema test',
        status: 'SENT',
      },
    });

    const template = await prisma.template.create({
      data: {
        name: `Welcome ${suffix}`,
        body: 'Hi {{firstName}}, welcome!',
        variables: ['firstName'],
        organizationId: org.id,
      },
    });

    const campaign = await prisma.campaign.create({
      data: {
        name: `Launch campaign ${suffix}`,
        organizationId: org.id,
        templateId: template.id,
        whatsAppAccountId: account.id,
      },
    });

    const recipient = await prisma.campaignRecipient.create({
      data: {
        campaignId: campaign.id,
        contactId: contact.id,
        status: 'SENT',
        messageId: message.id,
        organizationId: org.id,
      },
    });
    expect(recipient.messageId).toBe(message.id);

    // Credits: debit inside a transaction, keeping balanceAfter consistent.
    const wallet = await prisma.creditWallet.create({
      data: { balance: 100, organizationId: org.id },
    });
    const debited = await prisma.$transaction(async (tx) => {
      const updated = await tx.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: 1 } },
      });
      return tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          organizationId: org.id,
          type: 'DEBIT',
          amount: 1,
          reason: 'CAMPAIGN_SEND',
          referenceType: 'CampaignRecipient',
          referenceId: recipient.id,
          balanceAfter: updated.balance,
        },
      });
    });
    expect(debited.balanceAfter).toBe(99);

    const auditLog = await prisma.auditLog.create({
      data: {
        action: 'campaign.recipient.sent',
        entityType: 'CampaignRecipient',
        entityId: recipient.id,
        metadata: { campaignId: campaign.id },
      },
    });
    expect(auditLog.id).toEqual(expect.any(String));

    // Cleanup in FK-safe order.
    await prisma.auditLog.delete({ where: { id: auditLog.id } });
    await prisma.creditTransaction.deleteMany({
      where: { walletId: wallet.id },
    });
    await prisma.creditWallet.delete({ where: { id: wallet.id } });
    await prisma.campaignRecipient.delete({ where: { id: recipient.id } });
    await prisma.campaign.delete({ where: { id: campaign.id } });
    await prisma.template.delete({ where: { id: template.id } });
    await prisma.message.delete({ where: { id: message.id } });
    await prisma.conversation.delete({ where: { id: conversation.id } });
    await prisma.contact.delete({ where: { id: contact.id } });
    await prisma.list.delete({ where: { id: list.id } });
    await prisma.whatsAppAccount.delete({ where: { id: account.id } });
    await prisma.organization.delete({ where: { id: org.id } });
  });

  it('paginates contacts with skip/take', async () => {
    const org = await prisma.organization.create({
      data: { name: `Pagination Org ${suffix}` },
    });
    const contacts = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        prisma.contact.create({
          data: {
            firstName: `Bulk${i}`,
            phoneNumber: `+1777${suffix}${i}`,
            organizationId: org.id,
          },
        }),
      ),
    );

    const page1 = await prisma.contact.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'asc' },
      skip: 0,
      take: 2,
    });
    const page2 = await prisma.contact.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'asc' },
      skip: 2,
      take: 2,
    });

    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(2);
    expect(page1[0].id).not.toBe(page2[0].id);

    await prisma.contact.deleteMany({
      where: { id: { in: contacts.map((c) => c.id) } },
    });
    await prisma.organization.delete({ where: { id: org.id } });
  });
});
