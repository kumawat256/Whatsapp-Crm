// One-off, destructive: wipes every organization and everything under it,
// deletes every user, and leaves exactly one user behind — a fresh Super
// Admin. Run once, by hand, never as part of normal app startup.
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';

const NEW_SUPER_ADMIN = {
  email: 'kumawat256@gmail.com',
  password: '12345678',
  firstName: 'Super',
  lastName: 'Admin',
};

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

async function main() {
  console.log('Deleting all tenant-owned data...');
  await prisma.campaignRecipient.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.media.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.template.deleteMany();
  await prisma.automation.deleteMany();
  await prisma.listMember.deleteMany();
  await prisma.list.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.whatsAppSession.deleteMany();
  await prisma.whatsAppAccount.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.creditWallet.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();

  console.log('Deleting all users...');
  await prisma.user.deleteMany();

  console.log('Deleting all organizations...');
  await prisma.organization.deleteMany();

  console.log('Creating the new Super Admin...');
  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'Super Admin' },
  });
  const passwordHash = await bcrypt.hash(NEW_SUPER_ADMIN.password, 12);
  const user = await prisma.user.create({
    data: {
      email: NEW_SUPER_ADMIN.email,
      passwordHash,
      firstName: NEW_SUPER_ADMIN.firstName,
      lastName: NEW_SUPER_ADMIN.lastName,
      roleId: superAdminRole.id,
      organizationId: null,
    },
  });

  console.log('Done. New Super Admin:', {
    id: user.id,
    email: user.email,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
