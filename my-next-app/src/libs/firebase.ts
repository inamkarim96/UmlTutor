import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

// ✅ Config Initialization
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "umltutor-demo";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

//
// 🔐 Authentication Functions
//
export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string, userData: any) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', result.user.uid), {
    email: result.user.email,
    name: userData.name,
    role: userData.role || 'student',
    createdAt: new Date().toISOString(),
  });
  return result;
};

export const signOutUser = async () => await signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

//
// 🧠 User + Firestore Diagram Logic
//
export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { id: uid, ...userDoc.data() } : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const saveDiagram = async (diagramData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'diagrams'), {
      ...diagramData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagram:", error);
    throw error;
  }
};

export const updateDiagram = async (diagramId: string, updates: any) => {
  try {
    await updateDoc(doc(db, 'diagrams', diagramId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating diagram:", error);
    throw error;
  }
};

// ✅ NEW: Save or Update (idempotent-style)
export const saveOrUpdateDiagram = async (diagramId: string, data: any) => {
  try {
    const ref = doc(db, 'diagrams', diagramId);
    await setDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return diagramId;
  } catch (error) {
    console.error("Error in saveOrUpdateDiagram:", error);
    throw error;
  }
};

export const getDiagramById = async (diagramId: string) => {
  try {
    const ref = doc(db, 'diagrams', diagramId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: diagramId, ...snap.data() } : null;
  } catch (error) {
    console.error("Error getting diagram:", error);
    return null;
  }
};

export const getUserDiagrams = async (userId: string) => {
  try {
    const diagrams: any[] = [];
    const q = query(
      collection(db, 'diagrams'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      diagrams.push({ id: doc.id, ...doc.data() });
    });
    return diagrams;
  } catch (error) {
    console.error("Error getting user diagrams:", error);
    return [];
  }
};

//
// 🧪 Tutorial Session Logic
//
export const createTutorialRequest = async (requestData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'tutorialSessions'), {
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating tutorial request:", error);
    throw error;
  }
};

export const getTutorialSessions = async (userId: string, role: string) => {
  try {
    const sessions: any[] = [];
    const q = role === 'teacher'
      ? query(collection(db, 'tutorialSessions'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'tutorialSessions'), where('studentId', '==', userId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    return sessions;
  } catch (error) {
    console.error("Error getting tutorial sessions:", error);
    return [];
  }
};

export const updateTutorialSession = async (sessionId: string, updates: any) => {
  try {
    await updateDoc(doc(db, 'tutorialSessions', sessionId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating tutorial session:", error);
    throw error;
  }
};
