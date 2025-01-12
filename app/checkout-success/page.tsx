// app/checkout-success/page.tsx (o checkout-success.tsx, a seconda della struttura del tuo progetto)
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { transferTestResults } from '@/app/lib/transferTestResults';
import { toast } from 'react-toastify';

const CheckoutSuccess: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (user && sessionId) {
      const executeTransfer = async () => {
        try {
          await transferTestResults(user.uid);
          toast.success('Risultati dei test trasferiti correttamente!');
        } catch (error) {
          toast.error('Errore nel trasferimento dei risultati.');
          console.error('Transfer error:', error);
        } finally {
          setLoading(false);
          // Modifica il redirect qui per mandare l'utente alla dashboard
          router.push('/dashboard');
        }
      };

      executeTransfer();
    } else {
      router.push('/login');
    }
  }, [user, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <div className="text-xl text-gray-700">Elaborazione dati... Attendere prego!</div>
      ) : (
        <div className="text-xl text-gray-700">Reindirizzamento...</div>
      )}
    </div>
  );
};

export default CheckoutSuccess;

