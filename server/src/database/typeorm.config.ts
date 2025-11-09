import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'app',
  password: process.env.DB_PASS || 'app_pw',
  database: process.env.DB_NAME || 'app_db',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  uuidExtension: 'pgcrypto',
});
