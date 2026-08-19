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

describe('Analytics (e2e)', () => {
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
    tenant = await createTenantAdmin(app, prisma, 'Analytics Test');
    superAdminToken = await loginSuperAdmin(app);
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer())
      .get('/api/analytics/overview')
      .expect(401);
  });

  // Super Admin has no organization of their own, and this endpoint's
  // queries rely entirely on the tenant-scoping Prisma extension to inject
  // organizationId — without a guard, Super Admin's unscoped context would
  // silently return platform-wide totals mislabeled as "their" workspace
  // instead of a clean, honest 403 (same shape as GET /organization/me).
  it("gives Super Admin a clean 403 — they have no organization of their own", async () => {
    await request(app.getHttpServer())
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(403);
  });

  it('returns an overview with the expected shape', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(200);

    expect(res.body).toMatchObject({
      contacts: { total: expect.any(Number), optedOut: expect.any(Number) },
      conversations: { total: expect.any(Number), unread: expect.any(Number) },
      messages: {
        sent: expect.any(Number),
        failed: expect.any(Number),
        last7Days: expect.any(Array),
      },
      campaigns: {
        total: expect.any(Number),
        running: expect.any(Number),
        completed: expect.any(Number),
        recipientsSent: expect.any(Number),
        recipientsFailed: expect.any(Number),
      },
      credits: {
        balance: expect.any(Number),
        spentLast30Days: expect.any(Number),
      },
      whatsapp: {
        totalAccounts: expect.any(Number),
        connectedAccounts: expect.any(Number),
      },
      users: { total: expect.any(Number), active: expect.any(Number) },
    });
    expect(res.body.messages.last7Days).toHaveLength(7);
  });
});
