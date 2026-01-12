import { S3Service } from '@modules/s3/s3.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { UploadQueryDto } from '../dto/upload-query.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadResponseDto } from '../dto';

@Injectable()
export class FileBufferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async upload(query: UploadQueryDto, file: Storage.MultipartFile): Promise<UploadResponseDto> {
    const folder = query.codFolder ?? 'all-files';

    // Add your Prisma operations inside the array below
    const newFile = await this.prisma.$transaction(async (tx) => {
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

      return newFile;
    });

    return {
      codigo: newFile.id,
      cod_folder: newFile.codFolder ?? 'all-files',
      nombre: newFile.originalName,
      codigoAlfresco: newFile.uuid,
    };
  }

  async exists(id: number): Promise<boolean> {
    const resource = await this.prisma.fileResource.findUnique({
      where: { id },
      select: { id: true, codFolder: true, uuid: true, extension: true },
    });

    if (!resource) throw new NotFoundException('Archivo no encontrado');

    const key = `${resource.codFolder}/${resource.uuid}.${resource.extension}`;
    return await this.s3.exists(key);
  }

  async download(
    uuid: string,
  ): Promise<{ buffer: Buffer; mimeType: string; originalName: string; size: number }> {
    const file = await this.prisma.fileResource.findFirst({
      where: { uuid },
    });

    if (!file) throw new NotFoundException('Archivo no encontrado');

    const path = `${file.codFolder}/${file.uuid}.${file.extension}`;

    const exists = await this.s3.exists(path);
    if (!exists) throw new NotFoundException('Archivo no encontrado en el almacenamiento');

    const buffer = await this.s3.downloadFile({ key: path });

    return {
      buffer,
      mimeType: file.mimeType ?? 'application/octet-stream',
      originalName: file.originalName,
      size: buffer.length,
    };
  }
}
