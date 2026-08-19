import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin: users, roles, settings (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const suffix = Date.now();
  let adminToken: string;
  let adminId: string;

  let managedUserId: string;
  let customRoleId: string;

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

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@whatsapp-crm.local', password: 'ChangeMe123!' })
      .expect(200);
    adminToken = login.body.accessToken;

    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    adminId = me.body.id;
  });

  afterAll(async () => {
    if (managedUserId) {
      await prisma.refreshToken.deleteMany({
        where: { userId: managedUserId },
      });
      await prisma.user.deleteMany({ where: { id: managedUserId } });
    }
    if (customRoleId) {
      await prisma.role.deleteMany({ where: { id: customRoleId } });
    }
    await prisma.systemSetting.deleteMany({
      where: { key: `e2e.test.${suffix}` },
    });
    await app.close();
  });

  it('rejects unauthenticated access to admin routes', async () => {
    await request(app.getHttpServer()).get('/api/users').expect(401);
    await request(app.getHttpServer()).get('/api/roles').expect(401);
    await request(app.getHttpServer()).get('/api/settings').expect(401);
  });

  describe('users', () => {
    it('creates, lists, and updates a user', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `e2e-admin-${suffix}@example.com`,
          password: 'SuperSecret123',
          firstName: 'E2E',
          lastName: 'Managed',
          roleName: 'Agent',
        })
        .expect(201);
      managedUserId = created.body.id;

      const list = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(
        list.body.data.some((u: { id: string }) => u.id === managedUserId),
      ).toBe(true);

      const updated = await request(app.getHttpServer())
        .patch(`/api/users/${managedUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Updated' })
        .expect(200);
      expect(updated.body.firstName).toBe('Updated');
    });

    it('resets a user password', async () => {
      await request(app.getHttpServer())
        .post(`/api/users/${managedUserId}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword: 'BrandNewPassword123' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: `e2e-admin-${suffix}@example.com`,
          password: 'BrandNewPassword123',
        })
        .expect(200);
    });

    it('deactivates a user and blocks their login', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${managedUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: `e2e-admin-${suffix}@example.com`,
          password: 'BrandNewPassword123',
        })
        .expect(401);
    });

    it('refuses to let an admin deactivate their own account', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(400);
      expect(res.body.message).toMatch(/cannot deactivate your own account/i);
    });

    it('refuses to let an admin delete their own account', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
      expect(res.body.message).toMatch(/cannot delete your own account/i);
    });

    it('deletes a user', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${managedUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/users/${managedUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      managedUserId = '';
    });
  });

  describe('roles', () => {
    it('lists roles and available permissions', async () => {
      const roles = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(roles.body.some((r: { name: string }) => r.name === 'Admin')).toBe(
        true,
      );

      const permissions = await request(app.getHttpServer())
        .get('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(
        permissions.body.some(
          (p: { key: string }) => p.key === 'credits.manage',
        ),
      ).toBe(true);
    });

    it('creates a custom role scoped to a subset of permissions', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `E2E Custom Role ${suffix}`,
          permissionKeys: ['contacts.manage'],
        })
        .expect(201);
      customRoleId = res.body.id;
      expect(res.body.permissions).toHaveLength(1);
    });

    it('rejects an unknown permission key', async () => {
      await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `E2E Bad Role ${suffix}`,
          permissionKeys: ['not.a.real.permission'],
        })
        .expect(400);
    });

    it('updates the custom role permission set', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionKeys: ['contacts.manage', 'lists.manage'] })
        .expect(200);
      expect(res.body.permissions).toHaveLength(2);
    });

    it('refuses to rename or delete a system role', async () => {
      const adminRole = await prisma.role.findUniqueOrThrow({
        where: { name: 'Admin' },
      });
      await request(app.getHttpServer())
        .patch(`/api/roles/${adminRole.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Renamed Admin' })
        .expect(400);
      await request(app.getHttpServer())
        .delete(`/api/roles/${adminRole.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('deletes the custom role', async () => {
      await request(app.getHttpServer())
        .delete(`/api/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      customRoleId = '';
    });
  });

  describe('settings', () => {
    it('upserts and reads back a setting', async () => {
      const key = `e2e.test.${suffix}`;
      const upserted = await request(app.getHttpServer())
        .put(`/api/settings/${key}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: { enabled: true, limit: 42 } })
        .expect(200);
      expect(upserted.body.value).toEqual({ enabled: true, limit: 42 });

      const fetched = await request(app.getHttpServer())
        .get(`/api/settings/${key}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(fetched.body.value).toEqual({ enabled: true, limit: 42 });

      const list = await request(app.getHttpServer())
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(list.body.some((s: { key: string }) => s.key === key)).toBe(true);
    });
  });
});
