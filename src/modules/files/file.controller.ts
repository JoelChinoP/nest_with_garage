import { MultipartInterceptor } from '@/common/interceptors/multipart.interceptor';
import { Files, Public, RawResponse, SuccesMessage } from '@common/decorators';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UploadQueryDto } from './dto/UploadQueryDto';
import { FileBufferService } from './services/file-buffer.service';

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
  @UseInterceptors(MultipartInterceptor())
  @Post('files/upload/')
  async uploadFile(
    @Query() query: UploadQueryDto,
    @Files() data: Record<string, Storage.MultipartFile[]>,
  ) {
    console.log('******************');
    console.log(query);
    console.log('******************');
    console.log(data);
    console.log('******************');

    const file: Storage.MultipartFile = data['documento'][0];
    if (!file) throw new Error('No hay ningún archivo para subir');
    await this.bufferServ.upload(query, file);
  }

  @Get('files-srv:uuid/download')
  @RawResponse()
  downloadFileServ() {
    throw new Error('Method not implemented.');
  }

  @Get('files/:uuid/download')
  downloadFile() {
    throw new Error('Method not implemented.');
  }

  @Get('files/:id')
  getFileById() {
    throw new Error('Method not implemented.');
  }

  @Delete('files/:id')
  deleteFileById() {
    throw new Error('Method not implemented.');
  }
}
