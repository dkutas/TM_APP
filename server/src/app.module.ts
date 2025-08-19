import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',       // <-- fontos!
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'app',
      password: process.env.DB_PASS || 'app_pw',
      database: process.env.DB_NAME || 'app_db',
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
