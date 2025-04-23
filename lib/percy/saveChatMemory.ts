import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

export async function savePercyMemory(intent: string) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, 'percyMemory'), {
    userId: user.uid,
    intent,
    timestamp: new Date()
  });
}
