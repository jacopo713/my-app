// app/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, 
         fetchSignInMethodsForEmail, User } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/app/components/ui/Alert';

interface AuthError {
  message: string;
  type: 'error' | 'warning' | 'info';
  action?: string;
}

interface UserData {
  email: string;
  displayName?: string;
  lastLoginAt: string;
  authProvider: 'password' | 'google';
  lastLoginMethod: 'password' | 'google';
  photoURL?: string | null;
  updatedAt: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateAuthMethod = async (email: string, attemptedMethod: 'password' | 'google'): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length === 0) {
        setAuthError({
          message: 'Nessun account trovato con questa email.',
          type: 'info',
          action: 'register'
        });
        return false;
      }

      if (attemptedMethod === 'password' && !methods.includes('password') && methods.includes('google.com')) {
        setAuthError({
          message: 'Questo account utilizza Google per l\'accesso.',
          type: 'warning',
          action: 'useGoogle'
        });
        return false;
      }

      if (attemptedMethod === 'google' && !methods.includes('google.com') && methods.includes('password')) {
        setAuthError({
          message: 'Questo account utilizza email e password per l\'accesso.',
          type: 'warning',
          action: 'usePassword'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating auth method:', error);
      setAuthError({
        message: 'Errore durante la verifica del metodo di accesso.',
        type: 'error'
      });
      return false;
    }
  };

  const updateUserData = async (userId: string, userData: UserData): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const isValidMethod = await validateAuthMethod(email, 'password');
      if (!isValidMethod) {
        setLoading(false);
        return;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      await updateUserData(result.user.uid, {
        email: result.user.email!,
        lastLoginAt: new Date().toISOString(),
        authProvider: 'password',
        lastLoginMethod: 'password',
        updatedAt: new Date().toISOString()
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setAuthError({
        message: 'Credenziali non valide. Riprova.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // ... resto del componente rimane uguale ...
}

      // Procediamo con il login
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Aggiorniamo/verifichiamo i dati utente
      await updateUserData(result.user.uid, {
        email: result.user.email!,
        lastLoginAt: new Date().toISOString(),
        authProvider: 'password',
        lastLoginMethod: 'password'
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setAuthError({
        message: 'Credenziali non valide. Riprova.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleEmail = result.user.email;

      if (!googleEmail) {
        throw new Error('Email Google non disponibile');
      }

      // Validiamo il metodo di autenticazione
      const isValidMethod = await validateAuthMethod(googleEmail, 'google');
      if (!isValidMethod) {
        await auth.signOut(); // Logout per sicurezza
        setLoading(false);
        return;
      }

      // Aggiorniamo/verifichiamo i dati utente
      await updateUserData(result.user.uid, {
        email: googleEmail,
        displayName: result.user.displayName || '',
        lastLoginAt: new Date().toISOString(),
        authProvider: 'google',
        lastLoginMethod: 'google',
        photoURL: result.user.photoURL
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setAuthError({
        message: 'Errore durante l\'accesso con Google. Riprova.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (userId: string, data: any) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Primo accesso: creiamo il documento
      await setDoc(userRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Aggiorniamo solo i campi necessari
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Accedi</h2>
        <p className="mt-2 text-sm text-gray-600">
          Accedi al tuo account per continuare
        </p>
      </div>

      {authError && (
        <Alert variant={authError.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>
            {authError.message}
            {authError.action === 'register' && (
              <Link href="/register" className="ml-2 text-blue-600 hover:text-blue-800">
                Registrati ora
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
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
        <span>{loading ? 'Accesso in corso...' : 'Continua con Google'}</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">oppure</span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Indirizzo email
            </label>
            <input
              id="email"
              type="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Indirizzo email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
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

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Password dimenticata?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>
    </div>
  );
}
