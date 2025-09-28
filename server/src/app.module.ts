import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { User } from './user/entities/user.entity';
import { Project } from './project/entities/project.entity';
import { IssueTypeModule } from './issue-type/issue-type.module';
import { RefreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'app',
      password: process.env.DB_PASS || 'app_pw',
      database: process.env.DB_NAME || 'app_db',
      entities: [User, Project, RefreshToken],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    ProjectModule,
    IssueTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
