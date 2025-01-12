'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import TestProgressChart from '@/app/dashboard/TestProgressChart'; // Importa il componente del grafico

interface TestResults {
  type: 'raven' | 'eyeHand' | 'stroop' | 'speedReading' | 'memory' | 'schulte' | 'rhythm'; // Aggiungi il campo 'type'
  score?: number;
  accuracy?: number;
  percentile?: number;
  averageDeviation?: number;
  interferenceScore?: number;
  wpm?: number;
  evaluation?: string;
  averageTime?: number;
  gridSizes?: number[];
  completionTimes?: number[];
  precision?: number;
  level?: number;
  timestamp?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResults[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (user) {
        try {
          // Recupera tutti i test dell'utente
          const results = await getAllUserTests(user.uid);
          // Assicurati che ogni risultato abbia il campo 'type'
          const typedResults = results.map((result) => ({
            ...result,
            type: result.type || 'unknown', // Imposta un valore di default se 'type' non è presente
          }));
          setTestResults(typedResults);
        } catch (error) {
          console.error('Error fetching test results:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTestResults();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Loading test results...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.displayName || 'User'}!
            </h1>

            {/* Sezione per visualizzare i risultati dei test */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Results</h2>
              {testResults.length > 0 ? (
                <>
                  {/* Grafico dei progressi */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Progress Over Time</h3>
                    <TestProgressChart data={testResults} />
                  </div>

                  {/* Dettagli dei test */}
                  <div className="space-y-4">
                    {testResults.map((test, index) => (
                      <div key={index} className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-700">Test {index + 1}</h3>
                        <div className="mt-4 space-y-2">
                          {test.score && <p><strong>Score:</strong> {test.score}</p>}
                          {test.accuracy && <p><strong>Accuracy:</strong> {test.accuracy}%</p>}
                          {test.timestamp && <p><strong>Date:</strong> {new Date(test.timestamp).toLocaleDateString()}</p>}
                          {/* Aggiungi altri campi qui se necessario */}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-600">No test results found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
