// app/tests/components/TestExplanation.tsx
'use client';

import React from 'react';

interface TestExplanationProps {
  title: string;
  description: string;
  onContinue: () => void;
  buttonLabel?: string;
}

const TestExplanation: React.FC<TestExplanationProps> = ({
  title,
  description,
  onContinue,
  buttonLabel = "Inizia"
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {title}
      </h2>
      <p className="text-gray-600 mb-6">
        {description}
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg
                 hover:bg-blue-700 transition-all duration-200
                 font-medium shadow-lg hover:shadow-xl"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default TestExplanation;
