import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { S3Module } from '../s3/s3.module';
import { FileBufferService } from './services/file-buffer.service';
import { FileStreamService } from './services/file-stream.service';

@Module({
  imports: [S3Module],
  controllers: [FileController],
  providers: [FileBufferService, FileStreamService],
})
export class FileModule {}
