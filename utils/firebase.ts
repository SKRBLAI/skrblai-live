import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

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

export const saveToFirestore = async (collectionName: string, data: any, id?: string) => {
  try {
    let docRef;
    if (id) {
      docRef = doc(db, collectionName, id);
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      try {
        const colRef = collection(db, collectionName);
        docRef = await addDoc(colRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error adding document: ', error);
        throw error;
      }
    }
    return { success: true, id: id || docRef.id };
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return { success: false, error };
  }
};

export const saveLeadToFirebase = async (leadData: {
  name: string;
  email: string;
  company: string;
  serviceInterest: string;
  message: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...leadData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving lead:', error);
    return { success: false, error };
  }
};

export const saveScheduledPost = async (postData: {
  platform: string;
  postDate: string;
  description: string;
  status: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'scheduledPosts'), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving scheduled post:', error);
    return { success: false, error };
  }
};

export const saveProposal = async (proposalData: {
  projectName: string;
  notes: string;
  budget: string;
  pdfUrl: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'proposals'), {
      ...proposalData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving proposal:', error);
    return { success: false, error };
  }
};

export const getProposals = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'proposals'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting proposals:', error);
    return [];
  }
}; 

export const saveUser = async (userId: string, userName: string, userEmail: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      name: userName,
      email: userEmail,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving user:', error);
    return { success: false, error };
  }
};