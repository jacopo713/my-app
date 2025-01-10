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
      // Verifica se l'email esiste già
      const emailToCheck = email; // Usa l'email inserita dall'utente
      if (emailToCheck) {
        const methods = await fetchSignInMethodsForEmail(auth, emailToCheck);
        if (methods.length > 0) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
      }

      // Se l'email non esiste, apri la finestra popup di Google
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);

      // Verifica se l'email è stata fornita da Google
      if (!userCredential.user.email) {
        throw new Error('Email is required for registration. Please provide an email address.');
      }

      // Salva i dati dell'utente in Firestore
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
      // Verifica se l'email esiste già
      const emailToCheck = provider === 'google' ? credentials?.email : email;
      if (emailToCheck) {
        const methods = await fetchSignInMethodsForEmail(auth, emailToCheck);
        if (methods.length > 0) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
      }

      let userCredential;

      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, googleProvider);

        // Verifica se l'email è stata fornita da Google
        if (!userCredential.user.email) {
          throw new Error('Email is required for registration. Please provide an email address.');
        }
      } else {
        if (!credentials) throw new Error('Credentials required for email signup');
        userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        await updateProfile(userCredential.user, {
          displayName: credentials.name,
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

      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${id
