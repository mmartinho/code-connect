import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/setup-app';
import { User } from './../src/users/entities/user.entity';

describe('Users and auth (e2e)', () => {
  let app: INestApplication;
  const user = {
    name: 'Ana',
    email: 'ana@exemplo.com',
    password: 'senha-segura-123',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    await app.get(DataSource).getRepository(User).clear();
  });

  afterAll(() => app.close());

  it('registers a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users')
      .send(user)
      .expect(201);

    expect(res.headers.location).toBe(`/v1/users/${res.body.id}`);
    expect(res.body).toMatchObject({ name: 'Ana', email: user.email });
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body).not.toHaveProperty('password');
  });

  it('rejects a duplicated email with 409', () =>
    request(app.getHttpServer()).post('/v1/users').send(user).expect(409));

  it('rejects an invalid body with 422', () =>
    request(app.getHttpServer())
      .post('/v1/users')
      .send({ name: '', email: 'x', password: '1' })
      .expect(422));

  it('rejects wrong credentials with 401', () =>
    request(app.getHttpServer())
      .post('/v1/auth/tokens')
      .send({ email: user.email, password: 'errada-errada' })
      .expect(401));

  it('logs in and reads the current user', async () => {
    const login = await request(app.getHttpServer())
      .post('/v1/auth/tokens')
      .send({ email: user.email, password: user.password })
      .expect(201);
    expect(login.body.tokenType).toBe('Bearer');

    const me = await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(me.body.email).toBe(user.email);
    expect(me.body).not.toHaveProperty('passwordHash');
    expect(me.headers['cache-control']).toBe('no-store');
  });

  it('rejects /me without or with an invalid token', async () => {
    await request(app.getHttpServer()).get('/v1/users/me').expect(401);
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', 'Bearer invalid')
      .expect(401);
  });
});
