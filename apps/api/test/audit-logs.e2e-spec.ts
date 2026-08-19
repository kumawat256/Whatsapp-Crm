import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function waitFor(
  check: () => Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

describe('Audit logs (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const suffix = Date.now();
  let adminToken: string;
  let adminId: string;
  const settingKey = `e2e.audit.${suffix}`;

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
    await prisma.auditLog.deleteMany({ where: { entityId: settingKey } });
    await prisma.systemSetting.deleteMany({ where: { key: settingKey } });
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/api/audit-logs').expect(401);
  });

  it('records an entry for an audited admin action and it shows up in the log', async () => {
    await request(app.getHttpServer())
      .put(`/api/settings/${settingKey}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ value: { hello: 'world' } })
      .expect(200);

    await waitFor(async () => {
      const entry = await prisma.auditLog.findFirst({
        where: { action: 'setting.update', entityId: settingKey },
      });
      return !!entry;
    });

    const res = await request(app.getHttpServer())
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ action: 'setting.update', entityType: 'SystemSetting' })
      .expect(200);

    const entry = res.body.data.find(
      (e: { entityId: string }) => e.entityId === settingKey,
    );
    expect(entry).toMatchObject({
      action: 'setting.update',
      entityType: 'SystemSetting',
      entityId: settingKey,
      userId: adminId,
    });
    expect(entry.user.email).toBe('admin@whatsapp-crm.local');
  });

  it('filters by userId', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ userId: adminId, pageSize: 5 })
      .expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.every((e: { userId: string }) => e.userId === adminId),
    ).toBe(true);
  });
});
