import { PrismaService } from '@/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class FileTasksService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 31 1 * * 1-7') // Runs every day at 2:15 AM
  async deleteOldTempFiles(): Promise<void> {
    const today = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const files = await this.prisma.fileResource.findMany({
      where: {
        isTemp: true,
        createdAt: { lt: today }, // Older than 7 days
      },
    });
    console.log('Deleting old temporary files...', files);
  }
}
