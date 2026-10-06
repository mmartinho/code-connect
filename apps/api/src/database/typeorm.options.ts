import { DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
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
  entities: [User],
  migrations: [CreateUsers1791320000000],
  migrationsRun: true,
  synchronize: false,
});
