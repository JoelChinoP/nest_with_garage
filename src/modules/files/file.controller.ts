import { MultipartInterceptor } from '@/common/interceptors/multipart.interceptor';
import { Files, Public, RawResponse, SuccesMessage } from '@common/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';

@Controller('/')
export class FileController {
  @Get('folder')
  @HttpCode(HttpStatus.OK)
  @SuccesMessage('Archivo subido correctamente')
  getFolder() {
    return 'Ok';
  }

  @Public()
  @UseInterceptors(MultipartInterceptor())
  @Post('files/upload/')
  uploadFile(
    @Query() query: unknown,
    @Files() files: Record<string, Storage.MultipartFile[]>,
    @Body() body: unknown,
  ) {
    console.log(query);
    console.log(files);
    console.log(body);
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
