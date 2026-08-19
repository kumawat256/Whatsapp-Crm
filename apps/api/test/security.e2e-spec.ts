import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

describe('Security hardening (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.setGlobalPrefix('api', { exclude: ['health'] });
    await app.init();

    prisma = app.get(PrismaService);
    tenant = await createTenantAdmin(app, prisma, 'Security Test');
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('sets standard helmet security headers', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
  });

  it('reports healthy with a reachable database', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('strips unknown fields and rejects unexpected ones on a DTO body', async () => {
    await request(app.getHttpServer())
      .post('/api/lists')
      .set('Authorization', `Bearer ${tenant.token}`)
      .send({ name: 'Security Test List', isAdmin: true }) // isAdmin is not part of CreateListDto
      .expect(400);
  });

  it('returns a sanitized 404 for an unknown route instead of leaking internals', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/this-route-does-not-exist')
      .expect(404);
    expect(res.body.message).not.toMatch(/stack|node_modules/i);
  });

  // Runs last — it deliberately exhausts the login throttle budget (10/min),
  // which would otherwise 429 every subsequent login call in this file.
  it('rate-limits repeated login attempts from the same client', async () => {
    let sawTooManyRequests = false;
    for (let i = 0; i < 11; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@whatsapp-crm.local',
          password: 'wrong-password',
        });
      if (res.status === 429) {
        sawTooManyRequests = true;
        break;
      }
      expect(res.status).toBe(401);
    }
    expect(sawTooManyRequests).toBe(true);
  });
});
