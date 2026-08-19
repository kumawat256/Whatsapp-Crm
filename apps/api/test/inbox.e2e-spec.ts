import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

describe('Inbox: conversations + media (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
  const suffix = Date.now();
  let adminToken: string;

  const contactPhone = `+1555${suffix}`;
  let contactId: string;
  let accountId: string;
  let conversationId: string;
  let mediaId: string;

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
    tenant = await createTenantAdmin(app, prisma, 'Inbox Test');
    adminToken = tenant.token;

    const contact = await prisma.contact.create({
      data: {
        firstName: 'Inbox',
        lastName: 'Test',
        phoneNumber: contactPhone,
        organizationId: tenant.organizationId,
      },
    });
    contactId = contact.id;

    const account = await prisma.whatsAppAccount.create({
      data: {
        label: `Inbox Test Account ${suffix}`,
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
    await request(app.getHttpServer()).get('/api/conversations').expect(401);
  });

  it('creates a conversation (idempotently) and lists it', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/conversations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ contactId, whatsAppAccountId: accountId })
      .expect(201);
    conversationId = res.body.id;
    expect(res.body.contact.id).toBe(contactId);
    expect(res.body.unreadCount).toBe(0);

    const again = await request(app.getHttpServer())
      .post('/api/conversations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ contactId, whatsAppAccountId: accountId })
      .expect(201);
    expect(again.body.id).toBe(conversationId);

    const list = await request(app.getHttpServer())
      .get('/api/conversations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      list.body.data.some((c: { id: string }) => c.id === conversationId),
    ).toBe(true);
  });

  it('starts with an empty message history', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('refuses to send when the WhatsApp account is not connected', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'TEXT', content: 'Hello there' })
      .expect(400);
    expect(res.body.message).toMatch(/not connected/i);
  });

  it('refuses to send to an opted-out contact even if connected', async () => {
    await prisma.whatsAppAccount.update({
      where: { id: accountId },
      data: { status: 'CONNECTED' },
    });
    await prisma.contact.update({
      where: { id: contactId },
      data: { isOptedOut: true },
    });

    const res = await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'TEXT', content: 'Hello there' })
      .expect(400);
    expect(res.body.message).toMatch(/opted out/i);

    await prisma.contact.update({
      where: { id: contactId },
      data: { isOptedOut: false },
    });
    await prisma.whatsAppAccount.update({
      where: { id: accountId },
      data: { status: 'DISCONNECTED' },
    });
  });

  it('marks a conversation read and assigns it', async () => {
    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const adminId = meRes.body.id;

    const readRes = await request(app.getHttpServer())
      .post(`/api/conversations/${conversationId}/read`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    expect(readRes.body.unreadCount).toBe(0);

    const assignRes = await request(app.getHttpServer())
      .patch(`/api/conversations/${conversationId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedToUserId: adminId })
      .expect(200);
    expect(assignRes.body.assignedTo.id).toBe(adminId);
  });

  it('uploads media and rejects a disallowed file type', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('fake-image-bytes'), {
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);
    mediaId = res.body.id;
    expect(res.body.type).toBe('IMAGE');

    await request(app.getHttpServer())
      .post('/api/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('#!/bin/sh\necho hi'), {
        filename: 'script.sh',
        contentType: 'application/x-sh',
      })
      .expect(400);
  });

  it('serves the uploaded media file back', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/media/${mediaId}/file`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
    expect(Buffer.from(res.body).toString('utf8')).toBe('fake-image-bytes');
  });

  it('404s for an unknown media id', async () => {
    await request(app.getHttpServer())
      .get('/api/media/does-not-exist')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
