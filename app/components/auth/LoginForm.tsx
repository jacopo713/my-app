'use client';

import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const findUserByEmail = async (email: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0]?.data();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkAndCreateUserDoc(result.user.uid, result.user.email || '', result.user.displayName || '', 'email');
      router.push('/dashboard');
    } catch (err) {
      console.error('Email login error:', err);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (!userEmail) {
        throw new Error('No email found in Google account');
      }

      // Check for existing accounts
      const signInMethods = await fetchSignInMethodsForEmail(auth, userEmail);
      const existingUserData = await findUserByEmail(userEmail);

      if (signInMethods.includes('password') && existingUserData) {
        // Account exists with email/password
        setError('An account with this email already exists. Please login with email and password first.');
        await auth.signOut();
        return;
      }

      await checkAndCreateUserDoc(
        result.user.uid,
        userEmail,
        result.user.displayName || '',
        'google'
      );

      router.push('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  const checkAndCreateUserDoc = async (
    userId: string, 
    email: string, 
    name: string,
    provider: 'email' | 'google'
  ) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Check for existing user with same email
      const existingUserData = await findUserByEmail(email);

      if (existingUserData) {
        // Copy existing Stripe and subscription data
        await setDoc(userRef, {
          ...existingUserData,
          email,
          displayName: name || existingUserData.displayName,
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          authProvider: provider,
          linkedAccounts: {
            ...(existingUserData.linkedAccounts || {}),
            [provider]: true
          }
        });
      } else {
        // Create new user document
        await setDoc(userRef, {
          email,
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
          authProvider: provider,
          linkedAccounts: {
            [provider]: true
          }
        });
      }
    } else {
      // Update existing document
      const userData = userSnap.data();
      await setDoc(userRef, {
        ...userData,
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        linkedAccounts: {
          ...(userData.linkedAccounts || {}),
          [provider]: true
        }
      }, { merge: true });
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please sign in to your account
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
        Continue with Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email address"
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
              name="password"
              type="password"
              autoComplete="current-password"
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
              Forgot your password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
