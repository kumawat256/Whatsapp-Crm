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

describe('Admin: cross-org credits (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminToken: string;
  let tenant: TenantFixture;

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
    superAdminToken = await loginSuperAdmin(app);
    tenant = await createTenantAdmin(app, prisma, 'Admin Credits Test');
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects a regular tenant Admin — Super Admin only', async () => {
    await request(app.getHttpServer())
      .get(`/api/admin/organizations/${tenant.organizationId}/credits/wallet`)
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(403);
  });

  it('starts at a zero balance for a fresh organization', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/admin/organizations/${tenant.organizationId}/credits/wallet`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(res.body.balance).toBe(0);
  });

  it('requires a reason and rejects a missing/short one', async () => {
    await request(app.getHttpServer())
      .post(`/api/admin/organizations/${tenant.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'CREDIT', amount: 100 })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/api/admin/organizations/${tenant.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'CREDIT', amount: 100, reason: 'x' })
      .expect(400);
  });

  it('credits the wallet with a reason and it shows up in the ledger', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/admin/organizations/${tenant.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'CREDIT', amount: 100, reason: 'Plan renewal bonus' })
      .expect(201);
    expect(res.body.balance).toBe(100);

    const tx = await request(app.getHttpServer())
      .get(
        `/api/admin/organizations/${tenant.organizationId}/credits/transactions`,
      )
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(tx.body.data[0]).toMatchObject({
      type: 'CREDIT',
      amount: 100,
      reason: 'Plan renewal bonus',
      balanceAfter: 100,
    });
  });

  it('debits the wallet manually and rejects an over-debit', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/admin/organizations/${tenant.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'DEBIT', amount: 40, reason: 'Manual correction' })
      .expect(201);
    expect(res.body.balance).toBe(60);

    await request(app.getHttpServer())
      .post(`/api/admin/organizations/${tenant.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'DEBIT', amount: 1000, reason: 'Manual correction' })
      .expect(400);
  });

  it('the tenant sees the same balance via its own endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(200);
    expect(res.body.balance).toBe(60);
  });

  it('404s for an unknown organization id', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/organizations/does-not-exist/credits/wallet')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(404);
  });
});
