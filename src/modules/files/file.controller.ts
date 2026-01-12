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

@Controller('/')
export class FileController {
  @Get('folder')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo subido correctamente')
  getFolder() {
    return 'OK';
  }

  @Public()
  @UseInterceptors(MultipartInterceptor())
  @Post('files/upload/')
  uploadFile(
    @Query() query: UploadQueryDto,
    @Files() files: Record<string, Storage.MultipartFile[]>,
  ) {
    console.log('******************');
    console.log(query);
    console.log('******************');
    console.log(files);
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
