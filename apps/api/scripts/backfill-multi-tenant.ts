// One-off migration script: converts this single-tenant deployment into
// Customer #1 of the new multi-tenant model.
//
//   - admin@whatsapp-crm.local becomes the Super Admin (organizationId
//     null, "Super Admin" role) — the platform operator identity.
//   - The existing "Default Organization" becomes Customer #1. Every
//     existing tenant-owned row (contacts, campaigns, messages, the
//     WhatsApp account, the credit wallet + its transaction history, etc.)
//     is backfilled to belong to it — nothing is deleted or recreated.
//   - A brand-new Customer Admin login is created for Customer #1, since
//     admin@whatsapp-crm.local is moving to the Super Admin role instead.
//
// Safe to re-run: every step is idempotent (backfills only rows that are
// still unscoped, upserts the new admin only if it doesn't already exist).
import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const SUPER_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL ?? 'admin@whatsapp-crm.local';
const NEW_CUSTOMER_ADMIN_EMAIL =
  process.env.CUSTOMER1_ADMIN_EMAIL ?? 'owner@default-organization.local';

async function main() {
  const defaultOrg = await prisma.organization.findFirst({
    where: { name: 'Default Organization' },
  });
  if (!defaultOrg) {
    throw new Error(
      'No "Default Organization" found — nothing to migrate. Run this only against the pre-existing single-tenant database.',
    );
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'Super Admin' },
  });
  const customerAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'Admin' },
  });

  // --- Backfill organizationId on every existing tenant-owned row ---
  const backfillTargets = [
    { name: 'Contact', model: prisma.contact },
    { name: 'List', model: prisma.list },
    { name: 'ListMember', model: prisma.listMember },
    { name: 'Template', model: prisma.template },
    { name: 'Campaign', model: prisma.campaign },
    { name: 'CampaignRecipient', model: prisma.campaignRecipient },
    { name: 'Automation', model: prisma.automation },
    { name: 'WhatsAppAccount', model: prisma.whatsAppAccount },
    { name: 'Conversation', model: prisma.conversation },
    { name: 'Message', model: prisma.message },
    { name: 'Media', model: prisma.media },
    { name: 'CreditTransaction', model: prisma.creditTransaction },
  ] as const;

  for (const target of backfillTargets) {
    const result = await (target.model as any).updateMany({
      where: { organizationId: null },
      data: { organizationId: defaultOrg.id },
    });
    console.log(`Backfilled ${target.name}: ${result.count} row(s)`);
  }

  // --- Migrate the single global wallet to Customer #1's wallet ---
  const walletResult = await prisma.creditWallet.updateMany({
    where: { organizationId: null },
    data: { organizationId: defaultOrg.id },
  });
  console.log(`Backfilled CreditWallet: ${walletResult.count} row(s)`);

  // --- Promote the bootstrap admin to Super Admin ---
  const superAdmin = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });
  if (!superAdmin) {
    throw new Error(`Expected user ${SUPER_ADMIN_EMAIL} to already exist.`);
  }
  await prisma.user.update({
    where: { id: superAdmin.id },
    data: { roleId: superAdminRole.id, organizationId: null },
  });
  console.log(`Promoted ${SUPER_ADMIN_EMAIL} to Super Admin (organizationId: null)`);

  // --- Every other existing user belongs to Customer #1 ---
  const otherUsers = await prisma.user.findMany({
    where: { id: { not: superAdmin.id }, organizationId: null },
  });
  for (const user of otherUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: defaultOrg.id },
    });
    console.log(`Assigned ${user.email} to Customer #1 (${defaultOrg.name})`);
  }

  // --- New Customer Admin login for Customer #1 ---
  const existingCustomerAdmin = await prisma.user.findUnique({
    where: { email: NEW_CUSTOMER_ADMIN_EMAIL },
  });
  if (existingCustomerAdmin) {
    console.log(
      `Customer #1 admin already exists: ${NEW_CUSTOMER_ADMIN_EMAIL} (skipped)`,
    );
  } else {
    const password = randomBytes(9).toString('base64url');
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email: NEW_CUSTOMER_ADMIN_EMAIL,
        passwordHash,
        firstName: 'Default',
        lastName: 'Admin',
        roleId: customerAdminRole.id,
        organizationId: defaultOrg.id,
      },
    });
    console.log('');
    console.log('=== New Customer #1 admin login (change this immediately) ===');
    console.log(`  email:    ${NEW_CUSTOMER_ADMIN_EMAIL}`);
    console.log(`  password: ${password}`);
    console.log('================================================================');
  }

  console.log('\nMigration complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
