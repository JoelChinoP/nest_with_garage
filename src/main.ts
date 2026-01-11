import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from '@config/logger.config';
import multipart from '@fastify/multipart';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Uso de Fastify como servidor HTTP
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ routerOptions: { ignoreTrailingSlash: true } }),
    { bufferLogs: true, logger: ['error', 'warn', 'log', 'debug', 'verbose'] },
  );

  // Configuración de CORS
  app.enableCors({
    origin: '*', // allowed origins
    credentials: true, // for cookies, authorization headers with HTTPS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allowed HTTP methods
    allowedHeaders: [
      'Content-Type, Authorization, X-Requested-With, Authorization-sca, code-user, ip-cliente, name-user, rol-user, usuario-login, document-user, user-login, ip-client, ipcliente, usuariologin',
    ], // allowed headers
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

  //Configuración de prefijo global para las rutas
  app.setGlobalPrefix('/api/v1');

  // Configuración de interceptor global para transformar respuestas
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // Configuración de manejo de multipart/form-data
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB
    },
  });

  // Inicio del servidor en el puerto especificado o 3000 por defecto
  await app.listen(process.env.APP_PORT ?? 3000, '0.0.0.0', () => {
    console.log(`🚀 Application is running in ${nodeEnv} mode on: ${process.env.APP_PORT ?? 3000}`);
  });
}

bootstrap().catch((err) => {
  console.error('Error starting the app:', err);
});
