// tus.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GarageConfig } from '@/config/garage.config';
import { S3Store } from '@tus/s3-store'; // Add the correct import for S3Store
import { Server } from '@tus/server';

@Injectable()
export class TusService implements OnModuleInit {
  private tusServer: Server;
  private readonly logger = new Logger(TusService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const garageCfg = this.configService.get<GarageConfig>('garage')!;

    // Configuración del store S3
    const s3Store = new S3Store({
      partSize: 8 * 1024 * 1024, // 8MB por parte
      minPartSize: 8 * 1024 * 1024, // Requerido para compatibilidad con Cloudflare R2
      maxMultipartParts: 10000, // Límite de AWS S3
      maxConcurrentPartUploads: 15, // Subidas concurrentes

      s3ClientConfig: {
        bucket: garageCfg.bucketName,
        region: garageCfg.region,
        endpoint: garageCfg.endpoint,
        credentials: {
          accessKeyId: garageCfg.accessKeyId,
          secretAccessKey: garageCfg.secretAccessKey,
        },
        forcePathStyle: true,
      },
    });

    this.tusServer = new Server({
      path: '/api/v2/files-large',
      datastore: s3Store,
      maxSize: garageCfg.maxFileSizeMB * 1024 * 1024,

      // CORS
      allowedOrigins: ['*'],
      allowedCredentials: true,
      respectForwardedHeaders: true,
    });

    this.logger.log('TUS Server initialized successfully');
  }

  // Método para obtener la instancia del servidor TUS
  getTusServer(): Server {
    return this.tusServer;
  }

  // Método para limpiar uploads expirados (llamar desde un CRON)
  async cleanupExpiredUploads() {
    try {
      await this.tusServer.cleanUpExpiredUploads();
      this.logger.log('Expired uploads cleaned up successfully');
    } catch (error) {
      this.logger.error('Error cleaning up expired uploads', error);
    }
  }
}
