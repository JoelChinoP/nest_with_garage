import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { IncomingMessage } from 'http';
import { tap } from 'rxjs/operators';

interface ExtendedRequest extends HttpAdapterHost<FastifyAdapter> {
  raw: IncomingMessage;
}

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<ExtendedRequest>();
    const { method, url } = req.raw;
    const route = url?.includes('?') ? url.substring(0, url.indexOf('?')) : url;

    return next.handle().pipe(tap(() => this.logger.log(`${method} ${route}`)));
  }
}
