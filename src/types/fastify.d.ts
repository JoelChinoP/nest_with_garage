declare module 'fastify' {
  interface FastifyRequest {
    storedFiles: Record<string, Storage.MultipartFile[]>;
    user?: Payload;
    headers: {
      authorization?: string;
    };
    body: unknown;
  }
}
