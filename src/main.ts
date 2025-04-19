import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://tehno-transport.vercel.app', 'http://localhost:8081'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(cookieParser());

  // Serving static files from the uploads directory
  // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
