import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
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

  @Transform(({ value }: { value: string }) => {
    if (!value) return value;

    return value
      .normalize('NFD') // separa tildes
      .replace(/[\u0300-\u036f]/g, '') // elimina tildes
      .replace(/[^\w\s.-]/g, '') // elimina símbolos raros
      .replace(/\s+/g, ' ') // colapsa espacios
      .trim();
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del archivo es obligatorio' })
  @MinLength(1, { message: 'El nombre del archivo no puede estar vacío' })
  nombreArchivo: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'boolean') return value;
    if (value === 1 || value === '1' || value === 'true') return true;
    if (value === 0 || value === '0' || value === 'false') return false;
    return value;
  })
  @IsBoolean({
    message: 'isTemp debe ser true/false, 1/0, o "true"/"false"',
  })
  isTemp?: boolean;

  @IsOptional()
  countWordPages?: string;
}
