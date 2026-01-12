import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class S3Service implements OnModuleInit, OnModuleDestroy {
  private readonly s3Client: unknown;

  onModuleInit() {
    // Initialize S3 client or other resources here
    console.log('S3Service initialized');
  }

  onModuleDestroy() {
    // Clean up resources here
    console.log('S3Service destroyed');
  }
}
