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
    // Se non c'è utente, redirect al login
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const checkSubscription = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            console.error('User document not found');
            router.push('/login');
            return;
          }

          const userData = docSnap.data();
          
          // Se lo stato è payment_required o non è active, reindirizza al pending-payment
          if (userData.subscriptionStatus === 'payment_required' || userData.subscriptionStatus !== 'active') {
            console.log('Subscription status:', userData.subscriptionStatus);
            router.push('/pending-payment');
            return;
          }

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

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
