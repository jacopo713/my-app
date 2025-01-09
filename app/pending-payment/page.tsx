'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';

export default function PendingPayment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log('Checking user payment status:', userData);
            
            if (userData.paymentCompleted && userData.subscriptionStatus === 'active') {
              console.log('Payment already completed, redirecting to dashboard');
              router.push('/dashboard');
              return;
            }
          }
          setCheckingStatus(false);
        } catch (error) {
          console.error('Error checking payment status:', error);
          setError('Error verifying payment status');
          setCheckingStatus(false);
        }
      } else {
        setCheckingStatus(false);
      }
    };

    checkPaymentStatus();
  }, [user, router]);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!user) {
        throw new Error('No user found');
      }

      // Get the ID token
      const idToken = await user.getIdToken();
      console.log('Starting checkout process');
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.uid,
        }),
      });

      const data = await response.json();
      console.log('Checkout session response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.sessionId) {
        throw new Error('No session ID returned');
      }

      // Redirect to Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'Unable to initialize checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Checking payment status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Complete Your Subscription</h2>
          <p className="mt-2 text-sm text-gray-600">
            To access the application, you need to complete your subscription payment
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Complete Payment'}
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You will be redirected to our secure payment processor
          </p>
        </div>
      </div>
    </div>
  );
}
