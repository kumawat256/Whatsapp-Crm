import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

function extractRefreshCookie(res: request.Response): string {
  const raw = res.headers['set-cookie']?.[0] as string;
  return raw.split(';')[0];
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const adminEmail = 'admin@whatsapp-crm.local';
  const adminPassword = 'ChangeMe123!';
  const throwawayEmail = `e2e-agent-${Date.now()}@whatsapp-crm.local`;

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
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: throwawayEmail } });
    await app.close();
  });

  it('rejects login with a bad password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'wrong-password' })
      .expect(401);
  });

  it('logs in and returns an access token + refresh cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);

    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user.role).toBe('Super Admin');
    expect(res.headers['set-cookie']?.[0]).toMatch(/refresh_token=.*HttpOnly/);
  });

  it('rejects protected routes without a token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('allows an admin to create a user, and blocks that user from admin routes', async () => {
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    const adminToken = adminLogin.body.accessToken;

    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: throwawayEmail,
        password: 'AgentPass123!',
        firstName: 'E2E',
        lastName: 'Agent',
        roleName: 'Agent',
      })
      .expect(201);

    const agentLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: throwawayEmail, password: 'AgentPass123!' })
      .expect(200);
    const agentToken = agentLogin.body.accessToken;

    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        email: 'blocked@whatsapp-crm.local',
        password: 'Whatever123!',
        firstName: 'X',
        lastName: 'Y',
        roleName: 'Agent',
      })
      .expect(403);
  });

  it('rotates the refresh token and rejects reuse of the rotated-out one', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    const originalCookie = extractRefreshCookie(loginRes);

    const refreshRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', originalCookie)
      .expect(200);
    const rotatedCookie = extractRefreshCookie(refreshRes);
    expect(rotatedCookie).not.toBe(originalCookie);

    // The rotated-out cookie must now be rejected.
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', originalCookie)
      .expect(401);

    // Reuse detection revokes the whole chain, so even the freshly
    // rotated cookie is dead now.
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', rotatedCookie)
      .expect(401);
  });
});
