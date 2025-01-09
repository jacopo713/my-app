// app/forgot-password/page.tsx
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-12">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
