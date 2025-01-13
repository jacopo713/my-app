// app/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/**
 * Questa funzione serve a trasferire i risultati dei test salvati nel localStorage
 * nel database Firestore per l'utente registrato.
 */
const transferTestResults = async (uid: string) => {
  const guestResults = JSON.parse(localStorage.getItem('guestTestResults') || '{}');
  for (const [testType, testResult] of Object.entries(guestResults)) {
    if (testResult) {
      const testRef = doc(db, 'users', uid, 'tests', `${testType}Test`);
      await setDoc(testRef, { ...testResult, type: testType }, { merge: true });
    }
  }
  localStorage.removeItem('guestTestResults');
};

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegularSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegistration('email', { email, password, name });
  };

  const handleGoogleSignup = async () => {
    await handleRegistration('google');
  };

  const handleRegistration = async (
    provider: 'email' | 'google',
    credentials?: { email: string; password: string; name: string }
  ) => {
    setLoading(true);
    try {
      let userCredential;
      
      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, googleProvider);
      } else {
        if (!credentials) throw new Error('Credentials required for email signup');
        userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        await updateProfile(userCredential.user, {
          displayName: credentials.name
        });
      }

      const userData = {
        email: userCredential.user.email,
        displayName: provider === 'google' ? userCredential.user.displayName : credentials?.name,
        subscriptionStatus: 'payment_required',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: null,
        subscriptionId: null,
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        paymentMethod: null,
        billingDetails: null,
        authProvider: provider
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Trasferisci i risultati dei test dal localStorage a Firestore
      await transferTestResults(userCredential.user.uid);

      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email: userCredential.user.email,
          userId: userCredential.user.uid,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) {
        throw stripeError;
      }

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Start your journey with us
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Google Signup Button */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        Sign up with Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleRegularSignup}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Aggiunta delle caselle di controllo e dettagli del periodo di prova */}
        <div className="text-sm">
          <div className="flex items-center">
            <input
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              id="terms"
              disabled={loading}
            />
            <label htmlFor="terms" className="ml-2 text-gray-600">
              Accetto i{' '}
              <Link href="/termini-e-condizioni" className="text-blue-600 hover:text-blue-500">
                Termini e Condizioni
              </Link>{' '}
              e la{' '}
              <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>.
            </label>
          </div>
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              id="trial"
              disabled={loading}
            />
            <label htmlFor="trial" className="ml-2 text-gray-600">
              Inizia il tuo periodo di prova gratuito di 7 giorni.
            </label>
          </div>
          <div className="mt-2 text-gray-600">
            <p>Con la prova gratuita ottieni:</p>
            <ul className="list-disc list-inside">
              <li>Accesso completo a tutti i test cognitivi</li>
              <li>Programmi personalizzati di allenamento mentale</li>
              <li>Esercizi quotidiani per potenziamento cognitivo</li>
              <li>Classifiche competitive e sfide in tempo reale</li>
            </ul>
            <p className="mt-2">Dopo i 7 giorni, la sottoscrizione continuerà al prezzo di <strong>19,90€/mese</strong>. Puoi cancellarti in qualsiasi momento.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
