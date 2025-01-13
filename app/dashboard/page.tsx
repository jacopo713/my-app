'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Activity, Repeat, BarChart2, Users } from 'lucide-react';
import TestProgressChart from '@/app/dashboard/TestProgressChart';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests, getAllUsers } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';

// 1. Definizione dei tipi
type TestType = 'raven' | 'eyehand' | 'stroop' | 'speedreading' | 'memory' | 'schulte' | 'rhythm';

interface TestResult {
  type: TestType;
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

interface RankingData {
  userId: string;
  username: string;
  totalScore: number;
  rank: number;
  level: number;
  testScores: {
    [key in TestType]?: number;
  };
}

// 2. Componente Classifica
const GlobalRanking: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [userRanking, setUserRanking] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const users = await getAllUsers();
        const rankingPromises = users.map(async (user) => {
          const testResults = await getAllUserTests(user.uid);
          const testScores: { [key in TestType]?: number } = {};
          let totalScore = 0;
          let testCount = 0;
          testResults.forEach((test) => {
            const type = test.type as TestType;
            const score = test.score || 0;
            testScores[type] = score;
            totalScore += score;
            testCount += 1;
          });
          const averageScore = testCount > 0 ? totalScore / testCount : 0;
          return {
            userId: user.uid,
            username: user.displayName || 'Anonymous',
            totalScore: Math.round(averageScore),
            rank: 0,
            level: 1,
            testScores,
          };
        });
        const ranking = await Promise.all(rankingPromises);
        ranking.sort((a, b) => b.totalScore - a.totalScore);
        ranking.forEach((user, index) => {
          user.rank = index + 1;
        });

        if (currentUser) {
          const currentUserRanking = ranking.find((u) => u.userId === currentUser.uid);
          if (currentUserRanking) {
            setUserRanking(currentUserRanking);
          }
        }
        setRankingData(ranking.slice(0, 3));
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-yellow-500" />
          Classifica Globale
        </h2>
        <div className="text-lg text-gray-600">Caricamento classifica...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart2 className="w-6 h-6 text-yellow-500" />
        Classifica Globale
      </h2>

      <div className="space-y-4">
        {rankingData.map((user) => (
          <div
            key={user.userId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                  user.rank === 1
                    ? 'bg-yellow-100 text-yellow-600'
                    : user.rank === 2
                    ? 'bg-gray-100 text-gray-600'
                    : user.rank === 3
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {user.rank}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user.username}</div>
                <div className="text-sm text-gray-500">Livello {user.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{user.totalScore}</div>
              <div className="text-sm text-gray-500">punti medi</div>
            </div>
          </div>
        ))}

        {userRanking && userRanking.rank > 3 && (
          <>
            <div className="text-center text-gray-500 my-4">...</div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg bg-blue-100 text-blue-600">
                  {userRanking.rank}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userRanking.username}</div>
                  <div className="text-sm text-gray-500">Livello {userRanking.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{userRanking.totalScore}</div>
                <div className="text-sm text-gray-500">punti medi</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 3. Pagina Allenamenti Cognitivi
const AllenamentiCognitiviPage: React.FC = () => {
  // La variabile "user" non è utilizzata in questa pagina,
  // quindi la rimuoviamo per risolvere l'errore ESLint.
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const handleSelectTraining = (trainingType: string) => {
    router.push(`/allenamenti-cognitivi/${trainingType}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Card superiore */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-8 h-8 text-purple-500" />
              Allenamenti Cognitivi
            </h1>
            <p className="text-gray-700 mb-6">
              Scegli l&apos;allenamento che preferisci dalle opzioni sottostanti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div
                onClick={() => handleSelectTraining('focus')}
                className="flex-1 bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-6 h-6 text-blue-500" />
                  <h3 className="font-semibold">Focus</h3>
                </div>
                <p className="text-sm text-gray-600">Migliora la concentrazione.</p>
              </div>
              <div
                onClick={() => handleSelectTraining('memoria')}
                className="flex-1 bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="w-6 h-6 text-green-500" />
                  <h3 className="font-semibold">Memoria</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Allena la tua capacità mnemonica.
                </p>
              </div>
              <div
                onClick={() => handleSelectTraining('velocita')}
                className="flex-1 bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-6 h-6 text-orange-500" />
                  <h3 className="font-semibold">Velocità</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Sfida la rapidità di reazione.
                </p>
              </div>
            </div>
          </div>

          {/* Spazio per spostare le classifiche verso il basso */}
          <div className="mt-16">
            <GlobalRanking />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 shadow-sm transition-colors"
            >
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AllenamentiCognitiviPage;

