const database = {
  connection: process.env.DB_CONNECTION ?? 'mysql',
  port: process.env.DB_PORT ?? '5432',
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'user',
  password: process.env.DB_PASSWORD ?? 'password',
  name: process.env.DB_NAME ?? 'mydb',
  timezone: process.env.DB_TIMEZONE ?? 'America/Lima',
};

export const databaseConfig = () => ({
  url: `postgresql://${database.user}:${database.password}@${database.host}:${database.port}/${database.name}?timezone=${encodeURIComponent(database.timezone)}`,
  timeout: parseInt(process.env.DB_CONNECT_TIMEOUT ?? '10000', 10),
  debug: process.env.DB_DEBUG === 'true',
});
