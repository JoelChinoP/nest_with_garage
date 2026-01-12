import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class S3Service implements OnModuleInit, OnModuleDestroy {
  private s3: S3Client;
  private bucket: string;
  private readonly logger = new Logger(S3Service.name);

  onModuleInit() {
    this.bucket = process.env.S3_BUCKET_NAME!;

    this.s3 = new S3Client({
      region: process.env.S3_REGION!,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    this.logger.log('S3: Service initialized with bucket ' + this.bucket);
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
        Bucket: this.bucket,
        Key: arg.key,
        Body: arg.body,
        ContentType: arg.contentType,
        Metadata: arg.metadata,
      }),
    );

    return { bucket: this.bucket, key: arg.key };
  }

  /* ===================== DOWNLOAD ===================== */
  async getDownloadUrl(arg: { key: string; expires?: number }) {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: arg.key,
      }),
      { expiresIn: arg.expires },
    );
  }

  /* ===================== METADATA ===================== */
  async head(arg: { key: string }) {
    const r = await this.s3.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
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
        Bucket: this.bucket,
        Key: arg.key,
      }),
    );
  }
}
