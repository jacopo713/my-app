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
    // Prima verifica se l'utente non è loggato
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Verifica lo stato dell'abbonamento
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
          if (userData.subscriptionStatus !== 'active') {
            // Se non c'è abbonamento attivo, redirect al checkout
            const response = await fetch('/api/create-checkout-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                userId: user.uid,
              }),
            });

            const { url } = await response.json();
            window.location.href = url;
            return;
          }

          setCheckingSubscription(false);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setCheckingSubscription(false);
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
