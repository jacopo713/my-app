'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { LogOut, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';

const AuthStatusIndicator: React.FC<AuthStatusProps> = ({ className = '' }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={`absolute top-4 right-4 flex items-center gap-2 ${className}`}>
        <div className="text-sm text-gray-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`absolute top-4 right-4 flex items-center gap-2 ${className}`}>
      {user ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200"
        >
          <LogIn className="w-4 h-4" />
          Login
        </button>
      )}
    </div>
  );
};

export default AuthStatusIndicator;
