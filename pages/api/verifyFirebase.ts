import type { NextApiRequest, NextApiResponse } from 'next';
// import { getAuth } from 'firebase-admin/auth'; // Temporarily commented out
// import { initAdmin } from '@/utils/firebase-admin'; // Temporarily commented out
import { app } from '../../lib/firebase'; // Assuming this path is correct

// initAdmin(); // Temporarily commented out

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const config = app.options;
    res.status(200).json({ 
      success: true,
      config: {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId
      }
    });
  } catch (error) {
    console.error('Firebase verification error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
}