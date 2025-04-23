import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export async function checkUserRole(): Promise<'free' | 'premium'> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return 'free';

  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const data = userDoc.data();

  return data?.stripeRole === 'premium' ? 'premium' : 'free';
}
