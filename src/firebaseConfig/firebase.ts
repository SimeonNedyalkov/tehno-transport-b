import * as firebaseAdmin from 'firebase-admin';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseKeyFilePath =
  './tehnotransport-7630b-firebase-adminsdk-fbsvc-dc961e67c4.json';

if (firebaseAdmin.apps.length === 0) {
  console.log('Initializing Firebase Application');
  const firebaseServiceAccount = JSON.parse(
    fs.readFileSync(firebaseKeyFilePath, 'utf8'),
  );
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
  });
}

export const db = firebaseAdmin.firestore();
