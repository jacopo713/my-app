// app/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      
      // Prima di effettuare il login con Google, verifichiamo se esiste già un account
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      
      if (email) {
        // Cerchiamo un documento esistente con questa email
        const querySnapshot = await db
          .collection('users')
          .where('email', '==', email)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          // Se esiste già un documento con questa email, lo riutilizziamo
          const existingDoc = querySnapshot.docs[0];
          const existingData = existingDoc.data();
          
          // Creiamo/Aggiorniamo il documento per il nuovo UID mantenendo i dati esistenti
          await setDoc(doc(db, 'users', result.user.uid), {
            ...existingData,
            authProvider: 'google',
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            email: email,
            displayName: result.user.displayName || existingData.displayName,
          });
          
          // Se il documento precedente aveva un UID diverso, lo eliminiamo
          if (existingDoc.id !== result.user.uid) {
            await db.collection('users').doc(existingDoc.id).delete();
          }
        } else {
          // Se non esiste un documento precedente, ne creiamo uno nuovo
          await setDoc(doc(db, 'users', result.user.uid), {
            email,
            displayName: result.user.displayName,
            subscriptionStatus: 'payment_required',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            customerId: null,
            subscriptionId: null,
            lastLoginAt: new Date().toISOString(),
            isActive: true,
            paymentMethod: null,
            billingDetails: null,
            authProvider: 'google'
          });
        }
      }

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to login with Google.');
    } finally {
      setLoading(false);
    }
  };

  // Il resto del codice del componente rimane invariato...
}
