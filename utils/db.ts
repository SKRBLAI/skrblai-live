import { db } from './firebase';

// Centralized database operations for agents
export const agentDb = {
  // Log agent activity
  logActivity: async (agentName: string, action: string, data: any) => {
    const { collection, addDoc } = await import('firebase/firestore');
    try {
      const activityRef = collection(db, 'agent_activities');
      await addDoc(activityRef, {
        agentName,
        action,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error logging agent activity: ${error}`);
    }
  },

  // Save agent job
  saveJob: async (jobData: any) => {
    const { collection, addDoc } = await import('firebase/firestore');
    try {
      const jobsRef = collection(db, 'agent_jobs');
      const docRef = await addDoc(jobsRef, {
        ...jobData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error saving agent job: ${error}`);
      throw error;
    }
  },

  // Query agent jobs
  queryJobs: async (agentName: string, userId: string, maxResults = 10) => {
    const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');
    try {
      const jobsRef = collection(db, 'agent_jobs');
      const q = query(
        jobsRef,
        where('agentName', '==', agentName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() as Record<string, any> }));
    } catch (error) {
      console.error(`Error querying agent jobs: ${error}`);
      throw error;
    }
  }
};
