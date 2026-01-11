import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@common/guards';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { FileModule } from '@modules/files/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Variables globales
      envFilePath: '.env', // Ruta al archivo .env
    }),
    PrismaModule,
    AuthModule,
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
