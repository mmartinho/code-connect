import { existsSync } from 'fs';
import { DataSource } from 'typeorm';
import { typeOrmOptions } from './typeorm.options';

// Entry point for the TypeORM CLI (migrations); the app uses TypeOrmModule.
if (existsSync('.env')) process.loadEnvFile('.env');

export default new DataSource(typeOrmOptions());
