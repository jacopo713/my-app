'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
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
          
          // Se siamo appena tornati da un pagamento di successo, diamo più tempo
          const success = searchParams.get('success');
          const sessionId = searchParams.get('session_id');
          
          if (success === 'true' && sessionId) {
            // Se siamo in attesa della conferma del pagamento, aspettiamo
            console.log('Payment success detected, waiting for webhook');
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Ricontrolliamo i dati dopo l'attesa
            const updatedDoc = await getDoc(docRef);
            const updatedData = updatedDoc.data();
            
            if (updatedData.subscriptionStatus === 'active') {
              setCheckingSubscription(false);
              return;
            }
          }
          
          // Verifica normale per le altre situazioni
          if (userData.subscriptionStatus !== 'active') {
            console.log('Subscription not active:', userData.subscriptionStatus);
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
  }, [user, loading, router, searchParams]);

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Verifying access...</div>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
