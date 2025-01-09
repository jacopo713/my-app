'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface SubscriptionData {
  subscriptionStatus: string;
  customerId: string;
  subscriptionId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSubscriptionData(docSnap.data() as SubscriptionData);
        }
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.displayName || 'User'}!
            </h1>
            
            {subscriptionData && (
              <div className="mt-6">
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription Details</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Information about your current subscription status.
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="space-y-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subscriptionData.subscriptionStatus === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {subscriptionData.subscriptionStatus.toUpperCase()}
                            </span>
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-500">Subscription ID</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {subscriptionData.subscriptionId}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {subscriptionData.email}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(subscriptionData.createdAt).toLocaleDateString()}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(subscriptionData.updatedAt).toLocaleDateString()}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
