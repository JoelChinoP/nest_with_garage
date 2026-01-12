import { MultipartInterceptor } from '@/common/interceptors/multipart.interceptor';
import { Files, RawResponse, SuccesMessage } from '@common/decorators';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { UploadQueryDto } from './dto/upload-query.dto';
import { FileBufferService } from './services/file-buffer.service';
import type { FastifyReply } from 'fastify/types/reply';

@Controller('/')
export class FileController {
  constructor(private readonly bufferServ: FileBufferService) {}

  @Get('folder')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo subido correctamente')
  getFolder() {
    return 'OK';
  }

  @Post('files/upload/')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo subido correctamente')
  @UseInterceptors(MultipartInterceptor())
  async uploadFile(
    @Query() query: UploadQueryDto,
    @Files() data: Record<string, Storage.MultipartFile[]>,
  ) {
    const file: Storage.MultipartFile = data['documento'][0];
    if (!file) throw new Error('No hay ningún archivo para subir');

    return await this.bufferServ.upload(query, file);
  }

  @Get('files-srv:uuid/download/')
  @RawResponse()
  async downloadFileServ(@Param('uuid', ParseUUIDPipe) uuid: string, @Res() reply: FastifyReply) {
    const file = await this.bufferServ.download(uuid);

    reply
      .code(200)
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `attachment; filename="${file.originalName}"`)
      .header('Content-Length', file.size.toString())
      .send(file.buffer);
  }

  @Get('files/:uuid/download')
  @RawResponse()
  async downloadFile(@Param('uuid', ParseUUIDPipe) uuid: string, @Res() reply: FastifyReply) {
    const file = await this.bufferServ.download(uuid);

    reply
      .code(200)
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `attachment; filename="${file.originalName}"`)
      .header('Content-Length', file.size.toString())
      .send(file.buffer);
  }

  @Get('files/:id')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo encontrado correctamente')
  async getFileById(@Param('id', ParseIntPipe) id: number) {
    const exists = await this.bufferServ.exists(id);
    if (!exists) throw new NotFoundException('Archivo no encontrado');
    return exists;
  }

  @Delete('files/:id')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo eliminado correctamente')
  async deleteFileById(@Param('id', ParseIntPipe) id: number) {
    await this.bufferServ.delete(id);
  }
}
