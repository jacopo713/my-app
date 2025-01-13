// app/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
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

  const handleRegistration = async (
    provider: 'email',
    credentials?: { email: string; password: string; name: string }
  ) => {
    setLoading(true);
    try {
      if (!credentials) throw new Error('Credentials required for email signup');
      
      // Usiamo "let" perché la variabile viene assegnata in un secondo momento
      let userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      await updateProfile(userCredential.user, {
        displayName: credentials.name
      });

      const userData = {
        email: userCredential.user.email,
        displayName: credentials?.name,
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
