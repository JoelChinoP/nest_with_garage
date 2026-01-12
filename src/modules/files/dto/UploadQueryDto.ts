import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadQueryDto {
  @IsOptional()
  @IsString()
  codFolder?: string;

  @IsOptional()
  codOrigen?: string;

  @IsOptional()
  codTipoGestorCont?: string;

  @IsOptional()
  codTipoOrigen?: string;

  @IsOptional()
  folioDesde?: string;

  @IsOptional()
  folioHasta?: string;

  @IsOptional()
  detalleDocSustento?: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @IsNotEmpty({ message: 'El nombre del archivo es obligatorio' })
  @MinLength(1, { message: 'El nombre del archivo no puede estar vacío' })
  nombreArchivo: string;

  @IsOptional()
  countWordPages?: string;
}
