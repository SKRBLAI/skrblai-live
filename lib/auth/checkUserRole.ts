import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function checkUserRole(): Promise<'free' | 'premium'> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return 'free';

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const data = userDoc.data();

  return data?.stripeRole === 'premium' ? 'premium' : 'free';
}
