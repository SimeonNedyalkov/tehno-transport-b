import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = process.env.firebaseConfig
  ? JSON.parse(process.env.firebaseConfig)
  : null;
if (!firebaseConfig) {
  throw new Error('Firebase config is missing!');
}
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
