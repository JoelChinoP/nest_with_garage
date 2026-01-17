import { isDocker } from '@/common/env/is-docker';
import { str } from '@/common/env/validator';
import { registerAs } from '@nestjs/config';

export interface GarageConfig {
  region: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  maxFileSizeMB: number;
}

export const garageConfig = registerAs(
  'garage',
  (): GarageConfig => ({
    region: str('S3_REGION', 'garage'),
    endpoint: isDocker()
      ? str('S3_ENDPOINT_DOCKER', 'http://garage:3900')
      : str('S3_ENDPOINT_LOCAL', 'http://localhost:3900'),
    accessKeyId: str('S3_ACCESS_KEY_ID'),
    secretAccessKey: str('S3_SECRET_ACCESS_KEY'),
    bucketName: str('S3_BUCKET_NAME'),
    maxFileSizeMB: Number(str('GARAGE_MAX_FILE_SIZE_MB', '100')), // 100MB por defecto
  }),
);
