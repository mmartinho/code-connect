import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/setup-app';

// 1x1 transparent PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

describe('Posts feed (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let ana: string;
  let bia: string;
  let postId: string;

  const register = async (name: string) => {
    const email = `${name.toLowerCase()}@exemplo.com`;
    const password = 'senha-segura-123';
    await request(server).post('/v1/users').send({ name, email, password });
    const res = await request(server)
      .post('/v1/auth/tokens')
      .send({ email, password })
      .expect(201);
    return res.body.accessToken as string;
  };
  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    await app.get(DataSource).query('DELETE FROM users');
    await app.get(DataSource).query('DELETE FROM tags');
    server = app.getHttpServer();
    ana = await register('Ana');
    bia = await register('Bia');
  });

  afterAll(() => app.close());

  it('rejects publishing without a token with 401', () =>
    request(server)
      .post('/v1/posts')
      .field('title', 'x')
      .field('body', 'y')
      .expect(401));

  it('publishes a post with tags and a thumbnail', async () => {
    const res = await request(server)
      .post('/v1/posts')
      .set(bearer(ana))
      .field('title', 'Vamos dobrar a meta')
      .field('body', 'Quando atingirmos a meta, vamos dobrar a meta.')
      .field('code', 'const meta = () => meta() * 2')
      .field('tags', 'Front-end')
      .field('tags', 'React')
      .attach('thumbnail', png, { filename: 't.png', contentType: 'image/png' })
      .expect(201);

    postId = res.body.id;
    expect(res.headers.location).toBe(`/v1/posts/${postId}`);
    expect(res.body.tags).toEqual(['Front-end', 'React']);
    expect(res.body.thumbnailUrl).toMatch(/\/uploads\/.+\.png$/);
    expect(res.body.canDelete).toBe(true);
  });

  it('rejects a non-image thumbnail with 422', () =>
    request(server)
      .post('/v1/posts')
      .set(bearer(ana))
      .field('title', 'x')
      .field('body', 'y')
      .attach('thumbnail', Buffer.from('nope'), {
        filename: 't.txt',
        contentType: 'text/plain',
      })
      .expect(422));

  it('lets anonymous users read the feed and a post', async () => {
    const list = await request(server).get('/v1/posts').expect(200);
    expect(list.body.meta.total).toBe(1);
    expect(list.body.data[0]).toMatchObject({
      id: postId,
      likedByMe: false,
      likesCount: 0,
    });
    expect(list.headers['cache-control']).toBe('public, max-age=30');

    const detail = await request(server).get(`/v1/posts/${postId}`).expect(200);
    expect(detail.body.code).toContain('meta');
    expect(detail.body.canDelete).toBe(false);
  });

  it('searches with full text, prefix matching and tag filter', async () => {
    const hit = await request(server).get('/v1/posts?q=dobr').expect(200);
    expect(hit.body.meta.total).toBe(1);
    const miss = await request(server).get('/v1/posts?q=mandioca').expect(200);
    expect(miss.body.meta.total).toBe(0);
    const byTag = await request(server)
      .get('/v1/posts?tags=react,front-end')
      .expect(200);
    expect(byTag.body.meta.total).toBe(1);
    const noTag = await request(server)
      .get('/v1/posts?tags=angular')
      .expect(200);
    expect(noTag.body.meta.total).toBe(0);
  });

  it('does not let anonymous users like or comment', async () => {
    await request(server).put(`/v1/posts/${postId}/likes/me`).expect(401);
    await request(server)
      .post(`/v1/posts/${postId}/comments`)
      .send({ body: 'oi' })
      .expect(401);
  });

  it('likes and unlikes idempotently', async () => {
    await request(server)
      .put(`/v1/posts/${postId}/likes/me`)
      .set(bearer(bia))
      .expect(204);
    await request(server)
      .put(`/v1/posts/${postId}/likes/me`)
      .set(bearer(bia))
      .expect(204);
    let detail = await request(server)
      .get(`/v1/posts/${postId}`)
      .set(bearer(bia))
      .expect(200);
    expect(detail.body).toMatchObject({ likesCount: 1, likedByMe: true });
    expect(detail.headers['cache-control']).toBe('no-store');

    const popular = await request(server)
      .get('/v1/posts?sort=popular')
      .expect(200);
    expect(popular.body.data[0].id).toBe(postId);

    await request(server)
      .delete(`/v1/posts/${postId}/likes/me`)
      .set(bearer(bia))
      .expect(204);
    await request(server)
      .delete(`/v1/posts/${postId}/likes/me`)
      .set(bearer(bia))
      .expect(204);
    detail = await request(server).get(`/v1/posts/${postId}`).expect(200);
    expect(detail.body.likesCount).toBe(0);
  });

  it('comments and replies one level deep', async () => {
    const top = await request(server)
      .post(`/v1/posts/${postId}/comments`)
      .set(bearer(bia))
      .send({ body: 'Muito bom!' })
      .expect(201);
    expect(top.headers.location).toContain(`/v1/posts/${postId}/comments/`);

    const reply = await request(server)
      .post(`/v1/posts/${postId}/comments`)
      .set(bearer(ana))
      .send({ body: 'Valeu!', parentId: top.body.id })
      .expect(201);
    await request(server)
      .post(`/v1/posts/${postId}/comments`)
      .set(bearer(ana))
      .send({ body: 'resposta de resposta', parentId: reply.body.id })
      .expect(422);

    const list = await request(server)
      .get(`/v1/posts/${postId}/comments`)
      .expect(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].replies).toHaveLength(1);
    expect(list.body[0].replies[0].author.name).toBe('Ana');

    const detail = await request(server).get(`/v1/posts/${postId}`).expect(200);
    expect(detail.body.commentsCount).toBe(2);
  });

  it('only lets the author delete a post', async () => {
    await request(server)
      .delete(`/v1/posts/${postId}`)
      .set(bearer(bia))
      .expect(403);
    await request(server)
      .delete(`/v1/posts/${postId}`)
      .set(bearer(ana))
      .expect(204);
    await request(server).get(`/v1/posts/${postId}`).expect(404);
  });
});
