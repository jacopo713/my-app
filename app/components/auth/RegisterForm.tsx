'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Starting registration process...');
      
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', userCredential.user.uid);
      
      // Step 2: Update profile
      await updateProfile(userCredential.user, {
        displayName: name
      });
      console.log('Profile updated with displayName');

      try {
        // Step 3: Create Firestore document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          displayName: name,
          subscriptionStatus: 'payment_required',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('User document created in Firestore');
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        throw new Error('Failed to create user document');
      }

      // Step 4: Get ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('Got ID token');

      // Step 5: Create checkout session
      console.log('Creating checkout session...');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email,
          userId: userCredential.user.uid,
        }),
      });

      const data = await response.json();
      console.log('Checkout session response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      const { sessionId } = data;
      
      // Step 6: Initialize Stripe and redirect
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred with the payment process');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-bold text-gray-900">Register</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Register and Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
}
