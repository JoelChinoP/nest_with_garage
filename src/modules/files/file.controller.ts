import { MultipartInterceptor } from '@/common/interceptors/multipart.interceptor';
import { Files, Public } from '@common/decorators';
import { Body, Controller, Delete, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { timestamp } from 'rxjs';

@Controller('/')
export class FileController {
  @Public()
  @Get('folder')
  getFolder() {
    return {
      timestamp: timestamp(),
      data: 'Ok',
      messageType: 1,
      message: 'Archivo subido correctamente',
    };
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
