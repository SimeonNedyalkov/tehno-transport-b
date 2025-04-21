import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import * as cloudinary from 'cloudinary';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  app.enableCors({
    origin: [
      'https://tehno-transport.vercel.app',
      'http://192.168.1.6:5173',
      'http://localhost:8081',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(cookieParser());

  // Serving static files from the uploads directory
  // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
