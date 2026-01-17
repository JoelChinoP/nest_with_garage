import { Module } from '@nestjs/common';
import { TusController } from './tus.controller';
import { TusService } from './services/tus.service';
import { S3Service } from '../s3/s3.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [TusController],
  providers: [TusService, S3Service],
})
export class TusModule {}
