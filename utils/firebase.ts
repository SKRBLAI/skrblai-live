import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  type Firestore,
  type DocumentData,
  type DocumentReference,
  type QuerySnapshot,
  type Query,
  type WhereFilterOp,
  type OrderByDirection,
} from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

type FirestoreTimestamp = ReturnType<typeof serverTimestamp>;

interface BaseDocument {
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Initialize Firebase with SSR protection
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

// Client-side analytics
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) getAnalytics(app);
  });
}

// Export Firebase instances
export { app, db, auth, storage };

// Export Firestore utility functions
export {
  collection,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type DocumentReference,
  type QuerySnapshot,
  type Firestore,
  type Query,
  type WhereFilterOp,
  type OrderByDirection
};

// Helper functions for common Firebase operations
export const uploadFileToStorage = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error };
  }
};

export const saveToFirestore = async <T extends BaseDocument>(
  collectionName: string,
  data: T,
  id?: string
): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    let docRef: DocumentReference<DocumentData>;
    if (id) {
      docRef = doc(db, collectionName, id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      const colRef = collection(db, collectionName);
      docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return { success: false, error };
  }
};

interface Lead extends BaseDocument {
  name: string;
  email: string;
  company: string;
  serviceInterest: string;
  message: string;
}

export const saveLeadToFirebase = async (leadData: Lead) => {
  return saveToFirestore('leads', leadData);
};

interface ScheduledPost extends BaseDocument {
  platform: string;
  postDate: string;
  description: string;
  status: string;
}

export const saveScheduledPost = async (postData: ScheduledPost) => {
  return saveToFirestore('scheduledPosts', postData);
};

interface Proposal extends BaseDocument {
  projectName: string;
  notes: string;
  budget: string;
  pdfUrl: string;
}

export const saveProposal = async (proposalData: Proposal) => {
  return saveToFirestore('proposals', proposalData);
};

export const getProposals = async (): Promise<Array<Proposal & { id: string }>> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'proposals'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Proposal),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting proposals:', error);
    return [];
  }
};

interface User extends BaseDocument {
  name: string;
  email: string;
}

export const saveUser = async (userId: string, userName: string, userEmail: string) => {
  const userData: User = {
    name: userName,
    email: userEmail
  };
  return saveToFirestore('users', userData, userId);
};

interface AgentActivity extends BaseDocument {
  agentName: string;
  userId: string;
  action: string;
  status: 'success' | 'error';
  timestamp: string;
  details?: Record<string, any>;
  error?: string;
}

export const logAgentActivity = async (activityData: AgentActivity) => {
  return saveToFirestore('agentActivity', activityData);
};