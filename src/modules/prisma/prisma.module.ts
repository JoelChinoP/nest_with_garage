import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// global module to provide PrismaService across the application without needing to import PrismaModule everywhere
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
