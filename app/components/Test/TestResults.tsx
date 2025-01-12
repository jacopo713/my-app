'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { Brain, Eye, Clock } from 'lucide-react';
import { User } from 'firebase/auth';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      setIsAuthenticated(true);
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
      await setDoc(userRef, {
        testResults: testData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    return testData;
  };

  const initiatePayment = async (user: User) => {
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

      setIsAuthenticated(true);

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

          {isAuthenticated ? (
            // Mostra i risultati completi se l'utente è autenticato
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.raven && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Test delle Matrici Progressive</h3>
                  </div>
                  <p>Punteggio: {testResults.raven.score}</p>
                  <p>Accuratezza: {testResults.raven.accuracy}%</p>
                  {testResults.raven.percentile && (
                    <p>Percentile: {testResults.raven.percentile}°</p>
                  )}
                </div>
              )}

              {testResults.eyeHand && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Coordinazione Visiva</h3>
                  </div>
                  <p>Punteggio: {testResults.eyeHand.score}</p>
                  <p>Accuratezza: {testResults.eyeHand.accuracy}%</p>
                  <p>Deviazione Media: {testResults.eyeHand.averageDeviation}ms</p>
                </div>
              )}

              {testResults.stroop && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Test di Stroop</h3>
                  </div>
                  <p>Punteggio: {testResults.stroop.score}</p>
                  <p>Percentile: {testResults.stroop.percentile}°</p>
                  <p>Interferenza: {testResults.stroop.interferenceScore}</p>
                </div>
              )}

              {testResults.speedReading && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold">Lettura Veloce</h3>
                  </div>
                  <p>Velocità: {testResults.speedReading.wpm} parole/min</p>
                  <p>Percentile: {testResults.speedReading.percentile}°</p>
                </div>
              )}

              {testResults.memory && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold">Test di Memoria</h3>
                  </div>
                  <p>Punteggio: {testResults.memory.score}</p>
                  <p>Percentile: {testResults.memory.percentile}°</p>
                  <p>Valutazione: {testResults.memory.evaluation}</p>
                </div>
              )}

              {testResults.schulte && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">Tabella di Schulte</h3>
                  </div>
                  <p>Punteggio: {testResults.schulte.score}</p>
                  <p>Tempo Medio: {testResults.schulte.averageTime}s</p>
                  <p>Percentile: {testResults.schulte.percentile}°</p>
                </div>
              )}

              {testResults.rhythm && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-pink-600" />
                    <h3 className="font-semibold">Test del Ritmo</h3>
                  </div>
                  <p>Precisione: {testResults.rhythm.precision}%</p>
                  <p>Livello Raggiunto: {testResults.rhythm.level}</p>
                </div>
              )}
            </div>
          ) : (
            // Mostra il blur e il messaggio di registrazione se l'utente non è autenticato
            <div className="relative">
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
                        <h3 className="font-semibold">Coordinazione Visiva</h3>
                      </div>
                      <p>Punteggio: {testResults.eyeHand.score}</p>
                      <p>Accuratezza: {testResults.eyeHand.accuracy}%</p>
                    </div>
                  )}
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
          )}
        </div>

        {/* Form di Autenticazione */}
        {!isAuthenticated && (
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
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 mb-4"
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
                Continua con Google
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Oppure
                  </span>
                </div>
              </div>

              {renderAuthForm()}
            </div>

            {/* Info supplementari */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Registrandoti accetti i nostri</p>
              <div className="mt-1">
                <a href="/terms" className="text-blue-600 hover:text-blue-800">
                  Termini di Servizio
                </a>
                {' '}&amp;{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
