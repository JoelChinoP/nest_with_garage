import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Readable } from 'stream';
import { GarageConfig } from '@/config/garage.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service implements OnModuleInit, OnModuleDestroy {
  private s3: S3Client;
  private garage: GarageConfig;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.garage = this.configService.get<GarageConfig>('garage')!;
  }

  onModuleInit() {
    this.s3 = new S3Client({
      region: this.garage.region,
      endpoint: this.garage.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.garage.accessKeyId,
        secretAccessKey: this.garage.secretAccessKey,
      },
    });

    this.logger.log(`S3: Service initialized and bucket "${this.garage.bucketName}" is accessible`);

    /* // Verificar acceso al bucket al inicializar el servicio
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.garage.bucketName }));
      this.logger.log(
        `S3: Service initialized and bucket "${this.garage.bucketName}" is accessible`,
      );
    } catch (error) {
      this.logger.error('S3: Failed to access bucket', error);
      // Aquí podrías lanzar error si quieres que falle la inicialización
      throw new Error('Invalid S3 credentials or bucket inaccessible');
    } */
  }

  onModuleDestroy() {
    this.logger.log('S3: Service is being destroyed');
  }

  /* ===================== UPLOAD ===================== */
  async upload(arg: {
    key: string;
    body: Buffer;
    contentType: string;
    metadata?: Record<string, string>;
  }) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.garage.bucketName,
        Key: arg.key,
        Body: arg.body,
        ContentType: arg.contentType,
        Metadata: arg.metadata,
      }),
    );

    return { bucket: this.garage.bucketName, key: arg.key };
  }

  async uploadStream(arg: { key: string; body: Readable; contentType: string }) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.garage.bucketName,
        Key: arg.key,
        Body: arg.body,
        ContentType: arg.contentType,
      }),
    );
  }

  /* ===================== DOWNLOAD URL ===================== */
  async getDownloadUrl(arg: { key: string; expires?: number }) {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.garage.bucketName,
        Key: arg.key,
      }),
      { expiresIn: arg.expires },
    );
  }

  async downloadFile(arg: { key: string }): Promise<Buffer> {
    const res = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.garage.bucketName,
        Key: arg.key,
      }),
    );

    /* const byteArray = await r.Body!.transformToByteArray();
    return Buffer.from(byteArray); */

    const stream = res.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  /* ===================== METADATA ===================== */
  async head(arg: { key: string }) {
    const r = await this.s3.send(
      new HeadObjectCommand({
        Bucket: this.garage.bucketName,
        Key: arg.key,
      }),
    );

    return {
      size: r.ContentLength,
      contentType: r.ContentType,
      etag: r.ETag,
      metadata: r.Metadata,
      lastModified: r.LastModified,
    };
  }

  /* ===================== DELETE ===================== */
  async delete(arg: { key: string }) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.garage.bucketName,
        Key: arg.key,
      }),
    );
  }

  /* ===================== EXISTS ===================== */
  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.garage.bucketName, Key: key }));

      return true;
    } catch (err: any) {
      if (
        err?.$metadata?.httpStatusCode === 404 ||
        err?.name === 'NotFound' ||
        err?.name === 'NoSuchKey'
      ) {
        return false;
      }

      throw err;
    }
  }
}
