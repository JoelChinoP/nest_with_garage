import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@common/guards';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { FileModule } from '@modules/files/file.module';
import { S3Module } from '@/modules/s3/s3.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Variables globales
      envFilePath: '.env', // Ruta al archivo .env
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    S3Module,
    FileModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
