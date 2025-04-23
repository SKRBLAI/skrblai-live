import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { query, collection, where, orderBy, getDocs, limit } from 'firebase/firestore';

export async function getRecentPercyMemory() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, 'percyMemory'),
    where('userId', '==', user.uid),
    orderBy('timestamp', 'desc'),
    limit(5)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}
