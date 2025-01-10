// app/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, 
         signInWithPopup, fetchSignInMethodsForEmail, signOut } from 'firebase/auth';
import { auth, db } from '@/app/lib/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
      console.log('Available auth methods:', methods);

      if (methods.length > 0) {
        // Check for existing email/password account
        if (methods.includes('password')) {
          setAuthError({
            message: 'Questa email è già registrata. Accedi con email e password.',
            type: 'warning',
            action: 'login'
          });
          return false;
        }

        // Check for existing Google account
        if (methods.includes('google.com')) {
          setAuthError({
            message: 'Questa email è già registrata con Google. Usa il pulsante "Continua con Google".',
            type: 'warning',
            action: 'useGoogle'
          });
          return false;
        }
      }

      // Additional provider-specific checks
      if (provider === 'google' && methods.includes('password')) {
        setAuthError({
          message: 'Email già registrata con password. Usa un\'altra email per Google.',
          type: 'error'
        });
        return false;
      }

      if (provider === 'email' && methods.includes('google.com')) {
        setAuthError({
          message: 'Email già registrata con Google. Usa un\'altra email.',
          type: 'error'
        });
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
    data: UserRegistrationData
  ): Promise<void> => {
    try {
      // Check if user document already exists
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        console.log('User document already exists:', userDoc.data());
        throw new Error('Account già esistente con questo ID');
      }

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
     const currentUser = auth.currentUser;
     if (!currentUser) throw new Error('Utente non autenticato');

     const idToken = await currentUser.getIdToken();
     
     const response = await fetch('/api/create-checkout-session', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${idToken}`
       },
       body: JSON.stringify({ email, userId }),
     });

     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.message || 'Errore durante la creazione della sessione di pagamento');
     }

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
     // Gestione degli errori di pagamento
     await cleanup(userId);
     setAuthError({
       message: 'Errore durante l\'inizializzazione del pagamento. Riprova più tardi.',
       type: 'error'
     });
     throw error;
   }
 };

 const cleanup = async (userId: string): Promise<void> => {
   try {
     // Elimina il documento utente se esiste
     await setDoc(doc(db, 'users', userId), {
       isActive: false,
       deletedAt: new Date().toISOString(),
       lastError: 'Payment initialization failed'
     }, { merge: true });
   } catch (error) {
     console.error('Cleanup error:', error);
   }
 };
  const handleEmailRegistration = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      // Modifica qui: aggiungiamo 'email' come secondo argomento
      const isValid = await validateNewRegistration(email, 'email');
      if (!isValid) {
        setLoading(false);
        return;
      }

 
     // Creazione account
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     await updateProfile(userCredential.user, { displayName: name });

     // Creazione documento utente
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
     
     // Se c'è un errore, proviamo a fare cleanup
     if (auth.currentUser) {
       const userId = auth.currentUser.uid;
       await cleanup(userId);
       await auth.currentUser.delete();
     }
     
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

     // Validazione preventiva
     const isValid = await validateNewRegistration(result.user.email, 'google');
     if (!isValid) {
       await signOut(auth); // Logout immediato se non valido
       setLoading(false);
       return;
     }

     // Verifica se esiste già un documento utente
     const userDoc = await getDoc(doc(db, 'users', result.user.uid));
     if (userDoc.exists()) {
       console.log('User document already exists:', userDoc.data());
       if (userDoc.data().authProvider === 'password') {
         setAuthError({
           message: 'Account già esistente con email/password. Usa il login con email.',
           type: 'error'
         });
         await signOut(auth);
         setLoading(false);
         return;
       }
     }

     // Creazione documento utente
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
     
     // Gestione specifica degli errori
     if (error instanceof Error) {
       if (error.message.includes('account-exists')) {
         setAuthError({
           message: 'Account già esistente con questa email. Accedi con il metodo appropriato.',
           type: 'warning',
           action: 'login'
         });
       } else {
         setAuthError({
           message: error.message,
           type: 'error'
         });
       }
     } else {
       setAuthError({
         message: 'Errore durante la registrazione con Google.',
         type: 'error'
       });
     }

     // Cleanup in caso di errore
     if (auth.currentUser) {
       const userId = auth.currentUser.uid;
       await cleanup(userId);
       await signOut(auth);
     }
     
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

     {/* Pulsante Google */}
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

     {/* Form Email */}
     <form className="mt-8 space-y-6" onSubmit={handleEmailRegistration}>
       <div className="rounded-md shadow-sm space-y-4">
         <div>
           <label htmlFor="name" className="sr-only">Nome completo</label>
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
           <label htmlFor="email" className="sr-only">Indirizzo email</label>
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
           <label htmlFor="password" className="sr-only">Password</label>
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
