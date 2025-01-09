// components/AuthStatusIndicator.tsx
'use client';

import React from 'react';
import { useAuth } from '.../contexts/AuthContext';
import { UserCheck, UserX } from 'lucide-react';

const AuthStatusIndicator: React.FC<AuthStatusProps> = ({ className = '' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={`absolute top-4 right-4 flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`absolute top-4 right-4 flex items-center gap-2 ${className}`}>
      {user ? (
        <>
          <UserCheck className="w-6 h-6 text-green-600" />
          <span className="text-sm text-green-600">
            {user.email ? `Logged in as ${user.email}` : 'Logged in'}
          </span>
        </>
      ) : (
        <>
          <UserX className="w-6 h-6 text-red-600" />
          <span className="text-sm text-red-600">Not logged in</span>
        </>
      )}
    </div>
  );
};

export default AuthStatusIndicator;
