import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithFiles {
  storedFiles: null | Record<string, Storage.MultipartFile[]>;
}

export const Files = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): null | Record<string, Storage.MultipartFile[]> => {
    const req = ctx.switchToHttp().getRequest<RequestWithFiles>();
    return req.storedFiles;
  },
);
