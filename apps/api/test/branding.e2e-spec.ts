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

describe('Branding (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
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
    tenant = await createTenantAdmin(app, prisma, 'Branding Test');
    superAdminToken = await loginSuperAdmin(app);
  });

  afterAll(async () => {
    // Leave the shared dev DB's branding exactly as this suite found it.
    await prisma.systemSetting.deleteMany({
      where: { key: { in: ['branding.appName', 'branding.supportContact'] } },
    });
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('is readable with no authentication at all — the login page needs it before anyone is signed in', async () => {
    await request(app.getHttpServer()).get('/api/branding').expect(200);
  });

  it('falls back to sensible defaults when nothing has been configured yet', async () => {
    await prisma.systemSetting.deleteMany({
      where: { key: { in: ['branding.appName', 'branding.supportContact'] } },
    });
    const res = await request(app.getHttpServer()).get('/api/branding').expect(200);
    expect(res.body).toEqual({ appName: 'WhatsApp CRM', supportContact: null });
  });

  it('rejects a tenant Admin from changing branding — platform-wide, Super Admin only', async () => {
    await request(app.getHttpServer())
      .put('/api/settings/branding.appName')
      .set('Authorization', `Bearer ${tenant.token}`)
      .send({ value: 'Should not work' })
      .expect(403);
  });

  it('lets Super Admin set the app name and support contact, reflected immediately and platform-wide', async () => {
    await request(app.getHttpServer())
      .put('/api/settings/branding.appName')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ value: 'E2E Branded CRM' })
      .expect(200);
    await request(app.getHttpServer())
      .put('/api/settings/branding.supportContact')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ value: '+91 90000 00000' })
      .expect(200);

    const res = await request(app.getHttpServer()).get('/api/branding').expect(200);
    expect(res.body).toEqual({
      appName: 'E2E Branded CRM',
      supportContact: '+91 90000 00000',
    });

    // A tenant Admin (or anyone else) sees the same platform-wide branding.
    const tenantView = await request(app.getHttpServer())
      .get('/api/branding')
      .set('Authorization', `Bearer ${tenant.token}`)
      .expect(200);
    expect(tenantView.body).toEqual(res.body);
  });

  it('hides the support contact once cleared back to empty', async () => {
    await request(app.getHttpServer())
      .put('/api/settings/branding.supportContact')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ value: '' })
      .expect(200);

    const res = await request(app.getHttpServer()).get('/api/branding').expect(200);
    expect(res.body.supportContact).toBeNull();
  });
});
