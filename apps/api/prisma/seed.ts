import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import { ALL_PERMISSIONS, PERMISSIONS } from '../src/common/permissions';

const AGENT_PERMISSIONS = [
  PERMISSIONS.CONTACTS_MANAGE,
  PERMISSIONS.LISTS_MANAGE,
  PERMISSIONS.MESSAGES_MANAGE,
  PERMISSIONS.TEMPLATES_MANAGE,
  PERMISSIONS.CAMPAIGNS_MANAGE,
];

// "Admin" = Customer Admin, scoped to their own organization. Settings and
// organization management are platform-level (Super Admin only). Role
// management is also excluded — Role is a global, unscoped table shared by
// every tenant (see RolesController), so granting it to a Customer Admin
// would let them view/edit roles belonging to (and shared with) every other
// customer, including Super Admin's own role. Customer Admins just assign
// the two fixed system roles via UsersService.assignableRoles() instead.
const CUSTOMER_ADMIN_PERMISSIONS = ALL_PERMISSIONS.filter(
  (key) =>
    key !== PERMISSIONS.SETTINGS_MANAGE &&
    key !== PERMISSIONS.ORGANIZATIONS_MANAGE &&
    key !== PERMISSIONS.ROLES_MANAGE,
);

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

async function main() {
  for (const key of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {
      permissions: { set: CUSTOMER_ADMIN_PERMISSIONS.map((key) => ({ key })) },
    },
    create: {
      name: 'Admin',
      description: "Full access to a single customer's own CRM",
      isSystem: true,
      permissions: {
        connect: CUSTOMER_ADMIN_PERMISSIONS.map((key) => ({ key })),
      },
    },
  });
  void adminRole;

  await prisma.role.upsert({
    where: { name: 'Agent' },
    update: {
      permissions: { set: AGENT_PERMISSIONS.map((key) => ({ key })) },
    },
    create: {
      name: 'Agent',
      description: 'Day-to-day CRM user without admin access',
      isSystem: true,
      permissions: { connect: AGENT_PERMISSIONS.map((key) => ({ key })) },
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {
      permissions: { set: ALL_PERMISSIONS.map((key) => ({ key })) },
    },
    create: {
      name: 'Super Admin',
      description: 'Platform operator — manages customers, plans, and platform settings',
      isSystem: true,
      permissions: { connect: ALL_PERMISSIONS.map((key) => ({ key })) },
    },
  });

  // Bootstrap login for a fresh deployment. Not tied to any organization —
  // customers (and their own Admin logins) are created afterwards through
  // the Super Admin UI, not seeded here.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@whatsapp-crm.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        roleId: superAdminRole.id,
      },
    });
    console.log(`Seeded Super Admin: ${adminEmail} / ${adminPassword} (change this password)`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  console.log('Seed complete:', {
    permissions: ALL_PERMISSIONS.length,
    roles: ['Admin', 'Agent', 'Super Admin'],
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
