'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests, getAllUsers } from '@/app/lib/firebase';

interface UserData {
  userId: string;
  username: string;
  totalScore: number;
  qiScore: number; // Nuovo campo per memorizzare il QI calcolato
  timestamp?: string;
}

const GlobalRanking: React.FC = () => {
  const { user } = useAuth();
  const [recentTests, setRecentTests] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Funzione per convertire il punteggio in QI
  const convertToIQ = (score: number) => {
    return (score / 750) * 110; // 750 punti = QI 110
  };

  useEffect(() => {
    const fetchRecentTests = async () => {
      try {
        const users = await getAllUsers();
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 ora fa

        const recentTests: UserData[] = [];

        for (const user of users) {
          const testResults = await getAllUserTests(user.uid);

          // Filtra i test effettuati nell'ultima ora
          const recentUserTests = testResults.filter((test) => {
            const testTimestamp = test.timestamp ? new Date(test.timestamp) : null;
            return testTimestamp && testTimestamp >= oneHourAgo;
          });

          if (recentUserTests.length > 0) {
            // Calcola il punteggio totale
            let totalScore = 0;
            let testCount = 0;

            recentUserTests.forEach((test) => {
              totalScore += test.score || 0;
              testCount += 1;
            });

            const averageScore = testCount > 0 ? totalScore / testCount : 0;

            // Converti il punteggio medio in QI
            const qiScore = convertToIQ(averageScore);

            recentTests.push({
              userId: user.uid,
              username: user.displayName || 'Anonymous',
              totalScore: Math.round(averageScore),
              qiScore: Math.round(qiScore), // Aggiungi il QI calcolato
              timestamp: recentUserTests[0].timestamp, // Usa il timestamp del test più recente
            });
          }
        }

        // Ordina i test per timestamp (dal più recente al meno recente)
        recentTests.sort((a, b) => {
          const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timestampB - timestampA; // Ordine decrescente
        });

        setRecentTests(recentTests);
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
                  <div className="font-semibold text-gray-900">{test.username}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{test.qiScore}</div> {/* Mostra il QI invece del punteggio */}
                <div className="text-sm text-gray-500">QI</div>
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

export default GlobalRanking;
