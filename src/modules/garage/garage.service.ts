import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class GarageService implements OnModuleInit, OnModuleDestroy {
  private readonly s3Client: unknown;

  onModuleInit() {
    // Initialize S3 client or other resources here
    throw new Error('Method not implemented.');
  }

  onModuleDestroy() {
    // Clean up resources here
    throw new Error('Method not implemented.');
  }
}
