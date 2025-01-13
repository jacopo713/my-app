'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getRecentUserTests } from '@/app/lib/firebase';

interface TestResults {
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
  type?: string;
  id?: string;
  username?: string; // Aggiungi il campo username
}

const RecentTests: React.FC = () => {
  const { user } = useAuth();
  const [recentTests, setRecentTests] = useState<TestResults[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTests = async () => {
      try {
        const tests = await getRecentUserTests(); // Chiamata senza argomenti
        setRecentTests(tests);
      } catch (error) {
        console.error('Error fetching recent tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTests();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Test Recenti
        </h2>
        <div className="text-lg text-gray-600">Caricamento test recenti...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Test Recenti (Ultima Ora)
      </h2>
      
      <div className="space-y-4">
        {recentTests.length > 0 ? (
          recentTests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg bg-blue-100 text-blue-600">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{test.username || 'Anonymous'}</div> {/* Mostra il nome dell'utente */}
                  <div className="text-sm text-gray-500">
                    {test.timestamp ? new Date(test.timestamp).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{test.score || 'N/A'}</div>
                <div className="text-sm text-gray-500">Punteggio</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">Nessun test effettuato nell&apos;ultima ora.</div>
        )}
      </div>
    </div>
  );
};

export default RecentTests;
