import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@common/guards';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { FileModule } from '@modules/files/file.module';
import { S3Module } from '@/modules/s3/s3.module';
import { ScheduleModule } from '@nestjs/schedule';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { garageConfig } from './config/garage.config';
import { TusModule } from './modules/tus/tus.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, databaseConfig, garageConfig],
      isGlobal: true, // make ConfigModule global to avoid importing it in other modules
      cache: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    S3Module,
    FileModule,
    TusModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
