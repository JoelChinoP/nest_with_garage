import { Response } from '@/types/response';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RAW_RESPONSE, SUCCES_MESSAGE_KEY } from '../decorators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, T | Response<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<T | Response<T>> {
    const isRaw = this.reflector.get<boolean>(RAW_RESPONSE, ctx.getHandler());
    if (isRaw) return next.handle();

    return next.handle().pipe(
      map((data: T) => {
        const res = ctx.switchToHttp().getResponse<{ statusCode: number }>();

        const message =
          this.reflector.get<string>(SUCCES_MESSAGE_KEY, ctx.getHandler()) ||
          (data as { message?: string } | null)?.message ||
          'Operación exitosa';

        return {
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          code: res.statusCode,
          messageType: res.statusCode < 400 ? 1 : 2,
          message,
          description: null,
          data: data ?? null,
        };
      }),
    );
  }
}
