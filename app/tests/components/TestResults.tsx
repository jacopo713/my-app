// app/components/test/TestResults.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { Brain, Eye, ActivitySquare, BookOpen, Music, Clock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface TestResultsData {
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
}

interface TestResultsProps {
  testResults: TestResultsData;
}

export default function TestResults({ testResults }: TestResultsProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const calculateOverallScore = () => {
    let totalScore = 0;
    let testsCount = 0;

    if (testResults.raven) {
      totalScore += testResults.raven.score;
      testsCount++;
    }
    if (testResults.eyeHand) {
      totalScore += testResults.eyeHand.score;
      testsCount++;
    }
    if (testResults.stroop) {
      totalScore += testResults.stroop.score;
      testsCount++;
    }
    if (testResults.speedReading) {
      totalScore += testResults.speedReading.wpm;
      testsCount++;
    }
    if (testResults.memory) {
      totalScore += testResults.memory.score;
      testsCount++;
    }
    if (testResults.schulte) {
      totalScore += testResults.schulte.score;
      testsCount++;
    }
    if (testResults.rhythm) {
      totalScore += testResults.rhythm.precision;
      testsCount++;
    }

    return testsCount > 0 ? Math.round(totalScore / testsCount) : 0;
  };

  const handleRegularSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegistration('email', { email, password, name });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await saveTestResults(userCredential.user.uid);
      await initiatePayment(userCredential.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    await handleRegistration('google');
  };

  const saveTestResults = async (userId: string) => {
    const testData = {
      ...testResults,
      completedAt: new Date().toISOString(),
      overallScore: calculateOverallScore(),
    };

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Se l'utente esiste, aggiorna solo i risultati del test
      await setDoc(userRef, {
        testResults: testData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    return testData;
  };

  const initiatePayment = async (user: any) => {
    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.uid,
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
      console.error('Payment initiation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setLoading(false);
    }
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
        authProvider: provider,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      await saveTestResults(userCredential.user.uid);
      await initiatePayment(userCredential.user);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setLoading(false);
    }
  };

  const renderAuthForm = () => {
    if (mode === 'login') {
      return (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Elaborazione...' : 'Accedi'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Non hai un account?{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-blue-600 hover:text-blue-800"
            >
              Registrati
            </button>
          </p>
        </form>
      );
    }

    return (
      <form onSubmit={handleRegularSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Elaborazione...' : 'Registrati'}
        </button>
        <p className="text-center text-sm text-gray-600">
          Hai già un account?{' '}
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-blue-600 hover:text-blue-800"
          >
            Accedi
          </button>
        </p>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Risultati Test Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              I tuoi risultati del test
            </h2>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Punteggio Complessivo</h3>
                  <p className="text-sm text-gray-600">Media di tutti i test completati</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {calculateOverallScore()}
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Contenuto sfocato */}
            <div className="filter blur-sm pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.raven && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Matrici Progressive</h3>
                    </div>
                    <p>Punteggio: {testResults.raven.score}</p>
                    <p>Accuratezza: {testResults.raven.accuracy}%</p>
                  </div>
                )}

                {testResults.eyeHand && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Coordinazione Occhio-Mano</h3>
                    </div>
                    <p>Punteggio: {testResults.eyeHand.score}</p>
                    <p>Precisione: {testResults.eyeHand.accuracy}%</p>
                  </div>
                )}

                {/* Altri risultati dei test... */}
              </div>
            </div>

            {/* Overlay con effetto blur */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Registrati per vedere i risultati completi
                </p>
                <p className="text-sm text-gray-600">
                  Accedi o crea un account per sbloccare tutti i dettagli
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form di Autenticazione */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              {mode === 'login' ? 'Accedi' : 'Registrati'}
            </h2>

            {error && (
              <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full
