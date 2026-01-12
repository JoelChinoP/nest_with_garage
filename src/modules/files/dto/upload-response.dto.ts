import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class UploadResponseDto {
  @Expose({ name: 'codigo' })
  @IsNumber()
  codigo: number;

  @Expose({ name: 'cod_folder' })
  @IsString()
  cod_folder: string;

  @Expose({ name: 'nombre' })
  @IsString()
  nombre: string;

  @Expose({ name: 'codigoAlfresco' })
  @IsString()
  codigoAlfresco: string;
}
