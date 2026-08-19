import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

async function waitFor(
  check: () => Promise<boolean>,
  timeoutMs = 8000,
  intervalMs = 150,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

describe('Campaigns + DB-backed runner (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
  const suffix = Date.now();
  let adminToken: string;

  let templateId: string;
  let accountId: string;
  const contactPhones = [
    `+1666${suffix}1`,
    `+1666${suffix}2`,
    `+1666${suffix}3`,
  ];
  let contactIds: string[];
  let optedOutContactId: string;

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

    tenant = await createTenantAdmin(app, prisma, 'Campaigns Test');
    adminToken = tenant.token;

    const template = await prisma.template.create({
      data: {
        name: `E2E Campaign Template ${suffix}`,
        body: 'Hi {{firstName}}, this is a test.',
        organizationId: tenant.organizationId,
      },
    });
    templateId = template.id;

    const account = await prisma.whatsAppAccount.create({
      data: {
        label: `E2E Campaign Account ${suffix}`,
        status: 'DISCONNECTED',
        organizationId: tenant.organizationId,
      },
    });
    accountId = account.id;

    const contacts = await Promise.all(
      contactPhones.map((phone, i) =>
        prisma.contact.create({
          data: {
            firstName: `Recipient${i}`,
            phoneNumber: phone,
            organizationId: tenant.organizationId,
          },
        }),
      ),
    );
    contactIds = contacts.map((c) => c.id);

    const optedOut = await prisma.contact.create({
      data: {
        firstName: 'OptedOut',
        phoneNumber: `+1666${suffix}9`,
        isOptedOut: true,
        organizationId: tenant.organizationId,
      },
    });
    optedOutContactId = optedOut.id;
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/api/campaigns').expect(401);
  });

  it('404s when creating a campaign against an unknown template or account', async () => {
    await request(app.getHttpServer())
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'x', templateId: 'nope', whatsAppAccountId: accountId })
      .expect(404);
    await request(app.getHttpServer())
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'x', templateId, whatsAppAccountId: 'nope' })
      .expect(404);
  });

  it('creates a campaign in DRAFT with zero recipients', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E Campaign ${suffix}`,
        templateId,
        whatsAppAccountId: accountId,
      })
      .expect(201);
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.totalRecipients).toBe(0);
    (globalThis as { __campaignId?: string }).__campaignId = res.body.id;
  });

  it('rejects the old per-campaign delay/limit fields — those are org-level settings now', async () => {
    await request(app.getHttpServer())
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E Rejected ${suffix}`,
        templateId,
        whatsAppAccountId: accountId,
        retryLimit: 1,
      })
      .expect(400);
  });

  it('previews recipient resolution: excludes opted-out, counts correctly', async () => {
    const campaignId = (globalThis as { __campaignId?: string }).__campaignId!;
    const res = await request(app.getHttpServer())
      .post(`/api/campaigns/${campaignId}/preview`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ contactIds: [...contactIds, optedOutContactId] })
      .expect(200);
    expect(res.body).toEqual({
      totalContacts: 4,
      excludedOptedOut: 1,
      alreadyAdded: 0,
      estimatedRecipients: 3,
    });
  });

  it('cannot launch before adding recipients', async () => {
    const campaignId = (globalThis as { __campaignId?: string }).__campaignId!;
    await request(app.getHttpServer())
      .post(`/api/campaigns/${campaignId}/launch`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });

  it('adds recipients, skipping the opted-out contact', async () => {
    const campaignId = (globalThis as { __campaignId?: string }).__campaignId!;
    const res = await request(app.getHttpServer())
      .post(`/api/campaigns/${campaignId}/recipients`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ contactIds: [...contactIds, optedOutContactId] })
      .expect(201);
    expect(res.body.totalRecipients).toBe(4);
    expect(res.body.recipientCounts.PENDING).toBe(3);
    expect(res.body.recipientCounts.SKIPPED_OPTOUT).toBe(1);
  });

  it('launches, sends once to everyone via the campaign runner against a disconnected account (no retry), and auto-completes', async () => {
    const campaignId = (globalThis as { __campaignId?: string }).__campaignId!;
    const launchRes = await request(app.getHttpServer())
      .post(`/api/campaigns/${campaignId}/launch`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(launchRes.body.status).toBe('RUNNING');

    // A single attempt is always terminal now (no retry-on-failure), so this
    // resolves as soon as the runner's tick picks the batch up.
    await waitFor(async () => {
      const campaign = await prisma.campaign.findUniqueOrThrow({
        where: { id: campaignId },
      });
      return campaign.status === 'COMPLETED';
    });

    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId, contactId: { in: contactIds } },
    });
    expect(recipients).toHaveLength(3);
    for (const r of recipients) {
      expect(r.status).toBe('FAILED');
      expect(r.attempts).toBe(1);
      expect(r.errorMessage).toMatch(/not connected/i);
    }

    // No retry-failed endpoint exists anymore — a failure is permanent.
    await request(app.getHttpServer())
      .post(`/api/campaigns/${campaignId}/retry-failed`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  }, 15000);

  it('exports a per-recipient CSV report after completion', async () => {
    const campaignId = (globalThis as { __campaignId?: string }).__campaignId!;
    const res = await request(app.getHttpServer())
      .get(`/api/campaigns/${campaignId}/export`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(
      new RegExp(`campaign-${campaignId}-report\\.csv`),
    );
    const lines = res.text.trim().split('\n');
    expect(lines[0]).toBe('name,phoneNumber,status,sentAt,errorMessage');
    // header + 4 recipients (3 real contacts + the opted-out one)
    expect(lines).toHaveLength(5);
    const failedLines = lines.slice(1).filter((l) => l.includes('FAILED'));
    expect(failedLines).toHaveLength(3);
    for (const line of failedLines) {
      expect(line).toMatch(/not connected/i);
    }
  });

  it('reports insights for a completed campaign', async () => {
    const campaignId = (globalThis as { __campaignId?: string }).__campaignId!;
    const res = await request(app.getHttpServer())
      .get(`/api/campaigns/${campaignId}/insights`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.totalRecipients).toBe(4);
    expect(res.body.failed).toBe(3);
    expect(res.body.skippedOptOut).toBe(1);
    expect(res.body.sent).toBe(0);
    expect(res.body.delivered).toBe(0);
    expect(res.body.pending).toBe(0);
    // Every send failed (disconnected account), so nothing was ever charged.
    expect(res.body.creditsUsed).toBe(0);
    expect(res.body.startedAt).toEqual(expect.any(String));
    expect(res.body.completedAt).toEqual(expect.any(String));
    expect(res.body.durationSeconds).toEqual(expect.any(Number));
  });

  describe('relaunch', () => {
    it('refuses to relaunch a campaign that has never run', async () => {
      const draft = await prisma.campaign.create({
        data: {
          name: `E2E Relaunch Draft ${suffix}`,
          templateId,
          whatsAppAccountId: accountId,
          organizationId: tenant.organizationId,
        },
      });
      await request(app.getHttpServer())
        .post(`/api/campaigns/${draft.id}/relaunch`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Should not work' })
        .expect(400);
      await prisma.campaign.delete({ where: { id: draft.id } });
    });

    it('copies a completed campaign into a new one with the same template, account, and recipients, and launches it', async () => {
      const campaignId = (globalThis as { __campaignId?: string }).__campaignId!;
      const res = await request(app.getHttpServer())
        .post(`/api/campaigns/${campaignId}/relaunch`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `E2E Relaunch Copy ${suffix}` })
        .expect(200);

      expect(res.body.id).not.toBe(campaignId);
      expect(res.body.name).toBe(`E2E Relaunch Copy ${suffix}`);
      expect(res.body.templateId).toBe(templateId);
      expect(res.body.whatsAppAccountId).toBe(accountId);
      expect(res.body.status).toBe('RUNNING');
      const newCampaignId = res.body.id as string;

      await waitFor(async () => {
        const c = await prisma.campaign.findUniqueOrThrow({ where: { id: newCampaignId } });
        return c.status === 'COMPLETED';
      });

      const recipients = await prisma.campaignRecipient.findMany({
        where: { campaignId: newCampaignId },
      });
      expect(recipients).toHaveLength(4); // same 4 as the source campaign
      expect(recipients.filter((r) => r.status === 'SKIPPED_OPTOUT')).toHaveLength(1);
      expect(recipients.filter((r) => r.status === 'FAILED')).toHaveLength(3);

      await prisma.campaignRecipient.deleteMany({ where: { campaignId: newCampaignId } });
      await prisma.campaign.delete({ where: { id: newCampaignId } });
    }, 15000);
  });

  it('sends in batches, with a random pause between batches, per the org’s campaign settings', async () => {
    // Deterministic: min === max collapses the "random" interval to exactly
    // 1s, and a batch size of 2 forces 3 recipients into two batches.
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: {
        campaignBatchSize: 2,
        campaignBatchIntervalMinSeconds: 1,
        campaignBatchIntervalMaxSeconds: 1,
      },
    });

    const template = await prisma.template.create({
      data: {
        name: `E2E Batch Template ${suffix}`,
        body: 'Hi {{firstName}}',
        organizationId: tenant.organizationId,
      },
    });
    const campaign = await prisma.campaign.create({
      data: {
        name: `E2E Batch Campaign ${suffix}`,
        templateId: template.id,
        whatsAppAccountId: accountId,
        organizationId: tenant.organizationId,
      },
    });
    await prisma.campaignRecipient.createMany({
      data: contactIds.map((contactId) => ({
        campaignId: campaign.id,
        contactId,
        status: 'PENDING',
        organizationId: tenant.organizationId,
      })),
    });

    await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.id}/launch`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // enqueueMany runs synchronously inside launch(), so the stamps are
    // already there the instant the response comes back.
    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId: campaign.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(recipients).toHaveLength(3);
    const [first, second, third] = recipients.map((r) => r.scheduledFor!.getTime());
    expect(Math.abs(second - first)).toBeLessThan(200); // same batch
    const gap = third - first;
    expect(gap).toBeGreaterThanOrEqual(900); // next batch, ~1s later
    expect(gap).toBeLessThan(2500);

    await waitFor(async () => {
      const c = await prisma.campaign.findUniqueOrThrow({ where: { id: campaign.id } });
      return c.status === 'COMPLETED';
    });
    const finished = await prisma.campaignRecipient.findMany({
      where: { campaignId: campaign.id },
    });
    for (const r of finished) {
      expect(r.status).toBe('FAILED');
      expect(r.attempts).toBe(1);
    }

    await prisma.campaignRecipient.deleteMany({ where: { campaignId: campaign.id } });
    await prisma.campaign.delete({ where: { id: campaign.id } });
    await prisma.template.delete({ where: { id: template.id } });
    // Restore defaults so later tests aren't affected by this org's tweak.
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: {
        campaignBatchSize: 5,
        campaignBatchIntervalMinSeconds: 5,
        campaignBatchIntervalMaxSeconds: 10,
      },
    });
  }, 15000);

  it('pauses and resumes a fresh running campaign without processing while paused', async () => {
    const campaign = await prisma.campaign.create({
      data: {
        name: `E2E Pause Campaign ${suffix}`,
        templateId,
        whatsAppAccountId: accountId,
        organizationId: tenant.organizationId,
      },
    });
    await prisma.campaignRecipient.createMany({
      data: contactIds.map((contactId) => ({
        campaignId: campaign.id,
        contactId,
        status: 'PENDING',
        organizationId: tenant.organizationId,
      })),
    });

    await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.id}/launch`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const pauseRes = await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.id}/pause`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(pauseRes.body.status).toBe('PAUSED');

    const resumeRes = await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.id}/resume`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(resumeRes.body.status).toBe('RUNNING');

    await waitFor(async () => {
      const c = await prisma.campaign.findUniqueOrThrow({
        where: { id: campaign.id },
      });
      return c.status === 'COMPLETED';
    });

    await prisma.campaignRecipient.deleteMany({
      where: { campaignId: campaign.id },
    });
    await prisma.campaign.delete({ where: { id: campaign.id } });
  }, 15000);

  it('cancels a running campaign and marks remaining recipients cancelled', async () => {
    // A large org-level interval keeps only the first batch's worth of
    // recipients due immediately, giving cancel() a real chance to land
    // before everything drains — same intent as the old per-campaign delay.
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { campaignBatchSize: 1, campaignBatchIntervalMinSeconds: 30, campaignBatchIntervalMaxSeconds: 30 },
    });
    const campaign = await prisma.campaign.create({
      data: {
        name: `E2E Cancel Campaign ${suffix}`,
        templateId,
        whatsAppAccountId: accountId,
        organizationId: tenant.organizationId,
      },
    });
    await prisma.campaignRecipient.createMany({
      data: contactIds.map((contactId) => ({
        campaignId: campaign.id,
        contactId,
        status: 'PENDING',
        organizationId: tenant.organizationId,
      })),
    });

    await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.id}/launch`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const cancelRes = await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.id}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(cancelRes.body.status).toBe('CANCELLED');

    // The very first recipient's job has zero enqueue delay, so it can race
    // cancel() and finish (FAILED, disconnected account) before the queue
    // drains — that's a real distributed-systems race, not a bug. What must
    // hold is that nothing is left dangling in an active state.
    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId: campaign.id },
    });
    const active = recipients.filter((r) =>
      ['PENDING', 'QUEUED', 'SENDING'].includes(r.status),
    );
    expect(active).toHaveLength(0);
    expect(recipients.some((r) => r.status === 'CANCELLED')).toBe(true);

    await prisma.campaignRecipient.deleteMany({
      where: { campaignId: campaign.id },
    });
    await prisma.campaign.delete({ where: { id: campaign.id } });
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: {
        campaignBatchSize: 5,
        campaignBatchIntervalMinSeconds: 5,
        campaignBatchIntervalMaxSeconds: 10,
      },
    });
  });

  it('emergency-stops all running campaigns', async () => {
    const campaign = await prisma.campaign.create({
      data: {
        name: `E2E Emergency Campaign ${suffix}`,
        templateId,
        whatsAppAccountId: accountId,
        organizationId: tenant.organizationId,
      },
    });
    await prisma.campaignRecipient.createMany({
      data: [contactIds[0]].map((contactId) => ({
        campaignId: campaign.id,
        contactId,
        status: 'PENDING',
        organizationId: tenant.organizationId,
      })),
    });
    await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.id}/launch`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .post('/api/campaigns/emergency-stop')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.stopped).toBeGreaterThanOrEqual(1);

    const reloaded = await prisma.campaign.findUniqueOrThrow({
      where: { id: campaign.id },
    });
    expect(reloaded.status).toBe('CANCELLED');

    await prisma.campaignRecipient.deleteMany({
      where: { campaignId: campaign.id },
    });
    await prisma.campaign.delete({ where: { id: campaign.id } });
  });

  describe('delete requires campaigns.delete separately from campaigns.manage', () => {
    it('lets an Admin (who has campaigns.delete) delete a draft campaign', async () => {
      const campaign = await request(app.getHttpServer())
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `E2E Delete Perm ${suffix}`, templateId, whatsAppAccountId: accountId })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/campaigns/${campaign.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/campaigns/${campaign.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('blocks an Agent (who has campaigns.manage but not campaigns.delete) from deleting', async () => {
      const agentEmail = `delete-perm-agent-${suffix}@e2e.local`;
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: agentEmail,
          password: 'AgentPass123!',
          firstName: 'Delete',
          lastName: 'Agent',
          roleName: 'Agent',
        })
        .expect(201);
      const agentLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: agentEmail, password: 'AgentPass123!' })
        .expect(200);
      const agentToken = agentLogin.body.accessToken as string;

      const campaign = await request(app.getHttpServer())
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `E2E Delete Perm Agent ${suffix}`, templateId, whatsAppAccountId: accountId })
        .expect(201);

      // Agent has campaigns.manage (can create/launch/etc.) but not the
      // separate campaigns.delete permission.
      await request(app.getHttpServer())
        .delete(`/api/campaigns/${campaign.body.id}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .expect(403);

      // Still there — the blocked delete must not have partially applied.
      await request(app.getHttpServer())
        .get(`/api/campaigns/${campaign.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await prisma.campaign.delete({ where: { id: campaign.body.id } });
    });
  });
});
