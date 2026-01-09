import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  schema: path.join('../modules/prisma/schema.prisma'),
  datasource: {
    url: env<Env>('DATABASE_URL'), // use env<T> to strongly type your environment variables
  },
  migrations: {
    path: path.join('../modules/prisma/migrations'),
  },
});
