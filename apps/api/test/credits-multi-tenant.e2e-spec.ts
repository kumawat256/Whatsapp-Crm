import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreditsService } from '../src/credits/credits.service';
import {
  cleanupTenant,
  createTenantAdmin,
  loginSuperAdmin,
  TenantFixture,
} from './helpers/tenant-fixture';

// Proves the two credit-safety guarantees from the multi-tenant spec:
// 1. Separate per-org wallets — a debit against org A never touches org B's
//    balance or ledger, even though both wallets are the same model/table.
// 2. Race-safety — concurrent debits against one wallet can never drive the
//    balance negative, because CreditsService.debit() uses a single atomic
//    conditional UPDATE ("WHERE id = ? AND balance >= ?") rather than a
//    separate check-then-act pair.
describe('Credits: multi-tenant separation + concurrency (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let creditsService: CreditsService;
  let orgA: TenantFixture;
  let orgB: TenantFixture;
  let superAdminToken: string;

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
    creditsService = app.get(CreditsService);
    orgA = await createTenantAdmin(app, prisma, 'Credits Isolation Org A');
    orgB = await createTenantAdmin(app, prisma, 'Credits Isolation Org B');
    superAdminToken = await loginSuperAdmin(app);
  });

  afterAll(async () => {
    await cleanupTenant(prisma, orgA);
    await cleanupTenant(prisma, orgB);
    await app.close();
  });

  it('each org gets its own wallet, lazily created at a zero balance', async () => {
    const walletA = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgA.token}`)
      .expect(200);
    const walletB = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);

    expect(walletA.body.balance).toBe(0);
    expect(walletB.body.balance).toBe(0);
    expect(walletA.body.id).not.toBe(walletB.body.id);
  });

  it("topping up org A's wallet does not change org B's balance", async () => {
    const topup = await request(app.getHttpServer())
      .post(`/api/admin/organizations/${orgA.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'CREDIT', amount: 50, reason: 'Isolation test top-up' })
      .expect(201);
    expect(topup.body.balance).toBe(50);

    const walletB = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(walletB.body.balance).toBe(0);

    const txB = await request(app.getHttpServer())
      .get('/api/credits/transactions')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(txB.body.data).toHaveLength(0);
  });

  it("debiting org A's wallet does not change org B's balance or ledger", async () => {
    await creditsService.debit(orgA.organizationId, 20, 'Isolation debit test');

    const walletA = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgA.token}`)
      .expect(200);
    expect(walletA.body.balance).toBe(30);

    const walletB = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(walletB.body.balance).toBe(0);

    const txB = await request(app.getHttpServer())
      .get('/api/credits/transactions')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(txB.body.data).toHaveLength(0);
  });

  it('concurrent debits against the same wallet never drive the balance negative', async () => {
    // org B starts at 0; top it up to exactly 10, then fire 20 concurrent
    // 1-credit debits. Exactly 10 must succeed and 10 must fail with
    // "Insufficient credits" — if the check-then-act race existed, more
    // than 10 could succeed and the balance would go negative.
    await request(app.getHttpServer())
      .post(`/api/admin/organizations/${orgB.organizationId}/credits/adjust`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ type: 'CREDIT', amount: 10, reason: 'Concurrency test top-up' })
      .expect(201);

    const attempts = 20;
    const results = await Promise.allSettled(
      Array.from({ length: attempts }, () =>
        creditsService.debit(orgB.organizationId, 1, 'Concurrency test debit'),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');
    expect(succeeded).toHaveLength(10);
    expect(failed).toHaveLength(10);

    const walletB = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgB.token}`)
      .expect(200);
    expect(walletB.body.balance).toBe(0);
    expect(walletB.body.balance).toBeGreaterThanOrEqual(0);

    const txB = await request(app.getHttpServer())
      .get('/api/credits/transactions')
      .set('Authorization', `Bearer ${orgB.token}`)
      .query({ type: 'DEBIT', pageSize: 50 })
      .expect(200);
    expect(txB.body.data).toHaveLength(10);

    // org A's balance and ledger must be completely unaffected by org B's
    // concurrency stress test.
    const walletA = await request(app.getHttpServer())
      .get('/api/credits/wallet')
      .set('Authorization', `Bearer ${orgA.token}`)
      .expect(200);
    expect(walletA.body.balance).toBe(30);
  });
});
