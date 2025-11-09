import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as process from 'node:process';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    logger: new ConsoleLogger({
      timestamp: true,
    }),
  });

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('Szakdolgozat backend API dokumentáció')
    .setBasePath('localhost:' + process.env.API_PORT || '3000')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/files',
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').filter(Boolean).length
      ? process.env.CORS_ORIGIN?.split(',')
      : ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
}

bootstrap();
