import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { cleanupTenant, createTenantAdmin, TenantFixture } from './helpers/tenant-fixture';

describe('Contacts, Lists (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: TenantFixture;
  const suffix = Date.now();
  let adminToken: string;

  const phone1 = `+1555${suffix}1`;
  const phone2 = `+1555${suffix}2`;
  const bareIndianNumber = `9${String(suffix).slice(-9)}`; // 10 digits, no country code
  const normalizedIndianPhone = `+91${bareIndianNumber}`;
  const csvBareIndianNumber = `8${String(suffix).slice(-9)}`;
  const csvNormalizedIndianPhone = `+91${csvBareIndianNumber}`;
  let contactId: string;
  let listId: string;
  let autoCountryCodeContactId: string;

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
    tenant = await createTenantAdmin(app, prisma, 'Contacts Test');
    adminToken = tenant.token;
  });

  afterAll(async () => {
    await cleanupTenant(prisma, tenant);
    await app.close();
  });

  it('creates, finds, and rejects a duplicate-phone contact', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Jane', lastName: 'Doe', phoneNumber: phone1 })
      .expect(201);
    contactId = res.body.id;

    await request(app.getHttpServer())
      .post('/api/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Dup', phoneNumber: phone1 })
      .expect(409);

    const listRes = await request(app.getHttpServer())
      .get('/api/contacts')
      .query({ search: 'Jane' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      listRes.body.data.some((c: { id: string }) => c.id === contactId),
    ).toBe(true);
    expect(listRes.body.page).toBe(1);
  });

  it('auto-adds the +91 country code when a contact is created without one', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'NoCode', phoneNumber: bareIndianNumber })
      .expect(201);
    autoCountryCodeContactId = res.body.id;
    expect(res.body.phoneNumber).toBe(normalizedIndianPhone);

    // A trunk-prefix "0" and the country code typed without "+" both
    // normalize to the same number, so both correctly collide as dupes.
    await request(app.getHttpServer())
      .post('/api/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Dup', phoneNumber: `0${bareIndianNumber}` })
      .expect(409);
    await request(app.getHttpServer())
      .post('/api/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Dup', phoneNumber: `91${bareIndianNumber}` })
      .expect(409);
  });

  it('also auto-adds the country code on update', async () => {
    // Bump the last digit so it's a different-but-still-unique number,
    // exercising the same @Transform on UpdateContactDto (via PartialType).
    const updatedBareNumber = bareIndianNumber.slice(0, -1) + '0';
    const res = await request(app.getHttpServer())
      .patch(`/api/contacts/${autoCountryCodeContactId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phoneNumber: updatedBareNumber })
      .expect(200);
    expect(res.body.phoneNumber).toBe(`+91${updatedBareNumber}`);
  });

  it('opts a contact out and back in', async () => {
    const optOut = await request(app.getHttpServer())
      .post(`/api/contacts/${contactId}/opt-out`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    expect(optOut.body.isOptedOut).toBe(true);
    expect(optOut.body.optedOutAt).toEqual(expect.any(String));

    const optIn = await request(app.getHttpServer())
      .post(`/api/contacts/${contactId}/opt-in`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    expect(optIn.body.isOptedOut).toBe(false);
    expect(optIn.body.optedOutAt).toBeNull();
  });

  it('creates a list and manages membership', async () => {
    const listRes = await request(app.getHttpServer())
      .post('/api/lists')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `E2E List ${suffix}` })
      .expect(201);
    listId = listRes.body.id;

    await request(app.getHttpServer())
      .post(`/api/lists/${listId}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ contactIds: [contactId] })
      .expect(201);

    const membersRes = await request(app.getHttpServer())
      .get(`/api/lists/${listId}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      membersRes.body.data.some((c: { id: string }) => c.id === contactId),
    ).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/lists/${listId}/members/${contactId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const afterRemove = await request(app.getHttpServer())
      .get(`/api/lists/${listId}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      afterRemove.body.data.some((c: { id: string }) => c.id === contactId),
    ).toBe(false);
  });

  it('imports contacts from CSV, creating and updating rows', async () => {
    const csv = [
      'firstName,lastName,phoneNumber,notes,source',
      `Imported,User,${phone2},,csv`,
      `Jane,Updated,${phone1},,`,
      `NoCode,Csv,${csvBareIndianNumber},,`, // no country code — auto-normalized
      ',,,,', // invalid row: missing firstName + phoneNumber
    ].join('\n');

    const res = await request(app.getHttpServer())
      .post('/api/contacts/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csv), 'contacts.csv')
      .expect(201);

    expect(res.body.created).toBe(2);
    expect(res.body.updated).toBe(1);
    expect(res.body.skipped).toHaveLength(1);

    const csvImported = await prisma.contact.findFirst({
      where: { phoneNumber: csvNormalizedIndianPhone },
    });
    expect(csvImported).not.toBeNull();

    const updated = await request(app.getHttpServer())
      .get(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(updated.body.lastName).toBe('Updated');
  });

  it('exports contacts as CSV', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/contacts/export')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain(phone1);
  });

  it('rejects a non-csv import upload', async () => {
    await request(app.getHttpServer())
      .post('/api/contacts/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('not a csv'), 'notes.txt')
      .expect(400);
  });

  it('deletes the contact and list', async () => {
    await request(app.getHttpServer())
      .delete(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/lists/${listId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
