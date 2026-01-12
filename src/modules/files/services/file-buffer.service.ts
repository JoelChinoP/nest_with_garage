import { S3Service } from '@modules/s3/s3.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { UploadQueryDto } from '../dto/UploadQueryDto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileBufferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async upload(query: UploadQueryDto, file: Storage.MultipartFile) {
    const folder = query.codFolder ?? 'all-files';

    // Add your Prisma operations inside the array below
    await this.prisma.$transaction(async (tx) => {
      const newFile = await tx.fileResource.create({
        data: {
          codFolder: folder,
          originalName: query.nombreArchivo,
          filePath: `${folder}/${file.filename}`,
          url: 'google.com',
          mimeType: file.mimetype,
          extension: file.filename.split('.').pop() || '',
          size: file.size,
          isTemp: false,
        },
      });

      await this.s3.upload({
        key: `${folder}/${newFile.uuid}.${newFile.extension}`,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: {
          originalName: file.filename,
          field: file.fieldname,
        },
      });
    });
  }
}
