// tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TusService } from './tus.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly tusService: TusService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredUploads() {
    this.logger.log('Running cleanup of expired uploads');
    await this.tusService.cleanupExpiredUploads();
  }
}
