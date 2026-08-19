import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  cleanupOrganization,
  cleanupTenant,
  createTenantAdmin,
  loginSuperAdmin,
} from './helpers/tenant-fixture';

describe('Admin: Plans (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminToken: string;
  const suffix = Date.now();
  let planId: string;

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
  });

  afterAll(async () => {
    if (planId) {
      await prisma.plan.deleteMany({ where: { id: planId } });
    }
    await app.close();
  });

  it('rejects a regular tenant Admin — Super Admin only', async () => {
    const tenant = await createTenantAdmin(app, prisma, 'Plans Guard');
    await request(app.getHttpServer())
      .get('/api/admin/plans')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(403);
    await cleanupTenant(prisma, tenant);
  });

  it('creates a plan and rejects a duplicate name', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/plans')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: `Starter ${suffix}`, credits: 1000, maxWhatsAppAccounts: 1 })
      .expect(201);
    planId = res.body.id;
    expect(res.body.isActive).toBe(true);

    await request(app.getHttpServer())
      .post('/api/admin/plans')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: `Starter ${suffix}`, credits: 500, maxWhatsAppAccounts: 1 })
      .expect(409);
  });

  it('lists and fetches the plan', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/admin/plans')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(list.body.some((p: { id: string }) => p.id === planId)).toBe(true);

    await request(app.getHttpServer())
      .get(`/api/admin/plans/${planId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
  });

  it('updates the plan', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/plans/${planId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ credits: 2000, isActive: false })
      .expect(200);
    expect(res.body.credits).toBe(2000);
    expect(res.body.isActive).toBe(false);
  });

  it('refuses to delete a plan that an organization is still on', async () => {
    const tenant = await createTenantAdmin(app, prisma, 'Plans In Use');
    await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: { planId },
    });

    const res = await request(app.getHttpServer())
      .delete(`/api/admin/plans/${planId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(400);
    expect(res.body.message).toMatch(/organization/i);

    await cleanupOrganization(prisma, tenant.organizationId, tenant.userId);
  });

  it('deletes the plan once nothing references it', async () => {
    await request(app.getHttpServer())
      .delete(`/api/admin/plans/${planId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(204);
    await request(app.getHttpServer())
      .get(`/api/admin/plans/${planId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(404);
    planId = '';
  });
});
