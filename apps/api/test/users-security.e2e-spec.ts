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

describe('Users/Roles security hardening (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
  let superAdminToken: string;
  const suffix = Date.now();

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
    tenant = await createTenantAdmin(app, prisma, 'Users Security Test');
    superAdminToken = await loginSuperAdmin(app);
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  describe('Role management is Super Admin only', () => {
    it('rejects a tenant Admin from the global roles endpoint entirely', async () => {
      await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${tenant.token}`)
        .expect(403);
      await request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({ name: 'Should not work', permissionKeys: [] })
        .expect(403);
    });

    it('still lets Super Admin manage roles', async () => {
      await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it("gives the tenant Admin a safe, tenant-only role picker instead", async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/assignable-roles')
        .set('Authorization', `Bearer ${tenant.token}`)
        .expect(200);
      const names = res.body.map((r: { name: string }) => r.name).sort();
      expect(names).toEqual(['Admin', 'Agent']);
    });
  });

  describe('privilege escalation prevention', () => {
    it('refuses to move a user to an unknown/non-tenant role id, even a real Super Admin role id', async () => {
      const superAdminRole = await prisma.role.findUniqueOrThrow({
        where: { name: 'Super Admin' },
      });

      const agentEmail = `escalation-agent-${suffix}@e2e.local`;
      const agent = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({
          email: agentEmail,
          password: 'AgentPass123!',
          firstName: 'Escalation',
          lastName: 'Agent',
          roleName: 'Agent',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/users/${agent.body.id}`)
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({ roleId: superAdminRole.id })
        .expect(400);
      expect(res.body.message).toMatch(/unknown role/i);

      // Confirm it truly never applied.
      const reloaded = await prisma.user.findUniqueOrThrow({
        where: { id: agent.body.id },
      });
      expect(reloaded.roleId).not.toBe(superAdminRole.id);

      await prisma.refreshToken.deleteMany({ where: { userId: agent.body.id } });
      await prisma.user.delete({ where: { id: agent.body.id } });
    });
  });

  describe('one Admin per organization', () => {
    it('refuses to create a second Admin in the same org', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({
          email: `second-admin-${suffix}@e2e.local`,
          password: 'AdminPass123!',
          firstName: 'Second',
          lastName: 'Admin',
          roleName: 'Admin',
        })
        .expect(400);
      expect(res.body.message).toMatch(/already has an admin/i);
    });

    it('refuses to promote an Agent to Admin when the org already has one', async () => {
      const agentEmail = `promote-agent-${suffix}@e2e.local`;
      const agent = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({
          email: agentEmail,
          password: 'AgentPass123!',
          firstName: 'Promote',
          lastName: 'Agent',
          roleName: 'Agent',
        })
        .expect(201);

      const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'Admin' } });
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${agent.body.id}`)
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({ roleId: adminRole.id })
        .expect(400);
      expect(res.body.message).toMatch(/already has an admin/i);

      await prisma.refreshToken.deleteMany({ where: { userId: agent.body.id } });
      await prisma.user.delete({ where: { id: agent.body.id } });
    });

    it('still lets the existing Admin re-save their own profile without tripping the guard', async () => {
      const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'Admin' } });
      await request(app.getHttpServer())
        .patch(`/api/users/${tenant.userId}`)
        .set('Authorization', `Bearer ${tenant.token}`)
        .send({ roleId: adminRole.id, firstName: 'Users Security' })
        .expect(200);
    });
  });
});
