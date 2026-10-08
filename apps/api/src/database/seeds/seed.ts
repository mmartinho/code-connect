import * as bcrypt from 'bcryptjs';
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { DataSource, In } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { PostLike } from '../../posts/entities/post-like.entity';
import { Post } from '../../posts/entities/post.entity';
import { Tag } from '../../posts/entities/tag.entity';
import { uploadsDir } from '../../posts/thumbnail-storage';
import { User } from '../../users/entities/user.entity';
import {
  SEED_EMAIL_DOMAIN,
  SEED_PASSWORD,
  seedComments,
  seedPosts,
  seedUsers,
} from './seed-data';

const HOUR = 60 * 60 * 1000;

/**
 * Recreates the demo data. Idempotent: everything owned by the seed users is
 * removed first (posts, likes and comments cascade from the user).
 */
export async function runSeed(dataSource: DataSource): Promise<void> {
  const users = dataSource.getRepository(User);
  const tags = dataSource.getRepository(Tag);
  const posts = dataSource.getRepository(Post);
  const comments = dataSource.getRepository(Comment);
  const likes = dataSource.getRepository(PostLike);

  await dataSource.query('DELETE FROM users WHERE email LIKE ?', [
    `%@${SEED_EMAIL_DOMAIN}`,
  ]);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const authors = await users.save(
    seedUsers.map((user) => users.create({ ...user, passwordHash })),
  );

  const tagNames = [...new Set(seedPosts.flatMap((post) => post.tags))];
  const existingTags = await tags.findBy({ name: In(tagNames) });
  const known = new Set(existingTags.map((tag) => tag.name.toLowerCase()));
  const newTags = await tags.save(
    tagNames
      .filter((name) => !known.has(name.toLowerCase()))
      .map((name) => tags.create({ name })),
  );
  const tagByName = new Map(
    [...existingTags, ...newTags].map((tag) => [tag.name.toLowerCase(), tag]),
  );

  await mkdir(uploadsDir(), { recursive: true });
  const now = Date.now();

  for (const [index, data] of seedPosts.entries()) {
    if (data.thumbnail) {
      await copyFile(
        join(__dirname, 'assets', data.thumbnail),
        join(uploadsDir(), data.thumbnail),
      );
    }

    const created = new Date(now - index * 3 * HOUR);
    const post = await posts.save(
      posts.create({
        authorId: authors[data.author].id,
        title: data.title,
        body: data.body,
        code: data.code,
        thumbnailPath: data.thumbnail ?? null,
        tags: data.tags.map((name) => tagByName.get(name.toLowerCase())!),
        createdAt: created,
      }),
    );

    // Two or three threads per post, rotating through the sample comments.
    let commentsCount = 0;
    const threads = [0, 1, 2].slice(0, 2 + (index % 2));
    for (const [position, offset] of threads.entries()) {
      const sample = seedComments[(index + offset) % seedComments.length];
      const at = new Date(created.getTime() + (position + 1) * 10 * 60 * 1000);
      const top = await comments.save(
        comments.create({
          postId: post.id,
          authorId: authors[sample.author].id,
          body: sample.body,
          createdAt: at,
        }),
      );
      commentsCount++;
      for (const [n, reply] of (sample.replies ?? []).entries()) {
        await comments.save(
          comments.create({
            postId: post.id,
            authorId: authors[reply.author].id,
            parentId: top.id,
            body: reply.body,
            createdAt: new Date(at.getTime() + (n + 1) * 60 * 1000),
          }),
        );
        commentsCount++;
      }
    }

    const likers = authors.filter((_, n) => (index + n) % 3 !== 0);
    await likes.save(
      likers.map((user) => likes.create({ postId: post.id, userId: user.id })),
    );
    await posts.update(post.id, {
      likesCount: likers.length,
      commentsCount,
    });
  }
}
