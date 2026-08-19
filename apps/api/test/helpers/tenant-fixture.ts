import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';

export interface TenantFixture {
  organizationId: string;
  userId: string;
  email: string;
  token: string;
}

// Most e2e suites need one working Customer Admin login scoped to its own
// fresh Organization — the tenant-facing controllers all require a real
// organizationId now, so the old pattern of testing everything through the
// single global admin@whatsapp-crm.local (now Super Admin, organizationId
// null) no longer applies to any tenant-scoped endpoint.
export async function createTenantAdmin(
  app: INestApplication,
  prisma: PrismaService,
  label: string,
): Promise<TenantFixture> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const org = await prisma.organization.create({
    data: { name: `${label} Org ${suffix}` },
  });
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'Admin' },
  });
  const email = `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${suffix}@e2e.local`;
  const password = 'E2eTenantPass123!';
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: label,
      lastName: 'Admin',
      roleId: adminRole.id,
      organizationId: org.id,
    },
  });

  const login = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    organizationId: org.id,
    userId: user.id,
    email,
    token: login.body.accessToken as string,
  };
}

// FK-safe teardown for everything createTenantAdmin's org can accumulate
// during a test run. Extend the `extra` array with any suite-specific
// deletes that must happen before the organization itself can be removed.
export async function cleanupTenant(
  prisma: PrismaService,
  fixture: TenantFixture,
  extra: (() => Promise<unknown>)[] = [],
): Promise<void> {
  for (const step of extra) {
    await step();
  }
  // Deliberately not scoped to just fixture.userId: a suite may create
  // extra users under this org during the test (e.g. an Agent via
  // POST /users), and leaving those behind would fail the FK-safe org
  // delete below.
  await cleanupOrganization(prisma, fixture.organizationId);
}

// Same FK-safe teardown as cleanupTenant, but keyed directly by id — for
// organizations created through the admin API rather than createTenantAdmin
// (whose response shape doesn't match TenantFixture). Deletes every user in
// the org, not just one, since admin-created orgs can end up with several
// (the initial Customer Admin plus any reset-password/impersonate targets).
export async function cleanupOrganization(
  prisma: PrismaService,
  organizationId: string,
  singleUserId?: string,
): Promise<void> {
  await prisma.creditTransaction.deleteMany({ where: { organizationId } });
  await prisma.creditWallet.deleteMany({ where: { organizationId } });
  await prisma.campaignRecipient.deleteMany({ where: { organizationId } });
  await prisma.campaign.deleteMany({ where: { organizationId } });
  await prisma.message.deleteMany({ where: { organizationId } });
  await prisma.conversation.deleteMany({ where: { organizationId } });
  await prisma.media.deleteMany({ where: { organizationId } });
  await prisma.template.deleteMany({ where: { organizationId } });
  await prisma.automation.deleteMany({ where: { organizationId } });
  await prisma.listMember.deleteMany({ where: { organizationId } });
  await prisma.list.deleteMany({ where: { organizationId } });
  await prisma.contact.deleteMany({ where: { organizationId } });
  await prisma.whatsAppAccount.deleteMany({ where: { organizationId } });
  if (singleUserId) {
    await prisma.refreshToken.deleteMany({ where: { userId: singleUserId } });
    await prisma.user.deleteMany({ where: { id: singleUserId } });
  } else {
    const userIds = (
      await prisma.user.findMany({ where: { organizationId }, select: { id: true } })
    ).map((u) => u.id);
    await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { organizationId } });
  }
  await prisma.organization.delete({ where: { id: organizationId } });
}

export async function loginSuperAdmin(app: INestApplication): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'admin@whatsapp-crm.local', password: 'ChangeMe123!' })
    .expect(200);
  return res.body.accessToken as string;
}
