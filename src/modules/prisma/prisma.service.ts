import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/client/client';
import { filterSoftDeleted, softDelete } from './prisma.extensions';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'db',
      connectionLimit: process.env.DB_CONNECTION_LIMIT
        ? Number(process.env.DB_CONNECTION_LIMIT)
        : 10,
      connectTimeout: process.env.DB_CONNECT_TIMEOUT
        ? Number(process.env.DB_CONNECT_TIMEOUT)
        : 10000,
      timezone: process.env.DB_TIMEZONE || 'America/Lima',
    });
    super({
      adapter,
      log:
        process.env.DB_DEBUG === 'true'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'error' },
              { emit: 'stdout', level: 'warn' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
    });

    const extended = this.$extends(softDelete).$extends(filterSoftDeleted);
    return extended as any;
  }

  async onModuleInit() {
    try {
      await this.$connect();

      await this.$queryRaw`SELECT 1`;
      this.logger.log('Prisma: connected successfully to the database.');
    } catch (error) {
      this.logger.error(`Prisma: connected failed to the database: ${error}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.debug(`Prisma: disconnected from the database.`);
  }
}
