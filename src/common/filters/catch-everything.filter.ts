import { Response } from '@/types/response';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost<FastifyAdapter>) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    // Imprimir el error completo en la consola
    /* console.error('Error capturado por CatchEverythingFilter:', exception); */

    // Si es una instancia de Error, mostrar el stack trace
    if (exception instanceof Error) {
      console.error('filter: CatchEverythingFilter\n', exception);
    }

    const { httpStatus, message } =
      exception instanceof HttpException
        ? { httpStatus: exception.getStatus(), message: exception.message }
        : {
            httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Hubo un error en el servidor, por favor contáctese con el administrador',
          };

    const responseBody: Response<unknown> = {
      timestamp: new Date().toISOString(), //Date().toISOString().slice(0, 19).replace('T', ' '),
      data: null,
      code: httpStatus,
      messageType: httpStatus < 400 ? 1 : 2,
      message: message,
      description: null,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
