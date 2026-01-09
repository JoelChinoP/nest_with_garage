import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma-client/client';

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
      debug: process.env.DB_DEBUG === 'true',
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Prisma: Database connection test succeeded.');
      /* this.logger.debug(`Prisma: connected successfully to the database.`); */
    } catch (error) {
      this.logger.error(`Prisma: Failed to connect to the database: ${error}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.debug(`Prisma: disconnected from the database.`);
  }
}
