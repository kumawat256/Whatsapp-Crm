import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

describe('Templates (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
  const suffix = Date.now();
  let adminToken: string;
  let templateId: string;

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
    tenant = await createTenantAdmin(app, prisma, 'Templates Test');
    adminToken = tenant.token;
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/api/templates').expect(401);
  });

  it('creates a template and auto-extracts its variables', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `E2E Template ${suffix}`,
        category: 'greeting',
        body: 'Hi {{firstName}}, your code is {{promoCode}}.',
      })
      .expect(201);
    templateId = res.body.id;
    expect(res.body.variables).toEqual(['firstName', 'promoCode']);
  });

  it('rejects a duplicate template name', async () => {
    await request(app.getHttpServer())
      .post('/api/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `E2E Template ${suffix}`, body: 'Anything' })
      .expect(409);
  });

  it('previews a template with supplied variables and reports missing ones', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/templates/${templateId}/preview`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ variables: { firstName: 'Ada' } })
      .expect(201);
    expect(res.body.text).toBe('Hi Ada, your code is .');
    expect(res.body.missing).toEqual(['promoCode']);
  });

  it('re-extracts variables when the body is updated', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ body: 'Hi {{firstName}} {{lastName}}!' })
      .expect(200);
    expect(res.body.variables).toEqual(['firstName', 'lastName']);
  });

  it('attaches a photo to a template and can later remove it', async () => {
    const media = await prisma.media.create({
      data: {
        type: 'IMAGE',
        filePath: 'media/images/e2e-fixture.jpg',
        fileName: 'e2e-fixture.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1234,
        organizationId: tenant.organizationId,
      },
    });

    const attached = await request(app.getHttpServer())
      .patch(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mediaId: media.id })
      .expect(200);
    expect(attached.body.media.id).toBe(media.id);

    const cleared = await request(app.getHttpServer())
      .patch(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mediaId: null })
      .expect(200);
    expect(cleared.body.media).toBeNull();

    await prisma.media.delete({ where: { id: media.id } });
  });

  it('lists templates', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data.some((t: { id: string }) => t.id === templateId)).toBe(
      true,
    );
  });

  it('deletes the template', async () => {
    await request(app.getHttpServer())
      .delete(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
