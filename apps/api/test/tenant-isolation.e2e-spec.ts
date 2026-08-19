import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

// Proves the "critical rule" from the multi-tenant spec: no endpoint should
// let Customer B access Customer A's data by swapping in Customer A's IDs.
// Every tenant-owned resource type is created once under org A, then every
// read/update/delete on it is attempted with org B's token and must 404 —
// not 403, since from org B's point of view the row doesn't exist at all.
describe('Tenant isolation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgA: TenantFixture;
  let orgB: TenantFixture;
  const suffix = Date.now();

  let contactId: string;
  let listId: string;
  let templateId: string;
  let mediaId: string;
  let accountId: string;
  let campaignId: string;
  let automationId: string;
  let conversationId: string;

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
    orgA = await createTenantAdmin(app, prisma, 'Isolation Org A');
    orgB = await createTenantAdmin(app, prisma, 'Isolation Org B');

    // Everything below is created directly under org A via Prisma (not the
    // API) so org A's own token isn't needed to prove ownership — only that
    // org B's token can't reach any of it.
    const contact = await prisma.contact.create({
      data: {
        firstName: 'OrgA',
        lastName: 'Contact',
        phoneNumber: `+1222${suffix}`,
        organizationId: orgA.organizationId,
      },
    });
    contactId = contact.id;

    const list = await prisma.list.create({
      data: { name: `OrgA List ${suffix}`, organizationId: orgA.organizationId },
    });
    listId = list.id;

    const template = await prisma.template.create({
      data: {
        name: `OrgA Template ${suffix}`,
        body: 'Hi {{firstName}}',
        organizationId: orgA.organizationId,
      },
    });
    templateId = template.id;

    const media = await prisma.media.create({
      data: {
        type: 'IMAGE',
        filePath: 'media/images/isolation-fixture.jpg',
        fileName: 'isolation-fixture.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1234,
        organizationId: orgA.organizationId,
      },
    });
    mediaId = media.id;

    const account = await prisma.whatsAppAccount.create({
      data: {
        label: `OrgA Account ${suffix}`,
        organizationId: orgA.organizationId,
      },
    });
    accountId = account.id;

    const campaign = await prisma.campaign.create({
      data: {
        name: `OrgA Campaign ${suffix}`,
        templateId,
        whatsAppAccountId: accountId,
        organizationId: orgA.organizationId,
      },
    });
    campaignId = campaign.id;

    const automation = await prisma.automation.create({
      data: {
        name: `OrgA Automation ${suffix}`,
        triggerType: 'message_received',
        triggerConfig: { keyword: 'hi' },
        actionType: 'send_template',
        actionConfig: { templateId },
        organizationId: orgA.organizationId,
      },
    });
    automationId = automation.id;

    const conversation = await prisma.conversation.create({
      data: {
        contactId,
        whatsAppAccountId: accountId,
        organizationId: orgA.organizationId,
      },
    });
    conversationId = conversation.id;
  });

  afterAll(async () => {
    await cleanupTenant(prisma, orgA);
    await cleanupTenant(prisma, orgB);
    await app.close();
  });

  it("org B cannot read org A's contact by id, and does not see it in the list", async () => {
    await request(app.getHttpServer())
      .get(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);

    const list = await request(app.getHttpServer())
      .get('/api/contacts')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(list.body.data.some((c: { id: string }) => c.id === contactId)).toBe(
      false,
    );
  });

  it("org B cannot update or delete org A's contact by id", async () => {
    await request(app.getHttpServer())
      .patch(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .send({ firstName: 'Hijacked' })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);

    const stillThere = await prisma.contact.findUnique({
      where: { id: contactId },
    });
    expect(stillThere?.firstName).toBe('OrgA');
  });

  it("org B cannot read, add members to, or delete org A's list", async () => {
    await request(app.getHttpServer())
      .get(`/api/lists/${listId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/lists/${listId}/members`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .send({ contactIds: [contactId] })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/lists/${listId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
  });

  it("org B cannot read, update, or delete org A's template", async () => {
    await request(app.getHttpServer())
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .send({ body: 'Hijacked {{firstName}}' })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);

    const stillThere = await prisma.template.findUnique({
      where: { id: templateId },
    });
    expect(stillThere?.body).toBe('Hi {{firstName}}');
  });

  it("org B cannot read or download org A's media", async () => {
    await request(app.getHttpServer())
      .get(`/api/media/${mediaId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/api/media/${mediaId}/file`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
  });

  it("org B cannot read, connect, or delete org A's WhatsApp account", async () => {
    await request(app.getHttpServer())
      .get(`/api/whatsapp/accounts/${accountId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/whatsapp/accounts/${accountId}/connect`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/whatsapp/accounts/${accountId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);

    const list = await request(app.getHttpServer())
      .get('/api/whatsapp/accounts')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(list.body.some((a: { id: string }) => a.id === accountId)).toBe(
      false,
    );
  });

  it("org B cannot read, launch, or delete org A's campaign", async () => {
    await request(app.getHttpServer())
      .get(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/api/campaigns/${campaignId}/insights`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/campaigns/${campaignId}/launch`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);

    const stillThere = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    expect(stillThere?.status).toBe('DRAFT');
  });

  it("org B cannot read, update, or delete org A's automation", async () => {
    await request(app.getHttpServer())
      .get(`/api/automations/${automationId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/api/automations/${automationId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .send({ isActive: false })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/automations/${automationId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);

    const stillThere = await prisma.automation.findUnique({
      where: { id: automationId },
    });
    expect(stillThere?.isActive).toBe(true);
  });

  it("org B cannot read, send in, or assign org A's conversation, and cannot create a new conversation against org A's contact/account", async () => {
    await request(app.getHttpServer())
      .get(`/api/conversations/${conversationId}`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .send({ type: 'TEXT', content: 'Hijacked' })
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/read`)
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(404);

    const list = await request(app.getHttpServer())
      .get('/api/conversations')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(
      list.body.data.some((c: { id: string }) => c.id === conversationId),
    ).toBe(false);

    // org A's contact/account are invisible to org B, so this 404s as an
    // unknown contact/account rather than ever creating a cross-tenant row.
    await request(app.getHttpServer())
      .post('/api/conversations')
      .set('Authorization', `Bearer ${orgB.token}`)
      .send({ contactId, whatsAppAccountId: accountId })
      .expect(404);
  });

  it("org B's own credit wallet and transactions are separate from org A's and never leak by id", async () => {
    // Nothing here is ID-addressable (the endpoints derive the wallet from
    // the caller's own organizationId), so the isolation check is simply
    // that org B starts at its own independent zero balance.
    const walletB = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(walletB.body.balance).toBe(0);

    const walletA = await prisma.creditWallet.findFirst({
      where: { organizationId: orgA.organizationId },
    });
    expect(walletA?.id).not.toBe(walletB.body.id);
  });

  describe('Super Admin cannot use tenant-scoped write endpoints', () => {
    let superAdminToken: string;

    beforeAll(async () => {
      const login = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@whatsapp-crm.local', password: 'ChangeMe123!' })
        .expect(200);
      superAdminToken = login.body.accessToken;
      expect(login.body.user.organizationId).toBeNull();
    });

    // Super Admin sessions have organizationId: null — before the
    // @CurrentOrganizationId() decorator existed, every one of these
    // endpoints would pass that null straight into a Prisma create() call
    // and crash with a raw NOT NULL constraint violation (500) instead of a
    // clean, actionable error. The decorator rejects at the controller
    // boundary, before the handler body (or any DTO-dependent logic) runs
    // — so a 403 here doesn't depend on the request body being valid.
    it('gets a clean 403, not a 500, on every tenant-resource create endpoint', async () => {
      const cases: [string, string, Record<string, unknown>][] = [
        ['post', '/api/contacts', { firstName: 'X', phoneNumber: '+10000000000' }],
        ['post', '/api/templates', { name: 'X', body: 'Hi' }],
        ['post', '/api/lists', { name: 'X' }],
        ['post', '/api/whatsapp/accounts', { label: 'X' }],
        ['post', '/api/automations', {
          name: 'X',
          triggerType: 'message_received',
          actionType: 'send_template',
          actionConfig: { templateId: 'does-not-matter' },
        }],
        ['post', '/api/campaigns', {
          name: 'X',
          templateId: 'does-not-matter',
          whatsAppAccountId: 'does-not-matter',
        }],
        ['post', '/api/conversations', {
          contactId: 'does-not-matter',
          whatsAppAccountId: 'does-not-matter',
        }],
      ];

      for (const [method, url, body] of cases) {
        const res = await request(app.getHttpServer())
          [method as 'post'](url)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send(body);
        expect(res.status).toBe(403);
      }
    });
  });
});
