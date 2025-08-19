import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  });
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
}
bootstrap();
