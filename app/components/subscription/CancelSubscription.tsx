// app/components/subscription/CancelSubscription.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface Props {
  customerId: string | null;
  subscriptionId: string | null;
}

export default function CancelSubscription({ customerId, subscriptionId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCancellation = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: user.uid,
          customerId,
          subscriptionId
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Redirect to home page after cancellation
      router.push('/');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
      >
        {isLoading ? 'Processing...' : 'Cancel Subscription'}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel Subscription
            </h3>
            <div className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel your subscription? This will:
              <ul className="mt-2 list-disc list-inside">
                <li>Cancel your current subscription immediately</li>
                <li>Delete your account permanently</li>
                <li>Remove all your data</li>
              </ul>
              This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isLoading}
              >
                No, keep my subscription
              </button>
              <button
                onClick={handleCancellation}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Yes, cancel subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
