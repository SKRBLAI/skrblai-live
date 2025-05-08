// This file has been deprecated in favor of Supabase
// All Firebase functionality has been migrated to Supabase
// Keeping this file as a reference but it's no longer in use

/* 
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import type { Lead } from '@/types/lead';
import { getFirestore, collection, addDoc, setDoc, getDoc, getDocs, updateDoc, doc, serverTimestamp, query, where, orderBy, limit, Timestamp, type Firestore, type DocumentData, type DocumentReference, type QuerySnapshot, type Query, type WhereFilterOp, type OrderByDirection, CollectionReference } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

export type FirestoreTimestamp = ReturnType<typeof serverTimestamp>;
export type FirestoreCollection<T = DocumentData> = CollectionReference<T>;
export type { Lead };

interface BaseDocument {
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

// Firebase configuration
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Initialize Firebase with SSR protection
const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];

// Initialize and export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics: ReturnType<typeof getAnalytics> | null = null;

// Initialize analytics only in browser
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
  });
}

// Export Firebase instances
export { app, auth, db, storage, analytics };

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

export const saveLeadToFirebase = async (leadData: Lead): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    // Make sure createdAt is always included
    const leadToSave = {
      ...leadData,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'leads'), leadToSave);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving lead:', error);
    return { success: false, error };
  }
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
*/