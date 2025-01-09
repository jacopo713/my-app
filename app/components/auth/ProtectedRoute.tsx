'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    // Se non c'è utente e il caricamento è terminato, redirect al login
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }

    const checkSubscription = async () => {
      if (user) {
        try {
          console.log('Checking subscription for user:', user.uid);
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            console.error('User document not found');
            router.push('/login');
            return;
          }

          const userData = docSnap.data();
          console.log('User data:', userData);
          
          // Verifichiamo sia il completamento del pagamento che lo stato dell'abbonamento
          if (!userData.paymentCompleted || 
              userData.subscriptionStatus !== 'active' || 
              !userData.subscriptionId) {
            console.log('Payment incomplete or subscription not active');
            console.log('Payment completed:', userData.paymentCompleted);
            console.log('Subscription status:', userData.subscriptionStatus);
            console.log('Subscription ID:', userData.subscriptionId);
            router.push('/pending-payment');
            return;
          }

          console.log('Subscription check passed');
          setCheckingSubscription(false);
        } catch (error) {
          console.error('Error checking subscription:', error);
          router.push('/login');
        }
      }
    };

    if (user) {
      checkSubscription();
    }
  }, [user, loading, router]);

  // Mostra loading mentre verifichiamo lo stato dell'utente e dell'abbonamento
  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Verifying access...</div>
        </div>
      </div>
    );
  }

  // Renderizza i children solo se tutti i controlli sono passati
  return user ? <>{children}</> : null;
}
