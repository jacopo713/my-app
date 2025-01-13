import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, ActivitySquare, BookOpen, Lightbulb, Music } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
  isGuest?: boolean;
}

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

export default function TestResults({ results, isGuest }: TestResultsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem('guestEmail') || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(localStorage.getItem('guestName') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegularSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });

      const userData = {
        email: userCredential.user.email,
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
        authProvider: 'email'
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Trasferisci i risultati dei test dal localStorage a Firestore
      await transferTestResults(userCredential.user.uid);

      // Reindirizza l'utente alla pagina dei risultati completi
      router.push('/tests/results');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);

      const userData = {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
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
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Trasferisci i risultati dei test dal localStorage a Firestore
      await transferTestResults(userCredential.user.uid);

      // Reindirizza l'utente alla pagina dei risultati completi
      router.push('/tests/results');
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risultati del Test</h2>

        {/* Contenuto dei risultati con sfocatura per utenti non registrati */}
        <div className={`space-y-6 ${!user ? 'filter blur-sm' : ''}`}>
          {/* ... (codice esistente per i risultati dei test) ... */}
        </div>

        {/* Overlay per utenti non registrati */}
        {!user && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 mb-4">
                Iscriviti per sbloccare i risultati completi
              </p>
              <form onSubmit={handleRegularSignup} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
              </form>
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full mt-4 flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            </div>
          </div>
        )}

        {/* Mostra il pulsante di iscrizione solo per gli utenti guest */}
        {isGuest && !user && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowSignupForm(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Iscriviti per sbloccare i risultati completi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
