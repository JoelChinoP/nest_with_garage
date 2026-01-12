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
    const fileRecord = await this.prisma.fileResource.create({
      data: {
        codFolder: folder,
        originalName: query.nombreArchivo,
        filePath: folder,
        url: 'google.com',
        isTemp: false,
      },
    });

    const upload = await this.s3.upload({
      key: `${folder}/${fileRecord.id}/${file.filename}`,
      body: file.buffer,
      contentType: file.mimetype,
      metadata: {
        originalName: file.filename,
        field: file.fieldname,
      },
    });
  }
}
