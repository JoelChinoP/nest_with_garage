import { Observable } from 'rxjs';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { MultipartOptions } from '@/types';
import { MultipartFile, MultipartValue } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { getFileFromPart, validateFile } from '@common/utils/file.util';

type StoredFile = Awaited<ReturnType<typeof getFileFromPart>>;
type MultipartPart = MultipartFile | MultipartValue;

interface MultipartFastifyRequest extends FastifyRequest {
  isMultipart(): boolean;
  parts(): AsyncIterableIterator<MultipartPart>;
  storedFiles: Record<string, StoredFile[]>;
  body: Record<string, unknown>;
}

export function MultipartInterceptor(options: MultipartOptions = {}): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
      const req = context.switchToHttp().getRequest<MultipartFastifyRequest>();

      if (!req.isMultipart())
        throw new HttpException('The request should be a form-data', HttpStatus.BAD_REQUEST);

      const files: Record<string, StoredFile[]> = {};
      const body: Record<string, unknown> = {};

      for await (const part of req.parts()) {
        if (part.type !== 'file') {
          body[part.fieldname] = part.value;
          continue;
        }

        const file = await getFileFromPart(part);
        const validationResult = validateFile(file, options);

        if (validationResult)
          throw new HttpException(validationResult, HttpStatus.UNPROCESSABLE_ENTITY);

        const fieldname = part.fieldname;
        files[fieldname] ??= [];
        files[fieldname].push(file);
      }

      req.storedFiles = files;
      req.body = body;

      return next.handle() as Observable<unknown>;
    }
  }

  return mixin(MixinInterceptor);
}
