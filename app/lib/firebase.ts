import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Interfaccia per i risultati del test
interface TestResults {
  score?: number;
  accuracy?: number;
  percentile?: number;
  averageDeviation?: number;
  interferenceScore?: number;
  wpm?: number;
  evaluation?: string;
  averageTime?: number;
  gridSizes?: number[];
  completionTimes?: number[];
  precision?: number;
  level?: number;
  timestamp?: string;
  [key: string]: any; // Firma di indice per supportare campi dinamici
}

/**
 * Salva i risultati di un test per un utente specifico.
 * @param userId - ID dell'utente.
 * @param testId - ID del test (es. "ravenTest").
 * @param results - Risultati del test da salvare.
 */
export const saveTestResults = async (userId: string, testId: string, results: TestResults) => {
  try {
    const testRef = doc(db, 'users', userId, 'tests', testId);
    await setDoc(testRef, results, { merge: true }); // Usa merge per non sovrascrivere altri dati
    console.log('Test results saved successfully!');
  } catch (error) {
    console.error('Error saving test results:', error);
    throw new Error('Failed to save test results.');
  }
};

/**
 * Recupera i risultati di un test specifico per un utente.
 * @param userId - ID dell'utente.
 * @param testId - ID del test (es. "ravenTest").
 * @returns Risultati del test o null se non trovati.
 */
export const getTestResults = async (userId: string, testId: string): Promise<TestResults | null> => {
  try {
    const testRef = doc(db, 'users', userId, 'tests', testId);
    const docSnap = await getDoc(testRef);
    if (docSnap.exists()) {
      return docSnap.data() as TestResults;
    } else {
      console.log('No test results found for this user and test.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw new Error('Failed to fetch test results.');
  }
};

/**
 * Aggiorna i risultati di un test esistente.
 * @param userId - ID dell'utente.
 * @param testId - ID del test (es. "ravenTest").
 * @param newResults - Nuovi risultati da aggiornare.
 */
export const updateTestResults = async (userId: string, testId: string, newResults: TestResults) => {
  try {
    const testRef = doc(db, 'users', userId, 'tests', testId);
    await updateDoc(testRef, newResults);
    console.log('Test results updated successfully!');
  } catch (error) {
    console.error('Error updating test results:', error);
    throw new Error('Failed to update test results.');
  }
};

/**
 * Recupera tutti i test di un utente.
 * @param userId - ID dell'utente.
 * @returns Array di oggetti contenenti i risultati di tutti i test.
 */
export const getAllUserTests = async (userId: string): Promise<TestResults[]> => {
  try {
    const testsRef = collection(db, 'users', userId, 'tests');
    const querySnapshot = await getDocs(testsRef);
    const tests: TestResults[] = [];
    querySnapshot.forEach((doc) => {
      tests.push({ id: doc.id, ...doc.data() } as TestResults);
    });
    return tests;
  } catch (error) {
    console.error('Error fetching user tests:', error);
    throw new Error('Failed to fetch user tests.');
  }
};

export { app, auth, db };
