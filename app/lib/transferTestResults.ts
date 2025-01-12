// app/lib/transferTestResults.ts
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export const transferTestResults = async (uid: string) => {
  const guestResults = JSON.parse(localStorage.getItem('guestTestResults') || '{}');
  for (const [testType, testResult] of Object.entries(guestResults)) {
    if (testResult) {
      const testRef = doc(db, 'users', uid, 'tests', `${testType}Test`);
      await setDoc(testRef, { ...testResult, type: testType }, { merge: true });
    }
  }
  localStorage.removeItem('guestTestResults');
};

