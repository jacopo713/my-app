// app/register/page.tsx
import RegisterForm from '../components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-12">
        <RegisterForm />
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
