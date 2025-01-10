'use client';

import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const findExistingUserDocByEmail = async (email: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const docId = querySnapshot.docs[0].id;
        return { data: docData, id: docId };
      }
      return null;
    } catch (error) {
      console.error('Error finding user document:', error);
      return null;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await updateOrCreateUserDoc(result.user.uid, email, result.user.displayName || '', 'email');
      router.push('/dashboard');
    } catch (err) {
      console.error('Email login error:', err);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (!userEmail) {
        throw new Error('No email found in Google account');
      }

      await updateOrCreateUserDoc(
        result.user.uid,
        userEmail,
        result.user.displayName || '',
        'google'
      );

      router.push('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const updateOrCreateUserDoc = async (
    userId: string, 
    email: string, 
    name: string,
    provider: 'email' | 'google'
  ) => {
    try {
      // 1. Cerca un documento esistente con la stessa email
      const existingDoc = await findExistingUserDocByEmail(email);

      // 2. Se esiste un documento con questa email
      if (existingDoc) {
        const { data: existingData, id: existingId } = existingDoc;

        // Se il documento esistente ha un ID diverso dal userId corrente
        if (existingId !== userId) {
          console.log('Migrating document from', existingId, 'to', userId);
          
          // Preserva tutti i dati importanti, inclusi dati Stripe
          const updatedData = {
            ...existingData,
            email,
            displayName: name || existingData.displayName,
            // Mantieni i dati di sottoscrizione esistenti
            subscriptionStatus: existingData.subscriptionStatus,
            customerId: existingData.customerId,
            subscriptionId: existingData.subscriptionId,
            paymentMethod: existingData.paymentMethod,
            billingDetails: existingData.billingDetails,
            // Aggiorna i timestamp
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            // Aggiorna i metodi di autenticazione
            linkedAccounts: {
              ...(existingData.linkedAccounts || {}),
              [provider]: true
            }
          };

          // Crea il nuovo documento con l'ID corretto
          await setDoc(doc(db, 'users', userId), updatedData);

          // Elimina il vecchio documento
          await deleteDoc(doc(db, 'users', existingId));
          
          console.log('Document successfully migrated');
        } else {
          // Aggiorna il documento esistente
          const updateData = {
            ...existingData,
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            linkedAccounts: {
              ...(existingData.linkedAccounts || {}),
              [provider]: true
            }
          };
          
          await setDoc(doc(db, 'users', userId), updateData, { merge: true });
          console.log('Existing document updated');
        }
      } else {
        // 3. Se non esiste un documento, creane uno nuovo
        const newUserData = {
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
          authProvider: provider,
          linkedAccounts: {
            [provider]: true
          }
        };

        await setDoc(doc(db, 'users', userId), newUserData);
        console.log('New document created');
      }
    } catch (error) {
      console.error('Error managing user document:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please sign in to your account
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
