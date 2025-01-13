'use client';

import React, { useState } from 'react';
import {
  Brain,
  Eye,
  ActivitySquare,
  BookOpen,
  Lightbulb,
  Music,
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';

interface TestResultsProps {
  results: {
    raven: {
      score: number;
      accuracy: number;
      percentile?: number;
    } | null;
    eyeHand: {
      score: number;
      accuracy: number;
      averageDeviation: number;
    } | null;
    stroop: {
      score: number;
      percentile: number;
      interferenceScore: number;
    } | null;
    speedReading: {
      wpm: number;
      percentile: number;
    } | null;
    memory: {
      score: number;
      percentile: number;
      evaluation: string;
    } | null;
    schulte: {
      score: number;
      averageTime: number;
      gridSizes: number[];
      completionTimes: number[];
      percentile: number;
    } | null;
    rhythm: {
      precision: number;
      level: number;
    } | null;
  };
}

// Inizializza Stripe usando la stessa variabile usata in RegisterForm.tsx
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/**
 * Trasferisce i risultati dei test salvati nel localStorage nel database Firestore
 * per l'utente registrato.
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

export default function TestResults({ results }: TestResultsProps) {
  const { user } = useAuth();

  // Stati per la registrazione inline (identici a quelli usati in RegisterForm.tsx)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Funzione per il signup via email
  const handleRegularSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegistration('email', { email, password, name });
  };

  // Funzione per il signup con Google
  const handleGoogleSignup = async () => {
    await handleRegistration('google');
  };

  // Funzione comune di registrazione: replica fedelmente quella usata in RegisterForm.tsx
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
          displayName: credentials.name,
        });
      }

      // Creazione del documento utente su Firestore (stessa struttura dei RegisterForm e LoginForm)
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
        authProvider: provider,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Trasferimento dei risultati dei test salvati
      await transferTestResults(userCredential.user.uid);

      // Otteniamo l'id token dell'utente per autorizzare la richiesta
      const idToken = await userCredential.user.getIdToken();

      // Chiamata all'endpoint per creare la sessione Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
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

      // Inizializza Stripe e redirigi al checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
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

  // Se l'utente è già loggato, mostra i risultati dei test
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risultati del Test</h2>
        <div className="space-y-6">
          {results.raven && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-blue-500" />
                <h3 className="font-bold">Ragionamento Astratto</h3>
              </div>
              <p>Punteggio: {Math.round(results.raven.score)}/1000</p>
              {results.raven.percentile && <p>Percentile: {results.raven.percentile}°</p>}
            </div>
          )}
          {results.eyeHand && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-6 h-6 text-green-500" />
                <h3 className="font-bold">Coordinazione Visiva</h3>
              </div>
              <p>Punteggio: {Math.round(results.eyeHand.score)}</p>
              <p>Percentile: {Math.round(results.eyeHand.accuracy)}°</p>
            </div>
          )}
          {results.stroop && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ActivitySquare className="w-6 h-6 text-purple-500" />
                <h3 className="font-bold">Interferenza Cognitiva</h3>
              </div>
              <p>Punteggio: {results.stroop.score}</p>
              <p>Percentile: {results.stroop.percentile}°</p>
              <p>Punteggio di Interferenza: {results.stroop.interferenceScore}</p>
            </div>
          )}
          {results.speedReading && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
                <h3 className="font-bold">Lettura Veloce</h3>
              </div>
              <p>Punteggio: {results.speedReading.wpm}</p>
              <p>Percentile: {results.speedReading.percentile}°</p>
            </div>
          )}
          {results.memory && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-6 h-6 text-red-500" />
                <h3 className="font-bold">Memoria a Breve Termine</h3>
              </div>
              <p>Punteggio: {results.memory.score}</p>
              <p>Percentile: {results.memory.percentile}°</p>
              <p>Valutazione: {results.memory.evaluation}</p>
            </div>
          )}
          {results.schulte && (
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-6 h-6 text-indigo-500" />
                <h3 className="font-bold">Tabella di Schulte</h3>
              </div>
              <p>Punteggio: {results.schulte.score}</p>
              <p>Tempo Medio: {results.schulte.averageTime}s</p>
              <p>Percentile: {results.schulte.percentile}°</p>
            </div>
          )}
          {results.rhythm && (
            <div className="p-4 bg-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-6 h-6 text-pink-500" />
                <h3 className="font-bold">Test del Ritmo</h3>
              </div>
              <p>Precisione: {results.rhythm.precision}%</p>
              <p>Livello: {results.rhythm.level}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se l'utente non è loggato, mostra il form di registrazione inline
  return (
    <div className="max-w-md mx-auto space-y-8 p-8 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Completa la registrazione</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
        Registrati con Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Oppure registrati con email</span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleRegularSignup}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome completo"
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

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Crea Account'}
        </button>
      </form>
    </div>
  );
}

