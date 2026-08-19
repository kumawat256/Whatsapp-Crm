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

describe('Organization: self-service info (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
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
    tenant = await createTenantAdmin(app, prisma, 'Organization Self Test');
    superAdminToken = await loginSuperAdmin(app);
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/api/organization/me').expect(401);
  });

  it('gives Super Admin a clean 403 — they have no organization of their own', async () => {
    await request(app.getHttpServer())
      .get('/api/organization/me')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(403);
  });

  it("returns the tenant's own organization with a fresh no-plan, one-admin, zero-agent state", async () => {
    const res = await request(app.getHttpServer())
      .get('/api/organization/me')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(200);

    expect(res.body.id).toBe(tenant.organizationId);
    expect(res.body.status).toBe('ACTIVE');
    expect(res.body.serviceEnabled).toBe(true);
    expect(res.body.plan).toBeNull();
    expect(res.body.counts).toEqual({ admins: 1, agents: 0, whatsAppAccounts: 0 });
    expect(res.body.campaignSettings).toEqual({
      batchSize: 5,
      intervalMinSeconds: 5,
      intervalMaxSeconds: 10,
    });
  });

  it('an Agent in the same org sees the same organization info', async () => {
    const agentEmail = `org-self-agent-${Date.now()}@e2e.local`;
    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${tenant.token}`)
      .send({
        email: agentEmail,
        password: 'AgentPass123!',
        firstName: 'Org',
        lastName: 'Agent',
        roleName: 'Agent',
      })
      .expect(201);

    const agentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: agentEmail, password: 'AgentPass123!' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/organization/me')
      .set('Authorization', `Bearer ${agentLogin.body.accessToken}`)
      .expect(200);

    expect(res.body.id).toBe(tenant.organizationId);
    expect(res.body.counts).toEqual({ admins: 1, agents: 1, whatsAppAccounts: 0 });
  });

  it('reflects a plan once one is assigned', async () => {
    const plan = await prisma.plan.create({
      data: { name: `Org Self Plan ${Date.now()}`, credits: 500, maxWhatsAppAccounts: 2 },
    });
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { planId: plan.id },
    });

    const res = await request(app.getHttpServer())
      .get('/api/organization/me')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(200);
    expect(res.body.plan).toEqual({
      name: plan.name,
      credits: 500,
      maxWhatsAppAccounts: 2,
    });

    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { planId: null },
    });
    await prisma.plan.delete({ where: { id: plan.id } });
  });

  describe('campaign sending settings', () => {
    afterEach(async () => {
      // Restore defaults so other describe blocks/tests in this suite (and
      // the campaigns suite, which shares no org but asserts the same
      // defaults) aren't affected by a value left over from a failed run.
      await prisma.organization.update({
        where: { id: tenant.organizationId },
        data: {
          campaignBatchSize: 5,
          campaignBatchIntervalMinSeconds: 5,
          campaignBatchIntervalMaxSeconds: 10,
        },
      });
    });

    it('rejects unauthenticated access', async () => {
      await request(app.getHttpServer())
        .patch('/api/organization/campaign-settings')
        .send({ batchSize: 3, intervalMinSeconds: 2, intervalMaxSeconds: 4 })
        .expect(401);
    });

    it('lets the Admin update batch size and interval, reflected on GET /organization/me', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/organization/campaign-settings')
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({ batchSize: 3, intervalMinSeconds: 2, intervalMaxSeconds: 4 })
        .expect(200);
      expect(res.body).toEqual({ batchSize: 3, intervalMinSeconds: 2, intervalMaxSeconds: 4 });

      const self = await request(app.getHttpServer())
        .get('/api/organization/me')
        .set('Authorization', `Bearer ${tenant.token}`)
        .expect(200);
      expect(self.body.campaignSettings).toEqual({
        batchSize: 3,
        intervalMinSeconds: 2,
        intervalMaxSeconds: 4,
      });
    });

    it('rejects an interval where max is below min', async () => {
      await request(app.getHttpServer())
        .patch('/api/organization/campaign-settings')
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({ batchSize: 5, intervalMinSeconds: 10, intervalMaxSeconds: 3 })
        .expect(400);
    });

    it('blocks an Agent from changing it — org-wide sending behavior is Admin-only', async () => {
      const agentEmail = `org-settings-agent-${Date.now()}@e2e.local`;
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({
          email: agentEmail,
          password: 'AgentPass123!',
          firstName: 'Settings',
          lastName: 'Agent',
          roleName: 'Agent',
        })
        .expect(201);
      const agentLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: agentEmail, password: 'AgentPass123!' })
        .expect(200);

      await request(app.getHttpServer())
        .patch('/api/organization/campaign-settings')
        .set('Authorization', `Bearer ${agentLogin.body.accessToken}`)
        .send({ batchSize: 3, intervalMinSeconds: 2, intervalMaxSeconds: 4 })
        .expect(403);

      const agentUser = await prisma.user.findUniqueOrThrow({ where: { email: agentEmail } });
      await prisma.refreshToken.deleteMany({ where: { userId: agentUser.id } });
      await prisma.user.delete({ where: { id: agentUser.id } });
    });
  });

  describe('team activity', () => {
    it('lists every user in the org with a zero send count, and only this org', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/organization/team')
        .set('Authorization', `Bearer ${tenant.token}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(2); // the tenant admin + the earlier agent
      expect(
        res.body.every((u: { messagesSent: number }) => u.messagesSent === 0),
      ).toBe(true);
      const roles = res.body.map((u: { role: string }) => u.role).sort();
      expect(roles).toEqual(['Admin', 'Agent']);
    });

    it('counts a message toward the user who sent it', async () => {
      const contact = await prisma.contact.create({
        data: {
          firstName: 'Team',
          lastName: 'Activity',
          phoneNumber: `+1888${Date.now()}`,
          organizationId: tenant.organizationId,
        },
      });
      const account = await prisma.whatsAppAccount.create({
        data: { label: `Team Activity ${Date.now()}`, organizationId: tenant.organizationId },
      });
      const conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          whatsAppAccountId: account.id,
          organizationId: tenant.organizationId,
        },
      });
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          whatsAppAccountId: account.id,
          direction: 'OUTBOUND',
          type: 'TEXT',
          content: 'hi',
          status: 'SENT',
          sentByUserId: tenant.userId,
          organizationId: tenant.organizationId,
        },
      });

      const res = await request(app.getHttpServer())
        .get('/api/organization/team')
        .set('Authorization', `Bearer ${tenant.token}`)
        .expect(200);
      const me = res.body.find((u: { id: string }) => u.id === tenant.userId);
      expect(me.messagesSent).toBe(1);
    });
  });
});
