import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppLogger } from '@config/logger.config';
import multipart from '@fastify/multipart';
import { HttpLoggerInterceptor, TransformInterceptor } from './common/interceptors';
import { CatchEverythingFilter } from './common/filters/catch-everything.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Uso de Fastify como servidor HTTP
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ routerOptions: { ignoreTrailingSlash: true } }),
    { bufferLogs: true, logger: ['error', 'warn', 'log', 'debug', 'verbose'] },
  );

  const config = app.get<ConfigService>(ConfigService);
  const nodeEnv = config.getOrThrow<string>('app.nodeEnv');

  // Configuración de CORS
  app.enableCors({
    origin: '*', // allowed origins
    credentials: true, // for cookies, authorization headers with HTTPS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // allowed HTTP methods
    allowedHeaders: [
      // allowed headers
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Authorization-sca',
      'code-user',
      'ip-cliente',
      'name-user',
      'rol-user',
      'usuario-login',
      'document-user',
      'user-login',
      'ip-client',
      'ipcliente',
      'usuariologin',
      'tus-resumable',
      'upload-length',
      'upload-metadata',
      'upload-concat',
    ],
    /* exposedHeaders: this.config.exposedHeaders, */
    maxAge: 600, // in seconds for how long the results of a preflight request can be cached
    strictPreflight: false, // require headers for all requests
    optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
    hideOptionsRoute: false, // disable automatic OPTIONS route
    logLevel: 'silent', // fastify cors log level
  });

  // Configuración de tuberías de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Rechaza la solicitud si hay propiedades adicionales
      transform: true, // Transforma el payload a la instancia de la clase DTO
      //transformOptions: {
      //  enableImplicitConversion: true, // Permite conversiones implícitas de tipos
      //},
      forbidUnknownValues: true, // Rechaza valores desconocidos
    }),
  );

  // Configuración del logger
  const isDevelopment = nodeEnv === 'development';
  const appLogger = new AppLogger(isDevelopment, {
    prefix: 'cross',
    logLevels: isDevelopment ? ['error', 'warn', 'log', 'debug', 'verbose'] : ['error', 'warn'],
    timestamp: true,
  });
  app.useLogger(appLogger);

  // Configuración del prefijo global de rutas y exclusiones
  app.setGlobalPrefix('/api/v1', {
    exclude: [{ path: '/api/v2/files-large', method: RequestMethod.POST }],
  });

  // Configuración de interceptores globales en orden para transformar respuestas
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  if (isDevelopment) app.useGlobalInterceptors(new HttpLoggerInterceptor());

  // Configuración de filtro global para manejo de excepciones
  const httpAdapterHost = app.get<HttpAdapterHost<FastifyAdapter>>(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

  // Configuración de manejo de multipart/form-data
  await app.register(multipart, {
    limits: {
      fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024, // Default 50 MB
    },
  });

  // Inicio del servidor en el puerto especificado o 3000 por defecto
  await app.listen(process.env.APP_PORT ?? 3000, '0.0.0.0', () => {
    console.log(
      `\n🚀 Application is running in ${nodeEnv} mode on: ${process.env.APP_PORT ?? 3000}\n`,
    );
  });
}

bootstrap().catch((err) => {
  console.error('Error starting the app:', err);
});
