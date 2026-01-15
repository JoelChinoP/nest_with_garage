import { S3Service } from '@modules/s3/s3.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { UploadQueryDto } from '../dto/upload-query.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadResponseDto } from '../dto';
import { SimpleFileDto } from '../dto/simple-file.dto';

@Injectable()
export class FileBufferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async uploadSimpleFile(query: SimpleFileDto, file: Storage.MultipartFile): Promise<void> {
    const path = `${query.codFolder}/${query.uuid}.${query.extension}`;

    const result = await this.s3.upload({
      key: path,
      body: file.buffer,
      contentType: file.mimetype,
      metadata: {
        file_name: query.originalName,
        file_extension: query.extension,
      },
    });

    if (!result) throw new Error('Error al subir el archivo simple a S3');
  }

  async upload(
    query: UploadQueryDto,
    file: Storage.MultipartFile,
    userId: number,
  ): Promise<UploadResponseDto> {
    const folder = query.codFolder ?? 'all-files';

    // Add your Prisma operations inside the array below
    const newFile = await this.prisma.$transaction(async (tx) => {
      const newFile = await tx.fileResource.create({
        data: {
          codFolder: folder,
          originalName: query.nombreArchivo,
          filePath: `${folder}/${query.nombreArchivo}`,
          mimeType: file.mimetype,
          uploadedBy: userId,
          extension: file.filename.split('.').pop() || '',
          size: file.size,
        },
      });

      await this.s3.upload({
        key: `${folder}/${newFile.uuid}.${newFile.extension}`,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: {
          file_name: newFile.originalName,
          /* original_name_base64: Buffer.from(newFile.originalName, 'utf-8').toString('base64'), */
          /* upload_field: file.fieldname, */
          upload_timestamp: new Date().toISOString(),
          file_extension: newFile.extension || '',
          uploaded_by: userId.toString(),
        },
      });

      const url = `${process.env.CROSS_URL || 'http://localhost:8900'}/api/v1/public/files/${newFile.uuid}/download`;
      const updateFile = await tx.fileResource.update({
        where: { id: newFile.id },
        data: { url },
      });

      return updateFile;
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
  ): Promise<{ buffer: Buffer; originalName: string; mimeType: string; size: number }> {
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
      originalName: file.originalName,
      mimeType: file.mimeType ?? 'application/octet-stream',
      size: buffer.length,
    };
  }

  async delete(id: number): Promise<void> {
    const file = await this.prisma.fileResource.findUnique({
      where: { id },
    });

    if (!file) throw new Error('Archivo no encontrado');

    await this.prisma.fileResource.delete({
      where: { id },
    });
  }

  async confirm(id: number) {
    const file = await this.prisma.fileResource.update({
      where: { id },
      data: { isTemp: false },
    });
    if (!file) throw new Error('Archivo no encontrado');
    return file;
  }
}
