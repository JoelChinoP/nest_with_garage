import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/client/client';
import { filterSoftDeleted, softDelete } from './prisma.extensions';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '@/config/database.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const db = configService.get<DatabaseConfig>('database')!;

    const adapter = new PrismaMariaDb({
      host: db.host,
      port: db.port,
      user: db.user,
      password: db.password,
      database: db.name,
      timezone: '+05:00',
      connectionLimit: db.connectionLimit,
      connectTimeout: db.timeout,
    });

    super({
      adapter,
      log: db.debug
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
