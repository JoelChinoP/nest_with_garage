import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class SimpleFileDto {
  @IsString()
  uuid: string;

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
  originalName: string;

  @IsString()
  codFolder: string;

  @IsString()
  extension: string;
}
