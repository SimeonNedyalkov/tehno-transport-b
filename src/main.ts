import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as firebaseAdmin from 'firebase-admin';
import * as fs from 'fs';

async function bootstrap() {
  const firebaseKeyFilePath =
    './tehnotransport-7630b-firebase-adminsdk-fbsvc-dc961e67c4.json';
  const firebaseServiceAccount = JSON.parse(
    fs.readFileSync(firebaseKeyFilePath).toString(),
  );
  const app = await NestFactory.create(AppModule);
  if (firebaseAdmin.app.length === 0) {
    console.log('Inititalise Firebase Application');
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
    });
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
