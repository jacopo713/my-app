'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState(0);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!user || !sessionId) {
      router.push('/pending-payment');
      return;
    }

    const checkSubscriptionStatus = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          router.push('/pending-payment');
          return;
        }

        const userData = docSnap.data();
        
        if (userData.subscriptionStatus === 'active' && userData.paymentCompleted) {
          router.push('/dashboard');
          return;
        }

        // Se dopo 10 tentativi (20 secondi) ancora non è attivo, torniamo a pending-payment
        if (attempts >= 10) {
          router.push('/pending-payment');
          return;
        }

        // Riprova dopo 2 secondi
        setAttempts(prev => prev + 1);
        setTimeout(checkSubscriptionStatus, 2000);
      } catch (error) {
        console.error('Error checking subscription:', error);
        router.push('/pending-payment');
      }
    };

    checkSubscriptionStatus();
  }, [user, router, sessionId, attempts]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Processing Your Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your subscription...
          </p>
          <div className="mt-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
