// app/dashboard/page.tsx
'use client';

import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.displayName || 'User'}!
            </h1>
            <div className="mt-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Dashboard Content</h2>
                <p className="mt-1 text-gray-600">
                  This is a protected page. You can only see this if you're authenticated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

