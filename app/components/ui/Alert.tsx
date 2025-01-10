// app/components/ui/Alert.tsx
import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

const getAlertStyles = (variant: AlertProps['variant'] = 'default') => {
  switch (variant) {
    case 'destructive':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'warning':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'success':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export const Alert: React.FC<AlertProps> = ({ children, variant = 'default' }) => {
  return (
    <div className={`p-4 rounded-lg border ${getAlertStyles(variant)}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-sm">{children}</div>;
};
