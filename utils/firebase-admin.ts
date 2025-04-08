import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
const initAdmin = () => {
  try {
    return admin.apps.length 
      ? admin.app() 
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    return null;
  }
};

// Verify Firebase token
export const verifyToken = async (token: string): Promise<DecodedIdToken | null> => {
  try {
    const app = initAdmin();
    if (!app) {
      console.error('Firebase Admin not initialized');
      return null;
    }

    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export { initAdmin };
