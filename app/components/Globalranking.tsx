// components/GlobalRanking.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests, getAllUsers } from '@/app/lib/firebase';

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

const GlobalRanking: React.FC = () => {
  const { user } = useAuth();
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

        if (user) {
          const currentUserRanking = ranking.find((u) => u.userId === user.uid);
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
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Classifica Globale
        </h2>
        <div className="text-lg text-gray-600">Caricamento classifica...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Classifica Globale
      </h2>
      
      <div className="space-y-4">
        {rankingData.map((user) => (
          <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
                ${user.rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                  user.rank === 2 ? 'bg-gray-100 text-gray-600' :
                  user.rank === 3 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'}`}>
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

export default GlobalRanking;
