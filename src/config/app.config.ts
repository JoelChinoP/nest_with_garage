import { num, str } from '@/common/env/validator';
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: str('NODE_ENV', 'development'),
    port: num('APP_PORT', 8900),
    origin: str('APP_ORIGIN', '*'),
    crossUrl: str('CROSS_URL', 'http://localhost:8900'),
  }),
);

export interface AppConfig {
  nodeEnv: string;
  port: number;
  origin: string;
  crossUrl: string;
}
