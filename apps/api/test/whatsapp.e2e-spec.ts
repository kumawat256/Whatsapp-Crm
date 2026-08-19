import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { WhatsAppAccountStatus } from '../src/generated/prisma/enums';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

describe('WhatsApp accounts (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
  const throwawayAgentEmail = `e2e-wa-agent-${Date.now()}@whatsapp-crm.local`;
  const accountLabel = `E2E Test Line ${Date.now()}`;
  let adminToken: string;
  let createdAccountId: string;

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
    tenant = await createTenantAdmin(app, prisma, 'WhatsApp Test');
    adminToken = tenant.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: throwawayAgentEmail } });
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer())
      .get('/api/whatsapp/accounts')
      .expect(401);
  });

  it('lets an Agent (no whatsapp.manage permission) list accounts but not manage them', async () => {
    // Agents need to see which accounts exist to pick one when sending a
    // message or creating a campaign, but must not be able to connect,
    // disconnect, create, or delete one — that stays whatsapp.manage-only.
    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: throwawayAgentEmail,
        password: 'AgentPass123!',
        firstName: 'E2E',
        lastName: 'Agent',
        roleName: 'Agent',
      })
      .expect(201);

    const agentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: throwawayAgentEmail, password: 'AgentPass123!' })
      .expect(200);
    const agentToken = agentLogin.body.accessToken;

    await request(app.getHttpServer())
      .get('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${agentToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ label: `Agent Blocked ${Date.now()}` })
      .expect(403);
  });

  it('lets an admin create and list a WhatsApp account', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: accountLabel })
      .expect(201);

    expect(createRes.body.status).toBe(WhatsAppAccountStatus.DISCONNECTED);
    createdAccountId = createRes.body.id;

    const listRes = await request(app.getHttpServer())
      .get('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      listRes.body.some((a: { id: string }) => a.id === createdAccountId),
    ).toBe(true);
  });

  it('deletes an account along with its conversations and messages (cascade)', async () => {
    const contact = await prisma.contact.create({
      data: {
        firstName: 'FK Test',
        phoneNumber: `+1999${Date.now()}`,
        organizationId: tenant.organizationId,
      },
    });
    const account = await prisma.whatsAppAccount.create({
      data: {
        label: `E2E FK Line ${Date.now()}`,
        organizationId: tenant.organizationId,
      },
    });
    const conversation = await prisma.conversation.create({
      data: {
        contactId: contact.id,
        whatsAppAccountId: account.id,
        organizationId: tenant.organizationId,
      },
    });
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        whatsAppAccountId: account.id,
        direction: 'OUTBOUND',
        type: 'TEXT',
        content: 'hi',
        status: 'SENT',
        organizationId: tenant.organizationId,
      },
    });

    await request(app.getHttpServer())
      .delete(`/api/whatsapp/accounts/${account.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    expect(
      await prisma.conversation.findUnique({ where: { id: conversation.id } }),
    ).toBeNull();
    expect(await prisma.message.findUnique({ where: { id: message.id } })).toBeNull();

    await prisma.contact.deleteMany({ where: { id: contact.id } });
  });

  it('refuses to delete an account with campaigns, with a clear reason instead of a 500', async () => {
    const template = await prisma.template.create({
      data: {
        name: `E2E FK Template ${Date.now()}`,
        body: 'Hi {{firstName}}',
        organizationId: tenant.organizationId,
      },
    });
    const account = await prisma.whatsAppAccount.create({
      data: {
        label: `E2E FK Campaign Line ${Date.now()}`,
        organizationId: tenant.organizationId,
      },
    });
    const campaign = await prisma.campaign.create({
      data: {
        name: `E2E FK Campaign ${Date.now()}`,
        templateId: template.id,
        whatsAppAccountId: account.id,
        organizationId: tenant.organizationId,
      },
    });

    const res = await request(app.getHttpServer())
      .delete(`/api/whatsapp/accounts/${account.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
    expect(res.body.message).toMatch(/can’t be deleted/);

    // Still there — the failed delete must not have partially applied.
    await request(app.getHttpServer())
      .get(`/api/whatsapp/accounts/${account.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await prisma.campaign.deleteMany({ where: { id: campaign.id } });
    await prisma.whatsAppAccount.deleteMany({ where: { id: account.id } });
    await prisma.template.deleteMany({ where: { id: template.id } });
  });

  it('refuses to delete a connected account', async () => {
    await prisma.whatsAppAccount.update({
      where: { id: createdAccountId },
      data: { status: WhatsAppAccountStatus.CONNECTED },
    });

    await request(app.getHttpServer())
      .delete(`/api/whatsapp/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    await prisma.whatsAppAccount.update({
      where: { id: createdAccountId },
      data: { status: WhatsAppAccountStatus.DISCONNECTED },
    });

    await request(app.getHttpServer())
      .delete(`/api/whatsapp/accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    createdAccountId = '';
  });

  it('404s for an unknown account id', async () => {
    await request(app.getHttpServer())
      .get('/api/whatsapp/accounts/does-not-exist')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('enforces the assigned plan’s WhatsApp account limit, and stays unlimited without a plan', async () => {
    const plan = await prisma.plan.create({
      data: {
        name: `WA Limit Plan ${Date.now()}`,
        credits: 100,
        maxWhatsAppAccounts: 1,
      },
    });
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { planId: plan.id },
    });

    const first = await request(app.getHttpServer())
      .post('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: `Plan Limit A ${Date.now()}` })
      .expect(201);

    const blocked = await request(app.getHttpServer())
      .post('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: `Plan Limit B ${Date.now()}` })
      .expect(400);
    expect(blocked.body.message).toMatch(/allows up to 1 WhatsApp account/);

    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { planId: null },
    });

    // No plan = unlimited again, even with an account already on the books.
    const second = await request(app.getHttpServer())
      .post('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: `Plan Limit C ${Date.now()}` })
      .expect(201);

    await prisma.whatsAppAccount.deleteMany({
      where: { id: { in: [first.body.id, second.body.id] } },
    });
    await prisma.plan.delete({ where: { id: plan.id } });
  });
});
