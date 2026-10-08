import { DataSourceOptions } from 'typeorm';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { Post } from '../posts/entities/post.entity';
import { Tag } from '../posts/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { CreatePosts1791400000000 } from './migrations/1791400000000-CreatePosts';
import { CreateUsers1791320000000 } from './migrations/1791320000000-CreateUsers';

// Read lazily so values from .env (loaded by ConfigModule or the CLI) apply.
export const typeOrmOptions = (): DataSourceOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3308),
  username: process.env.DB_USERNAME ?? 'code_connect',
  password: process.env.DB_PASSWORD ?? 'code_connect',
  database: process.env.DB_DATABASE ?? 'code_connect',
  charset: 'utf8mb4_unicode_ci',
  entities: [User, Post, Tag, PostLike, Comment],
  migrations: [CreateUsers1791320000000, CreatePosts1791400000000],
  migrationsRun: true,
  synchronize: false,
});
