import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from '@config/logger';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Uso de Fastify como servidor HTTP
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });

  // Configuración de CORS
  app.enableCors({
    origin: '*', // allowed origins
    credentials: true, // for cookies, authorization headers with HTTPS
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // allowed headers
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

  // Inicio del servidor en el puerto especificado o 3000 por defecto
  await app.listen(process.env.APP_PORT ?? 3000, '0.0.0.0', () => {
    console.log(`🚀 Application is running in ${nodeEnv} mode on: ${process.env.APP_PORT ?? 3000}`);
  });
}

bootstrap().catch((err) => {
  console.error('Error starting the app:', err);
});
