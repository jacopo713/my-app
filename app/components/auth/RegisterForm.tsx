// app/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  fetchSignInMethodsForEmail, 
  signInWithEmailAndPassword,
  linkWithPopup
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app'; // Importa FirebaseError
import { auth, db } from '@/app/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { doc, setDoc } from 'firebase/firestore';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type LogData = {
  email?: string;
  uid?: string;
  methods?: string[];
  success?: boolean;
  error?: string;
  stack?: string;
  errorCode?: string;
};

const logRegistrationStep = (step: string, data?: LogData) => {
  console.log(`🔐 [Registration Step] ${step}`);
  if (data) {
    console.log('📦 Data:', data);
  }
};

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordLinkPrompt, setShowPasswordLinkPrompt] = useState(false);
  const [pendingGoogleProvider, setPendingGoogleProvider] = useState<GoogleAuthProvider | null>(null);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      logRegistrationStep('Iniziando registrazione con Google');
      
      const googleProvider = new GoogleAuthProvider();
      logRegistrationStep('Provider Google creato');
      
      const userCredential = await signInWithPopup(auth, googleProvider);
      logRegistrationStep('Popup Google completato', { 
        email: userCredential.user.email,
        uid: userCredential.user.uid 
      });

      if (!userCredential.user.email) {
        throw new Error('Email is required for registration.');
      }

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
        authProvider: 'google',
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      const idToken = await userCredential.user.getIdToken();
      
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

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      logRegistrationStep('Redirect a Stripe checkout');
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }

    } catch (err) {
      logRegistrationStep('❌ Errore durante la registrazione', {
        error: err instanceof Error ? err.message : 'Unknown error',
        errorCode: err instanceof FirebaseError ? err.code : undefined, // Usa FirebaseError
        stack: err instanceof Error ? err.stack : undefined
      });

      if (err instanceof FirebaseError && err.code === 'auth/account-exists-with-different-credential') {
        setError('You already have an account with this email. Please login with your password to link your Google account.');
        setPendingGoogleProvider(googleProvider);
        setShowPasswordLinkPrompt(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      }
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingGoogleProvider) return;

    setLoading(true);
    try {
      // Prima facciamo login con email/password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Poi colleghiamo l'account Google
      await linkWithPopup(userCredential.user, pendingGoogleProvider);
      
      logRegistrationStep('✅ Account Google collegato con successo');
      setShowPasswordLinkPrompt(false);
      setPendingGoogleProvider(null);
      
    } catch (err) {
      logRegistrationStep('❌ Errore durante il collegamento account', {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err.message : 'Failed to link accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordLinkPrompt) {
    return (
      <form onSubmit={handlePasswordLogin} className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Linking...' : 'Link Google Account'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRegularSignup} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {loading ? 'Loading...' : 'Sign Up'}
      </button>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {loading ? 'Loading...' : 'Sign Up with Google'}
      </button>
    </form>
  );
}
