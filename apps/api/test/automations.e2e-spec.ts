import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConversationsService } from '../src/inbox/conversations.service';
import {
  WHATSAPP_INCOMING_MESSAGE_EVENT,
  WhatsAppIncomingMessageEvent,
} from '../src/whatsapp/events/whatsapp.events';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

async function waitFor(
  check: () => Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

describe('Automations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;
  let tenant: TenantFixture;
  const suffix = Date.now();
  let adminToken: string;

  let templateId: string;
  let mediaTemplateId: string;
  let mediaId: string;
  let accountId: string;
  let automationId: string;
  let mediaAutomationId: string;
  // Spied rather than sent for real: a real send would need the shared
  // CreditWallet (single row, app-wide) to have balance, which would race
  // with credits.e2e-spec.ts running concurrently in another Jest worker.
  // Spying keeps this suite's assertions deterministic and wallet-free.
  let sendMessageSpy: jest.SpyInstance;
  const inboundPhone = `+1888${suffix}`;

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
    eventEmitter = app.get(EventEmitter2);
    sendMessageSpy = jest
      .spyOn(app.get(ConversationsService), 'sendMessage')
      .mockResolvedValue({ id: 'stub-message-id' } as never);

    tenant = await createTenantAdmin(app, prisma, 'Automations Test');
    adminToken = tenant.token;

    const template = await prisma.template.create({
      data: {
        name: `E2E Automation Template ${suffix}`,
        body: 'Hi {{firstName}}!',
        organizationId: tenant.organizationId,
      },
    });
    templateId = template.id;

    const media = await prisma.media.create({
      data: {
        type: 'IMAGE',
        filePath: 'media/images/e2e-automation-fixture.jpg',
        fileName: 'e2e-automation-fixture.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1234,
        organizationId: tenant.organizationId,
      },
    });
    mediaId = media.id;

    const mediaTemplate = await prisma.template.create({
      data: {
        name: `E2E Automation Template With Photo ${suffix}`,
        body: 'Hi {{firstName}}, check this out!',
        mediaId: media.id,
        organizationId: tenant.organizationId,
      },
    });
    mediaTemplateId = mediaTemplate.id;

    const account = await prisma.whatsAppAccount.create({
      data: {
        label: `E2E Automation Account ${suffix}`,
        organizationId: tenant.organizationId,
      },
    });
    accountId = account.id;
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/api/automations').expect(401);
  });

  it('rejects an automation with an unknown action type', async () => {
    await request(app.getHttpServer())
      .post('/api/automations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E Bad Automation ${suffix}`,
        triggerType: 'message_received',
        actionType: 'add_tag',
        actionConfig: {},
      })
      .expect(400);
  });

  it('rejects a send_template automation missing templateId', async () => {
    await request(app.getHttpServer())
      .post('/api/automations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E Bad Automation 2 ${suffix}`,
        triggerType: 'message_received',
        actionType: 'send_template',
        actionConfig: {},
      })
      .expect(400);
  });

  it('creates a keyword-gated send_template automation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/automations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E Automation ${suffix}`,
        triggerType: 'message_received',
        triggerConfig: { keyword: 'help' },
        actionType: 'send_template',
        actionConfig: { templateId },
      })
      .expect(201);
    automationId = res.body.id;
    expect(res.body.isActive).toBe(true);
  });

  it('lists automations', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/automations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      res.body.data.some((a: { id: string }) => a.id === automationId),
    ).toBe(true);
  });

  it('does not fire when the keyword does not match', async () => {
    eventEmitter.emit(
      WHATSAPP_INCOMING_MESSAGE_EVENT,
      new WhatsAppIncomingMessageEvent(
        accountId,
        inboundPhone,
        `wamsg-nomatch-${suffix}`,
        'TEXT',
        new Date(),
        'E2E Sender',
        'just saying hi',
      ),
    );

    await waitFor(async () => {
      const contact = await prisma.contact.findFirst({
        where: { phoneNumber: inboundPhone },
      });
      return !!contact; // wait for the contact to be auto-created at least
    });

    expect(sendMessageSpy).not.toHaveBeenCalled();
  });

  it('fires the send_template action end-to-end when an inbound message matches the keyword', async () => {
    eventEmitter.emit(
      WHATSAPP_INCOMING_MESSAGE_EVENT,
      new WhatsAppIncomingMessageEvent(
        accountId,
        inboundPhone,
        `wamsg-match-${suffix}`,
        'TEXT',
        new Date(),
        'E2E Sender',
        'I need help with something',
      ),
    );

    await waitFor(async () => sendMessageSpy.mock.calls.length > 0);

    const [, dto] = sendMessageSpy.mock.calls[0] as [
      string,
      { type: string; content: string },
    ];
    expect(dto).toEqual({ type: 'TEXT', content: 'Hi E2E Sender!' });
  });

  it('includes the template photo when firing send_template for a template with media', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/automations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E Photo Automation ${suffix}`,
        triggerType: 'message_received',
        triggerConfig: { keyword: 'photo' },
        actionType: 'send_template',
        actionConfig: { templateId: mediaTemplateId },
      })
      .expect(201);
    mediaAutomationId = res.body.id;

    sendMessageSpy.mockClear();
    eventEmitter.emit(
      WHATSAPP_INCOMING_MESSAGE_EVENT,
      new WhatsAppIncomingMessageEvent(
        accountId,
        inboundPhone,
        `wamsg-photo-${suffix}`,
        'TEXT',
        new Date(),
        'E2E Sender',
        'can you send me a photo',
      ),
    );

    await waitFor(async () => sendMessageSpy.mock.calls.length > 0);

    const [, dto] = sendMessageSpy.mock.calls[0] as [
      string,
      { type: string; mediaId: string; caption: string },
    ];
    expect(dto).toEqual({
      type: 'IMAGE',
      mediaId,
      caption: 'Hi E2E Sender, check this out!',
    });
  });

  it('updates and then deletes the automation', async () => {
    await request(app.getHttpServer())
      .patch(`/api/automations/${automationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/automations/${automationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/automations/${automationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
    automationId = '';
  });
});
