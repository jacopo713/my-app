// app/login/page.tsx
import LoginForm from '../components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-12">
        <LoginForm />
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-800">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

