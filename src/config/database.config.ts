import { bool, num, str } from '@/common/env/validator';
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    connection: str('DB_CONNECTION', 'mysql'),
    port: num('DB_PORT', 5432),
    host: str('DB_HOST'),
    user: str('DB_USERNAME', 'root'),
    password: str('DB_PASSWORD', 'password'),
    name: str('DB_NAME', 'mydb'),
    timezone: str('DB_TIMEZONE', 'America/Lima'),
    connectionLimit: num('DB_CONNECTION_LIMIT', 10),
    timeout: num('DB_CONNECT_TIMEOUT', 5000),
    debug: bool('DB_DEBUG', true),
  }),
);

export interface DatabaseConfig {
  connection: string;
  port: number;
  host: string;
  user: string;
  password: string;
  name: string;
  timezone: string;
  connectionLimit: number;
  timeout: number;
  debug: boolean;
}
