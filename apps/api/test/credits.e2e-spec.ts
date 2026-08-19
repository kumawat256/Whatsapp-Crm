import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  cleanupTenant,
  createTenantAdmin,
  loginSuperAdmin,
  TenantFixture,
} from './helpers/tenant-fixture';

describe('Credits (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
  const suffix = Date.now();
  let adminToken: string;

  const contactPhone = `+1777${suffix}`;
  let contactId: string;
  let accountId: string;
  let conversationId: string;
  let walletId: string;
  let templateId: string;
  let campaignId: string;
  let superAdminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api', { exclude: ['health'] });
    await app.init();

    prisma = app.get(PrismaService);
    tenant = await createTenantAdmin(app, prisma, 'Credits Test');
    adminToken = tenant.token;
    superAdminToken = await loginSuperAdmin(app);

    const contact = await prisma.contact.create({
      data: {
        firstName: 'Credits',
        lastName: 'Test',
        phoneNumber: contactPhone,
        organizationId: tenant.organizationId,
      },
    });
    contactId = contact.id;

    const account = await prisma.whatsAppAccount.create({
      data: {
        label: `Credits Test Account ${suffix}`,
        organizationId: tenant.organizationId,
      },
    });
    accountId = account.id;

    const conversation = await prisma.conversation.create({
      data: {
        contactId,
        whatsAppAccountId: accountId,
        organizationId: tenant.organizationId,
      },
    });
    conversationId = conversation.id;

    const template = await prisma.template.create({
      data: {
        name: `Credits Report Template ${suffix}`,
        body: 'Hi {{firstName}}',
        organizationId: tenant.organizationId,
      },
    });
    templateId = template.id;
    const campaign = await prisma.campaign.create({
      data: {
        name: `Credits Report Campaign ${suffix}`,
        templateId,
        whatsAppAccountId: accountId,
        organizationId: tenant.organizationId,
      },
    });
    campaignId = campaign.id;

    // A fresh tenant's wallet is lazily created at balance 0 on first
    // access (see CreditsService.getOrCreateWallet) — no drain-to-baseline
    // dance needed like the old single-shared-wallet version of this suite.
    const walletRes = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    walletId = walletRes.body.id;
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/api/credits/wallet').expect(401);
  });

  it('starts at a zero balance', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.balance).toBe(0);
  });

  it('refuses to send a message when the wallet is empty, even if connected', async () => {
    await prisma.whatsAppAccount.update({
      where: { id: accountId },
      data: { status: 'CONNECTED' },
    });

    const res = await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'TEXT', content: 'Hello there' })
      .expect(400);
    expect(res.body.message).toMatch(/insufficient credits/i);

    const messages = await prisma.message.findMany({
      where: { conversationId },
    });
    expect(messages).toHaveLength(0); // rejected before a Message row is even created
  });

  it('blocks sending once the plan has expired, before even checking credits', async () => {
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { planExpiresAt: new Date(Date.now() - 1000) },
    });

    const res = await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'TEXT', content: 'Should not send' })
      .expect(400);
    expect(res.body.message).toMatch(/plan has expired/i);

    // Clear it so the rest of this suite isn't affected by the expiry.
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { planExpiresAt: null },
    });
  });

  it('has no self-serve top-up endpoint — only Super Admin can add credits', async () => {
    await request(app.getHttpServer())
      .post('/api/credits/topup')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10, reason: 'Should not be possible' })
      .expect(404);
  });

  it('Super Admin tops up the wallet and the tenant sees the CREDIT transaction', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/admin/organizations/${tenant.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'CREDIT', amount: 10, reason: 'E2E top-up' })
      .expect(201);
    expect(res.body.balance).toBe(10);

    const wallet = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(wallet.body.balance).toBe(10);

    const tx = await request(app.getHttpServer())
      .get('/api/credits/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(tx.body.data[0]).toMatchObject({
      type: 'CREDIT',
      amount: 10,
      reason: 'E2E top-up',
      balanceAfter: 10,
    });
  });

  it('does not charge for a message that fails to send', async () => {
    // Account is CONNECTED in our DB but has no real Baileys session, so the
    // provider call itself throws — this exercises "insufficient credits" no
    // longer blocking, while confirming a failed send isn't charged.
    const res = await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'TEXT', content: 'Hello there' })
      .expect(201);
    expect(res.body.status).toBe('FAILED');

    const wallet = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(wallet.body.balance).toBe(10); // unchanged — no DEBIT for a failed send
  });

  it('filters the transaction ledger by type', async () => {
    // Scoped to "every returned row really is DEBIT", not "zero DEBIT rows
    // exist" — this suite shares a real dev database with manual/live
    // testing, so other DEBIT activity (e.g. real message sends) can
    // legitimately exist outside this test's own fixtures.
    const res = await request(app.getHttpServer())
      .get('/api/credits/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ type: 'DEBIT' })
      .expect(200);
    expect(
      res.body.data.every((tx: { type: string }) => tx.type === 'DEBIT'),
    ).toBe(true);
  });

  it("returns a 7-day trend of this org's own credit consumption", async () => {
    const res = await request(app.getHttpServer())
      .get('/api/credits/trend')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body).toHaveLength(7);
    for (const day of res.body) {
      expect(typeof day.date).toBe('string');
      expect(typeof day.creditsConsumed).toBe('number');
    }
  });

  describe('message usage report', () => {
    // Simulated directly rather than through a real send — this environment
    // has no live WhatsApp session, so every real send fails before
    // reaching the debit step (see "does not charge for a message that
    // fails to send" above). Creating the Message + CreditTransaction pair
    // by hand exercises exactly what a real successful send would have
    // produced, without needing Baileys.
    let manualMessageId: string;
    let automationMessageId: string;
    let campaignMessageId: string;
    const reportSuffix = `${suffix}-report`;

    beforeAll(async () => {
      const me = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const adminId = me.body.id;

      const manualMessage = await prisma.message.create({
        data: {
          conversationId,
          whatsAppAccountId: accountId,
          direction: 'OUTBOUND',
          type: 'TEXT',
          content: `manual ${reportSuffix}`,
          status: 'SENT',
          sentByUserId: adminId,
          organizationId: tenant.organizationId,
        },
      });
      manualMessageId = manualMessage.id;

      const automationMessage = await prisma.message.create({
        data: {
          conversationId,
          whatsAppAccountId: accountId,
          direction: 'OUTBOUND',
          type: 'TEXT',
          content: `automation ${reportSuffix}`,
          status: 'SENT',
          organizationId: tenant.organizationId,
        },
      });
      automationMessageId = automationMessage.id;

      const campaignMessage = await prisma.message.create({
        data: {
          conversationId,
          whatsAppAccountId: accountId,
          direction: 'OUTBOUND',
          type: 'TEXT',
          content: `campaign ${reportSuffix}`,
          status: 'SENT',
          organizationId: tenant.organizationId,
        },
      });
      campaignMessageId = campaignMessage.id;
      await prisma.campaignRecipient.create({
        data: {
          campaignId,
          contactId,
          status: 'SENT',
          messageId: campaignMessage.id,
          organizationId: tenant.organizationId,
        },
      });

      for (const messageId of [
        manualMessageId,
        automationMessageId,
        campaignMessageId,
      ]) {
        const wallet = await prisma.creditWallet.findUniqueOrThrow({
          where: { id: walletId },
        });
        await prisma.$transaction([
          prisma.creditWallet.update({
            where: { id: walletId },
            data: { balance: { decrement: 1 } },
          }),
          prisma.creditTransaction.create({
            data: {
              walletId,
              organizationId: tenant.organizationId,
              type: 'DEBIT',
              amount: 1,
              reason: 'WhatsApp message sent',
              referenceType: 'Message',
              referenceId: messageId,
              balanceAfter: wallet.balance - 1,
            },
          }),
        ]);
      }
    });

    it('classifies each debit by how the send was triggered', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/credits/message-usage-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ pageSize: 50 })
        .expect(200);

      const rows: { source: string }[] = res.body.data.filter(
        (row: { contactName: string }) => row.contactName === 'Credits Test',
      );
      expect(rows).toHaveLength(3);

      const bySource = Object.fromEntries(rows.map((r) => [r.source, r]));
      expect(bySource.MANUAL).toBeDefined();
      expect(bySource.AUTOMATION).toBeDefined();
      expect(bySource.CAMPAIGN).toBeDefined();

      const campaignRow = rows.find((r) => r.source === 'CAMPAIGN') as {
        source: string;
        campaignName?: string;
        contactPhone?: string;
      };
      expect(campaignRow.campaignName).toBe(
        `Credits Report Campaign ${suffix}`,
      );
      expect(campaignRow.contactPhone).toBe(contactPhone);
    });

    it('filters the report by date range', async () => {
      const future = new Date(Date.now() + 60_000).toISOString();
      const res = await request(app.getHttpServer())
        .get('/api/credits/message-usage-report')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ from: future })
        .expect(200);
      expect(
        res.body.data.some(
          (row: { contactName: string }) => row.contactName === 'Credits Test',
        ),
      ).toBe(false);
    });
  });
});
