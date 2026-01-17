import { All, Controller, Post, Req, Res } from '@nestjs/common';
import { TusService } from './services/tus.service';
import type { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify';
import { ExtendedRequest } from '@/common/interceptors';

@Controller()
export class TusController {
  constructor(private readonly tusService: TusService) {}

  @Post('api/v2/files-large')
  @All('api/v2/files-large/*')
  async handleTusRequest(@Req() req: ExtendedRequest, @Res() res: FastifyReply) {
    // Delegar el manejo a TUS Server
    const tusServer = this.tusService.getTusServer();

    // TUS espera objetos nativos de Node.js http
    return await tusServer.handle(req.raw, res.raw);
  }
}
