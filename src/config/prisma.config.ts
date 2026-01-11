import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

type Env = {
  DATABASE_URL?: string;

  DB_CONNECTION?: string;
  DB_PORT?: string;
  DB_HOST?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
};

const database = {
  connection: env<Env>('DB_CONNECTION') ?? 'mysql',
  port: env<Env>('DB_PORT') ?? '3306',
  host: env<Env>('DB_HOST') ?? 'localhost',
  user: env<Env>('DB_USER') ?? 'user',
  password: env<Env>('DB_PASSWORD') ?? 'password',
  name: env<Env>('DB_NAME') ?? 'mydb',
};

export default defineConfig({
  schema: path.join('../modules/prisma/schema.prisma'),
  datasource: {
    url:
      env<Env>('DATABASE_URL') ??
      `${database.connection}://${encodeURIComponent(database.user)}:${encodeURIComponent(database.password)}@${database.host}:${database.port}/${database.name}`, // use env<T> to strongly type your environment variables
  },
  migrations: {
    path: path.join('../modules/prisma/migrations'),
  },
});
