// app/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/app/components/ui/Alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AuthError {
  message: string;
  type: 'error' | 'warning' | 'info';
  action?: string;
}

interface RegistrationData {
  email: string;
  displayName: string;
  authProvider: 'email' | 'google';
  subscriptionStatus: 'payment_required';
  createdAt: string;
  updatedAt: string;
  customerId: null;
  subscriptionId: null;
  lastLoginAt: string;
  isActive: boolean;
  paymentMethod: null;
  billingDetails: null;
}

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);

  const validateNewRegistration = async (email: string, provider: 'email' | 'google'): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length > 0) {
        // Email già registrata, verifichiamo con quale provider
        if (methods.includes('password')) {
          setAuthError({
            message: 'Email già registrata con password. Effettua il login.',
            type: 'warning',
            action: 'login'
          });
        } else if (methods.includes('google.com')) {
          setAuthError({
            message: 'Email già registrata con Google. Usa il pulsante "Continua con Google".',
            type: 'warning',
            action: 'useGoogle'
          });
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating registration:', error);
      setAuthError({
        message: 'Errore durante la verifica dell\'email.',
        type: 'error'
      });
      return false;
    }
  };

  const createUserDocument = async (
    userId: string, 
    data: RegistrationData
  ) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...data,
        uid: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw new Error('Errore durante la creazione del profilo utente');
    }
  };

  const proceedToPayment = async (userId: string, email: string) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ email, userId }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe non inizializzato');

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) throw error;

    } catch (error) {
      console.error('Payment error:', error);
      setAuthError({
        message: 'Errore durante l\'inizializzazione del pagamento.',
        type: 'error'
      });
    }
  };

  const handleEmailRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      // Validazione preventiva
      const isValid = await validateNewRegistration(email, 'email');
      if (!isValid) {
        setLoading(false);
        return;
      }

      // Creazione account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Creazione documento utente
      const userData: RegistrationData = {
        email,
        displayName: name,
        authProvider: 'email',
        subscriptionStatus: 'payment_required',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: null,
        subscriptionId: null,
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        paymentMethod: null,
        billingDetails: null
      };

      await createUserDocument(userCredential.user.uid, userData);
      await proceedToPayment(userCredential.user.uid, email);

    } catch (error) {
      console.error('Registration error:', error);
      setAuthError({
        message: error instanceof Error ? error.message : 'Errore durante la registrazione.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const handleGoogleRegistration = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (!result.user.email) {
        throw new Error('Email Google non disponibile');
      }

      // Validazione preventiva
      const isValid = await validateNewRegistration(result.user.email, 'google');
      if (!isValid) {
        await auth.signOut(); // Logout per sicurezza
        setLoading(false);
        return;
      }

      // Creazione documento utente
      const userData: RegistrationData = {
        email: result.user.email,
        displayName: result.user.displayName || '',
        authProvider: 'google',
        subscriptionStatus: 'payment_required',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: null,
        subscriptionId: null,
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        paymentMethod: null,
        billingDetails: null
      };

      await createUserDocument(result.user.uid, userData);
      await proceedToPayment(result.user.uid, result.user.email);

    } catch (error) {
      console.error('Google registration error:', error);
      setAuthError({
        message: 'Errore durante la registrazione con Google.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Crea Account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Inizia il tuo percorso con noi
        </p>
      </div>

      {authError && (
        <Alert variant={authError.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>
            {authError.message}
            {authError.action === 'login' && (
              <a href="/login" className="ml-2 text-blue-600 hover:text-blue-800">
                Vai al login
              </a>
            )}
          </AlertDescription>
        </Alert>
      )}

      <button
        type="button"
        onClick={handleGoogleRegistration}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          {/* Google SVG */}
        </svg>
        {loading ? 'Registrazione in corso...' : 'Registrati con Google'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">oppure registrati con email</span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleEmailRegistration}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Indirizzo email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Registrazione in corso...' : 'Crea Account'}
        </button>
      </form>
    </div>
  );
}
