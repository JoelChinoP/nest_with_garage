export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  origin: process.env.APP_ORIGIN ?? '*',
});
