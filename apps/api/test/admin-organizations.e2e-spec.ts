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

describe('Admin: Organizations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    superAdminToken = await loginSuperAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/organizations')
      .expect(401);
  });

  it('rejects a regular tenant Admin — Super Admin only', async () => {
    const tenant = await createTenantAdmin(app, prisma, 'Admin Org Guard');
    await request(app.getHttpServer())
      .get('/api/admin/organizations')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(403);
    await cleanupTenant(prisma, tenant);
  });

  describe('full lifecycle', () => {
    let organizationId: string;
    let adminUserId: string;
    let adminEmail: string;

    afterAll(async () => {
      if (organizationId) {
        await cleanupOrganization(prisma, organizationId);
      }
    });

    it('creates an organization with a generated password for its Customer Admin', async () => {
      adminEmail = `admin-org-lifecycle-${suffix}@e2e.local`;
      const res = await request(app.getHttpServer())
        .post('/api/admin/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: `Lifecycle Org ${suffix}`,
          adminEmail,
          adminFirstName: 'Lifecycle',
          adminLastName: 'Admin',
        })
        .expect(201);

      expect(res.body.status).toBe('ACTIVE');
      expect(res.body.serviceEnabled).toBe(true);
      expect(res.body.admin.email).toBe(adminEmail);
      expect(typeof res.body.generatedPassword).toBe('string');
      expect(res.body.generatedPassword.length).toBeGreaterThan(8);

      organizationId = res.body.id;
      adminUserId = res.body.admin.id;

      // The generated password actually works.
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: adminEmail, password: res.body.generatedPassword })
        .expect(200);
    });

    it('rejects creating a second organization with the same admin email', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: `Dup Org ${suffix}`,
          adminEmail,
          adminFirstName: 'Dup',
          adminLastName: 'Admin',
        })
        .expect(409);
    });

    it('lists and fetches the organization', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/admin/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .query({ search: 'Lifecycle Org' })
        .expect(200);
      expect(
        list.body.data.some((o: { id: string }) => o.id === organizationId),
      ).toBe(true);

      const detail = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(detail.body.creditWallet).toBeNull();
      expect(detail.body._count.users).toBe(1);
      expect(detail.body.users).toEqual([
        expect.objectContaining({ id: adminUserId, email: adminEmail }),
      ]);
    });

    it('handles concurrent first-ever wallet reads without racing on wallet creation', async () => {
      // Regression test: getOrCreateWallet used to be find-then-create, so
      // two parallel requests for a brand-new org's wallet (exactly what the
      // admin UI's detail dialog does — wallet + transactions in parallel)
      // could both pass the find and race on the create, one losing to the
      // unique constraint on organizationId and 500ing.
      const [walletRes, txRes] = await Promise.all([
        request(app.getHttpServer())
          .get(`/api/admin/organizations/${organizationId}/credits/wallet`)
          .set('Authorization', `Bearer ${superAdminToken}`),
        request(app.getHttpServer())
          .get(`/api/admin/organizations/${organizationId}/credits/transactions`)
          .set('Authorization', `Bearer ${superAdminToken}`),
      ]);
      expect(walletRes.status).toBe(200);
      expect(txRes.status).toBe(200);
      expect(walletRes.body.balance).toBe(0);
    });

    it('updates the organization name', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: `Renamed Org ${suffix}` })
        .expect(200);
      expect(res.body.name).toBe(`Renamed Org ${suffix}`);
    });

    it('toggles per-module flags without clobbering other modules', async () => {
      const first = await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}/modules`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ modules: { campaigns: false } })
        .expect(200);
      expect(first.body.enabledModules).toEqual({ campaigns: false });

      const second = await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}/modules`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ modules: { automations: false } })
        .expect(200);
      expect(second.body.enabledModules).toEqual({
        campaigns: false,
        automations: false,
      });
    });

    it('disables the service and blocks the tenant admin from mutating requests, but not reads', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}/service`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ enabled: false })
        .expect(200);

      // Reuses impersonation to get a working token for this admin rather
      // than needing to know their randomly generated password.
      const impersonation = await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/impersonate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      const tenantToken = impersonation.body.accessToken as string;

      await request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ firstName: 'X', phoneNumber: '+10000000001' })
        .expect(403);

      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}/service`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ enabled: true })
        .expect(200);
    });

    it('impersonates the Customer Admin and the token works for tenant routes', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/impersonate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ userId: adminUserId })
        .expect(200);
      expect(typeof res.body.accessToken).toBe('string');

      const me = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${res.body.accessToken}`)
        .expect(200);
      expect(me.body.id).toBe(adminUserId);
      expect(me.body.organizationId).toBe(organizationId);
    });

    it('refuses to impersonate a user from a different organization', async () => {
      const otherTenant = await createTenantAdmin(app, prisma, 'Other Org');
      await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/impersonate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ userId: otherTenant.userId })
        .expect(404);
      await cleanupTenant(prisma, otherTenant);
    });

    it('resets the Customer Admin password and it actually works', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/reset-password`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ userId: adminUserId })
        .expect(200);
      expect(typeof res.body.generatedPassword).toBe('string');

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: adminEmail, password: res.body.generatedPassword })
        .expect(200);
    });

    it('suspends the organization and blocks that admin from logging in', async () => {
      const suspendRes = await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/suspend`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(suspendRes.body.status).toBe('SUSPENDED');

      const impersonation = await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/impersonate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ userId: adminUserId })
        .expect(200);

      // Even a freshly issued impersonation token is rejected for a
      // suspended org — TenantStatusGuard checks live organization status
      // on every request, not just at login.
      await request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${impersonation.body.accessToken}`)
        .expect(403);

      const activateRes = await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/activate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(activateRes.body.status).toBe('ACTIVE');
    });
  });

  describe('plan assignment grants credits', () => {
    let planId: string;
    let planCredits: number;
    let organizationId: string;
    let adminEmail: string;

    beforeAll(async () => {
      const plan = await prisma.plan.create({
        data: { name: `Plan Grant Test ${suffix}`, credits: 250, maxWhatsAppAccounts: 1 },
      });
      planId = plan.id;
      planCredits = plan.credits;
    });

    afterAll(async () => {
      if (organizationId) await cleanupOrganization(prisma, organizationId);
      await prisma.plan.deleteMany({ where: { id: planId } });
    });

    it('funds the wallet immediately when a plan is assigned at creation', async () => {
      adminEmail = `plan-grant-${suffix}@e2e.local`;
      const res = await request(app.getHttpServer())
        .post('/api/admin/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: `Plan Grant Org ${suffix}`,
          adminEmail,
          adminFirstName: 'Plan',
          adminLastName: 'Grant',
          planId,
        })
        .expect(201);
      organizationId = res.body.id;

      const wallet = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}/credits/wallet`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(wallet.body.balance).toBe(planCredits);

      const tx = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}/credits/transactions`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(tx.body.data[0]).toMatchObject({
        type: 'CREDIT',
        amount: planCredits,
        balanceAfter: planCredits,
      });
      expect(tx.body.data[0].reason).toContain('Plan Grant Test');
    });

    it('does not re-grant credits when re-saving the same plan or clearing it', async () => {
      // Re-save with the same planId — must not add credits again.
      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ planId })
        .expect(200);
      let wallet = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}/credits/wallet`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(wallet.body.balance).toBe(planCredits);

      // Clearing the plan — must not deduct anything already granted.
      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ planId: null })
        .expect(200);
      wallet = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}/credits/wallet`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(wallet.body.balance).toBe(planCredits);
    });

    it('grants again when switching to a different plan', async () => {
      const otherPlan = await prisma.plan.create({
        data: { name: `Plan Grant Test B ${suffix}`, credits: 100, maxWhatsAppAccounts: 1 },
      });

      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ planId: otherPlan.id })
        .expect(200);

      const wallet = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}/credits/wallet`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(wallet.body.balance).toBe(planCredits + 100);

      await prisma.plan.delete({ where: { id: otherPlan.id } });
    });
  });

  describe('plan duration and expiry', () => {
    let planId: string;
    let organizationId: string;

    afterAll(async () => {
      if (organizationId) await cleanupOrganization(prisma, organizationId);
      if (planId) await prisma.plan.deleteMany({ where: { id: planId } });
    });

    it('computes planExpiresAt from the plan duration when assigned at creation', async () => {
      const plan = await prisma.plan.create({
        data: {
          name: `Plan Expiry Test ${suffix}`,
          credits: 10,
          maxWhatsAppAccounts: 1,
          durationDays: 30,
        },
      });
      planId = plan.id;

      const res = await request(app.getHttpServer())
        .post('/api/admin/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: `Plan Expiry Org ${suffix}`,
          adminEmail: `plan-expiry-${suffix}@e2e.local`,
          adminFirstName: 'Plan',
          adminLastName: 'Expiry',
          planId,
        })
        .expect(201);
      organizationId = res.body.id;

      expect(res.body.planExpiresAt).toEqual(expect.any(String));
      const expiresAt = new Date(res.body.planExpiresAt).getTime();
      const expected = Date.now() + 30 * 24 * 60 * 60 * 1000;
      expect(Math.abs(expiresAt - expected)).toBeLessThan(60_000);
    });

    it('re-saving the same plan does not reset the expiry clock', async () => {
      const before = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ planId })
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(after.body.planExpiresAt).toBe(before.body.planExpiresAt);
    });

    it('clears the expiry when the plan is cleared, and an evergreen plan never expires', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ planId: null })
        .expect(200);
      const cleared = await request(app.getHttpServer())
        .get(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      expect(cleared.body.planExpiresAt).toBeNull();

      const evergreen = await prisma.plan.create({
        data: { name: `Evergreen Plan ${suffix}`, credits: 5, maxWhatsAppAccounts: 1 },
      });
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ planId: evergreen.id })
        .expect(200);
      expect(res.body.planExpiresAt).toBeNull();

      await prisma.plan.delete({ where: { id: evergreen.id } });
    });
  });

  describe('module gating extension', () => {
    let organizationId: string;
    let tenantToken: string;

    afterAll(async () => {
      if (organizationId) await cleanupOrganization(prisma, organizationId);
    });

    it('blocks a mutation on a newly-gated module (contacts) once disabled, but leaves reads open', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: `Module Gate Org ${suffix}`,
          adminEmail: `module-gate-${suffix}@e2e.local`,
          adminFirstName: 'Module',
          adminLastName: 'Gate',
        })
        .expect(201);
      organizationId = res.body.id;

      await request(app.getHttpServer())
        .patch(`/api/admin/organizations/${organizationId}/modules`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ modules: { contacts: false } })
        .expect(200);

      const impersonation = await request(app.getHttpServer())
        .post(`/api/admin/organizations/${organizationId}/impersonate`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
      tenantToken = impersonation.body.accessToken as string;

      await request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);
      const blocked = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ firstName: 'X', phoneNumber: '+10000000099' })
        .expect(403);
      expect(blocked.body.message).toMatch(/disabled for your account/i);

      // lists/templates remain unaffected — only the toggled module is gated.
      await request(app.getHttpServer())
        .get('/api/lists')
        .set('Authorization', `Bearer ${tenantToken}`)
        .expect(200);
    });
  });

  it('404s for an unknown organization id on every action', async () => {
    const bogus = 'does-not-exist';
    await request(app.getHttpServer())
      .get(`/api/admin/organizations/${bogus}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/admin/organizations/${bogus}/suspend`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/admin/organizations/${bogus}/impersonate`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(404);
  });
});
