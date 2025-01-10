// app/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/app/components/ui/Alert';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AuthError {
 message: string;
 type: 'error' | 'warning' | 'info';
 action?: string;
}

interface UserRegistrationData {
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
 photoURL?: string | null;
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
      // Se esistono già metodi di autenticazione per questa email
      if (methods.includes('password')) {
        setAuthError({
          message: 'Questa email è già registrata con password. Per favore, accedi con email e password.',
          type: 'warning',
          action: 'login'
        });
        return false;
      }
      
      if (methods.includes('google.com')) {
        setAuthError({
          message: 'Questa email è già registrata con Google. Per favore, usa il pulsante "Continua con Google" per accedere.',
          type: 'warning',
          action: 'useGoogle'
        });
        return false;
      }
    }

    // Se stiamo tentando di registrare con Google, verifichiamo che l'email non sia già usata
    if (provider === 'google') {
      if (methods.includes('password')) {
        setAuthError({
          message: 'Questa email è già registrata con password. Non è possibile utilizzare lo stesso indirizzo email con Google.',
          type: 'error'
        });
        return false;
      }
    }

    // Se stiamo tentando di registrare con email/password, verifichiamo che l'email non sia già usata con Google
    if (provider === 'email') {
      if (methods.includes('google.com')) {
        setAuthError({
          message: 'Questa email è già registrata con Google. Non è possibile utilizzare lo stesso indirizzo email con password.',
          type: 'error'
        });
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating registration:', error);
    setAuthError({
      message: 'Errore durante la verifica dell\'email.',
      type: 'error'
    });
    return false;
  } };

 const createUserDocument = async (
   userId: string, 
   data: UserRegistrationData
 ): Promise<void> => {
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

 const proceedToPayment = async (userId: string, email: string): Promise<void> => {
   try {
     const idToken = await auth.currentUser?.getIdToken();
     if (!idToken) throw new Error('Token non disponibile');
     
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
     throw error;
   }
 };

 const handleEmailRegistration = async (e: React.FormEvent): Promise<void> => {
   e.preventDefault();
   setLoading(true);
   setAuthError(null);

   try {
     const isValid = await validateNewRegistration(email);
     if (!isValid) {
       setLoading(false);
       return;
     }

     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     await updateProfile(userCredential.user, { displayName: name });

     const userData: UserRegistrationData = {
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

 const handleGoogleRegistration = async (): Promise<void> => {
   setLoading(true);
   setAuthError(null);

   try {
     const provider = new GoogleAuthProvider();
     const result = await signInWithPopup(auth, provider);
     
     if (!result.user.email) {
       throw new Error('Email Google non disponibile');
     }

     const isValid = await validateNewRegistration(result.user.email);
     if (!isValid) {
       await auth.signOut();
       setLoading(false);
       return;
     }

     const userData: UserRegistrationData = {
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
       billingDetails: null,
       photoURL: result.user.photoURL
     };

     await createUserDocument(result.user.uid, userData);
     await proceedToPayment(result.user.uid, result.user.email);

   } catch (error) {
     console.error('Google registration error:', error);
     setAuthError({
       message: error instanceof Error ? error.message : 'Errore durante la registrazione con Google.',
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
             <Link href="/login" className="ml-2 text-blue-600 hover:text-blue-800">
               Vai al login
             </Link>
           )}
         </AlertDescription>
       </Alert>
     )}

     <button
       type="button"
       onClick={handleGoogleRegistration}
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
       <span>{loading ? 'Registrazione in corso...' : 'Registrati con Google'}</span>
     </button>

     <div className="relative">
       <div className="absolute inset-0 flex items-center">
         <div className="w-full border-t border-gray-300" />
       </div>
       <div className="relative flex justify-center text-sm">
         <span className="px-2 bg-white text-gray-500">oppure registrati con email</span>
       </div>
     </div>

     <form className="mt-8 space-y-6" onSubmit={handleEmailRegistration}>
       <div className="rounded-md shadow-sm space-y-4">
         <div>
           <label htmlFor="name" className="sr-only">
             Nome completo
           </label>
           <input
             id="name"
             type="text"
             required
             className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             placeholder="Nome completo"
             value={name}
             onChange={(e) => setName(e.target.value)}
             disabled={loading}
           />
         </div>
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
