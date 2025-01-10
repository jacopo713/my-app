// app/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { doc, setDoc } from 'firebase/firestore';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
    setLoading(true);
    try {
      const googleProvider = new GoogleAuthProvider();
      
      // Otteniamo il risultato pendente prima di completare il sign-in
      const pendingResult = await signInWithPopup(auth, googleProvider);
      
      // Verifica se l'email è stata fornita da Google
      if (!pendingResult.user.email) {
        throw new Error('Email is required for registration. Please provide an email address.');
      }

      // Verifica PRIMA di procedere con la registrazione
      const methods = await fetchSignInMethodsForEmail(auth, pendingResult.user.email);
      if (methods && methods.length > 0) {
        // Se l'email esiste, elimina l'utente appena creato
        await pendingResult.user.delete();
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      // A questo punto sappiamo che l'email non esiste già

      // Se l'email non esiste, procediamo con la registrazione
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

  const handleRegistration = async (provider: 'email' | 'google', credentials?: { email: string; password: string; name: string }) => {
    setLoading(true);
    try {
      if (provider === 'email') {
        if (!credentials) throw new Error('Credentials required for email signup');
        
        // Per email/password, verifichiamo prima se l'email esiste
        const methods = await fetchSignInMethodsForEmail(auth, credentials.email);
        if (methods.length > 0) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        await updateProfile(userCredential.user, {
          displayName: credentials.name,
        });

        const userData = {
          email: credentials.email,
          displayName: credentials.name,
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

        const idToken = await userCredential.user.getIdToken();

        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: credentials.email,
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
          sessionId: data.sessionId,
        });

        if (stripeError) {
          throw stripeError;
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

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
