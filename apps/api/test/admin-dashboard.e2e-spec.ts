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

describe('Admin: platform dashboard (e2e)', () => {
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
    tenant = await createTenantAdmin(app, prisma, 'Dashboard Test');
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('rejects a regular tenant Admin — Super Admin only', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/dashboard/overview')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(403);
  });

  it('returns platform-wide totals that include the freshly created org', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard/overview')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(res.body.customers.total).toBeGreaterThanOrEqual(1);
    expect(res.body.customers.active).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.messages.sent).toBe('number');
    expect(typeof res.body.credits.consumed).toBe('number');
    expect(res.body.users.totalAdmins).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.users.totalAgents).toBe('number');
  });

  it('accepts every supported range value', async () => {
    for (const range of ['today', 'yesterday', '7d', '30d']) {
      await request(app.getHttpServer())
        .get('/api/admin/dashboard/overview')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ range })
        .expect(200);
    }
    await request(app.getHttpServer())
      .get('/api/admin/dashboard/overview')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .query({
        range: 'custom',
        from: '2020-01-01',
        to: '2030-01-01',
      })
      .expect(200);
  });

  it('rejects an unsupported range value', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/dashboard/overview')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .query({ range: 'not-a-real-range' })
      .expect(400);
  });

  it('lists per-organization usage including the freshly created org', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard/usage')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .query({ pageSize: 100 })
      .expect(200);
    const row = res.body.data.find(
      (r: { id: string }) => r.id === tenant.organizationId,
    );
    expect(row).toBeDefined();
    expect(row.messagesSent).toBe(0);
    expect(row.creditsConsumed).toBe(0);
    expect(row.whatsAppAccounts).toBe(0);
    expect(row.agents).toBe(0);
    expect(row.creditBalance).toBe(0);
  });

  it("reflects the org's wallet balance after a Super Admin top-up", async () => {
    await request(app.getHttpServer())
      .post(`/api/admin/organizations/${tenant.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'CREDIT', amount: 40, reason: 'Dashboard balance test' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard/usage')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .query({ pageSize: 100 })
      .expect(200);
    const row = res.body.data.find(
      (r: { id: string }) => r.id === tenant.organizationId,
    );
    expect(row.creditBalance).toBe(40);
  });

  it('returns a 7-day platform-wide trend series', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard/trend')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(res.body).toHaveLength(7);
    expect(res.body[6].date).toBe(
      new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD, local time
    );
    for (const day of res.body) {
      expect(typeof day.messagesSent).toBe('number');
      expect(typeof day.creditsConsumed).toBe('number');
    }
  });

  it('rejects a regular tenant Admin from the trend endpoint too', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/dashboard/trend')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(403);
  });

  it('counts an agent created under the tenant in the usage row', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${tenant.token}`)
      .send({
        email: `dashboard-agent-${Date.now()}@e2e.local`,
        password: 'AgentPass123!',
        firstName: 'Dash',
        lastName: 'Agent',
        roleName: 'Agent',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard/usage')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .query({ pageSize: 100 })
      .expect(200);
    const row = res.body.data.find(
      (r: { id: string }) => r.id === tenant.organizationId,
    );
    expect(row.agents).toBe(1);
  });
});
