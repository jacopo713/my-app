// app/layout.tsx
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <title>Test IQ Italia</title>
        <meta name="description" content="Test del QI Professionale" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
