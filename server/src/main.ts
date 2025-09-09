import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('Szakdolgozat backend API dokumentáció')
    .setVersion('1.0')
    .addBearerAuth() // JWT support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

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
