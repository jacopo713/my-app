// app/page.tsx
'use client';

import Link from 'next/link';
import AuthStatusIndicator from './components/auth/AuthStatusIndicator';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
      <AuthStatusIndicator />
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Our App</h1>
      <div className="space-x-4">
        <Link 
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
