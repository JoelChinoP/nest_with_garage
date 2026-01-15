import { MultipartInterceptor } from '@/common/interceptors/multipart.interceptor';
import { Files, Public, RawResponse, SuccesMessage } from '@common/decorators';
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
import { SimpleFileDto } from './dto/simple-file.dto';

@Controller('/')
export class FileController {
  constructor(private readonly bufferServ: FileBufferService) {}

  @Get('folder')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo subido correctamente')
  getFolder() {
    return 'OK';
  }

  @Public()
  @Post('files')
  @HttpCode(HttpStatus.CREATED)
  @SuccesMessage('Archivo subido correctamente')
  @UseInterceptors(MultipartInterceptor())
  async uploadSimple(
    @Query() query: SimpleFileDto,
    @Files() data: Record<string, Storage.MultipartFile[]>,
  ) {
    const file: Storage.MultipartFile = data['documento'][0];
    if (!file) throw new Error('No hay ningún archivo para subir');
    await this.bufferServ.uploadSimpleFile(query, file);
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

  @Public()
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

  @Public()
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

  @Public()
  @Get('files/:id/view')
  @RawResponse()
  async viewFile(@Param('id', ParseIntPipe) id: number, @Res() reply: FastifyReply) {
    const file = await this.bufferServ.viewFile(id);

    reply
      .code(200)
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `attachment; filename="${file.originalName}"`)
      .header('Content-Length', file.size.toString())
      .send(file.buffer);
  }

  @Public()
  @Get('public/files/:uuid/download')
  @RawResponse()
  async getPublicFile(@Param('uuid', ParseUUIDPipe) uuid: string, @Res() reply: FastifyReply) {
    const file = await this.bufferServ.download(uuid);
    reply
      .code(200)
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `attachment; filename="${file.originalName}"`)
      .header('Content-Length', file.size.toString())
      .send(file.buffer);
  }

  @Public()
  @Get('files/:id')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo encontrado correctamente')
  async getFileById(@Param('id', ParseIntPipe) id: number) {
    const exists = await this.bufferServ.exists(id);
    if (!exists) throw new NotFoundException('Archivo no encontrado');
    return exists;
  }

  @Public()
  @Delete('files/:id/remove')
  @HttpCode(HttpStatus.OK)
  @RawResponse()
  async deleteFileById(@Param('id', ParseIntPipe) id: number) {
    await this.bufferServ.delete(id);
    return {
      codigo: 200,
      mensaje: 'Archivo eliminado correctamente',
      data: null,
    };
  }

  @Delete('files/:id')
  @HttpCode(HttpStatus.OK)
  @RawResponse()
  fakeDeleteFileById(@Param('id', ParseIntPipe) id: number) {
    /* await this.bufferServ.delete(id); */
    return {
      codigo: 200,
      mensaje: 'Archivo eliminado correctamente',
      data: null,
    };
  }

  @Public()
  @Post('files/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo confirmado correctamente')
  async confirmFileById(@Param('id', ParseIntPipe) id: number) {
    return await this.bufferServ.confirm(id);
  }

  @Public()
  @Get('files/:identifier/data')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Datos del archivo obtenidos correctamente')
  async getFileDataByIdOrUiid(@Param('identifier') identifier: string) {
    return await this.bufferServ.getFileData(identifier);
  }
}
