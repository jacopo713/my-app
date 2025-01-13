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
  type?: string; // Aggiungi il campo 'type'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Firma di indice per supportare campi dinamici
}

// Interfaccia per i dati dell'utente
interface UserData {
  uid: string;
  displayName?: string; // Campo opzionale
  email?: string; // Altri campi opzionali
  level?: number; // Altri campi opzionali
}

/**
 * Salva i risultati di un test per un utente specifico.
 * @param userId - ID dell'utente.
 * @param testId - ID del test (es. "ravenTest").
 * @param results - Risultati del test da salvare.
 */
export const saveTestResults = async (userId: string, testId: string, results: TestResults) => {
  try {
    const type = testId.replace('Test', '').toLowerCase(); // Estrai il tipo di test
    let score = results.score;

    // Calcola lo score per il Speed Reading Test
    if (type === 'speedreading' && results.wpm) {
      score = results.wpm / 2; // Normalizza i wpm in uno score
    }

    // Calcola lo score per l'Eye-Hand Coordination Test
    if (type === 'eyehand' && results.accuracy) {
      score = results.accuracy * 10; // Normalizza l'accuracy su una scala da 0 a 1000
    }

    // Calcola lo score per il Rhythm Test
    if (type === 'rhythm' && results.precision) {
      score = results.precision * 10; // Normalizza la precision su una scala da 0 a 1000
    }

    // Salva i risultati su Firestore
    const testRef = doc(db, 'users', userId, 'tests', testId);
    await setDoc(testRef, { ...results, score, type }, { merge: true });
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
      const testData = doc.data() as TestResults;
      const type = testData.type || doc.id.replace('Test', '').toLowerCase();

      // Normalizza lo score per i test che non lo hanno direttamente
      if (type === 'speedreading' && testData.wpm) {
        testData.score = testData.wpm / 2;
      } else if (type === 'eyehand' && testData.accuracy) {
        testData.score = testData.accuracy * 10;
      } else if (type === 'rhythm' && testData.precision) {
        testData.score = testData.precision * 10;
      }

      tests.push({ id: doc.id, ...testData });
    });

    return tests;
  } catch (error) {
    console.error('Error fetching user tests:', error);
    throw new Error('Failed to fetch user tests.');
  }
};

/**
 * Recupera tutti gli utenti da Firestore.
 * @returns Un array di oggetti utente con uid e altri dati.
 */
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    })) as UserData[]; // Cast esplicito a UserData[]
    return users;
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    throw error;
  }
};

export { app, auth, db };
