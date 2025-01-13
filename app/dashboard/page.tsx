'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests, getAllUsers } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

// 1. Definizione dei tipi utili per questa pagina
type TestType = 'raven' | 'eyehand' | 'stroop' | 'speedreading' | 'memory' | 'schulte' | 'rhythm';

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

// 3. Pagina Dashboard (se necessaria)
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await router.push('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ciao, {user?.displayName || 'User'}!
          </h1>
          <GlobalRanking />
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

export default DashboardPage;

