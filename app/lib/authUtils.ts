import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export const checkAndCreateUserDoc = async (userId: string, email: string, name: string, authProvider: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Controlla se esiste un utente con la stessa email
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(query(usersRef, where('email', '==', email)));

    if (!querySnapshot.empty) {
      // Se esiste un utente con la stessa email, aggiorna il documento esistente
      const existingUserDoc = querySnapshot.docs[0];
      await setDoc(existingUserDoc.ref, {
        uid: userId, // Aggiungi l'UID del nuovo provider
        authProvider, // Aggiorna il provider di autenticazione
        lastLoginAt: new Date().toISOString(), // Aggiorna l'ultimo accesso
      }, { merge: true });
    } else {
      // Se non esiste un utente con la stessa email, crea un nuovo documento
      await setDoc(userRef, {
        email,
        displayName: name,
        subscriptionStatus: 'payment_required',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: null,
        subscriptionId: null,
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        paymentMethod: null,
        billingDetails: null,
        authProvider,
      });
    }
  } else {
    // Se il documento esiste già, aggiorna solo i campi necessari
    await setDoc(userRef, {
      lastLoginAt: new Date().toISOString(),
      authProvider, // Aggiorna il provider di autenticazione
    }, { merge: true });
  }
};

export const handleEmailLogin = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await checkAndCreateUserDoc(result.user.uid, result.user.email || '', result.user.displayName || '', 'email');
  return result;
};

export const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await checkAndCreateUserDoc(result.user.uid, result.user.email || '', result.user.displayName || '', 'google');
  return result;
};

export const handleEmailRegistration = async (email: string, password: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await checkAndCreateUserDoc(result.user.uid, result.user.email || '', result.user.displayName || '', 'email');
  return result;
};

export const handleGoogleRegistration = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await checkAndCreateUserDoc(result.user.uid, result.user.email || '', result.user.displayName || '', 'google');
  return result;
};
