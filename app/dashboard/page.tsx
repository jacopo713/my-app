'use client';

import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import TestProgressChart from '@/app/dashboard/TestProgressChart';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

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

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TestResult[];
}

// 2. Componenti di supporto
const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <TestProgressChart data={data} />
      </div>
    </div>
  );
};

// 3. Componente Classifica
const GlobalRanking: React.FC = () => {
  // Dati mock per la classifica
  const mockRankingData: RankingData[] = [
    {
      userId: '1',
      username: 'Marco V.',
      totalScore: 950,
      rank: 1,
      level: 8,
      testScores: {
        raven: 980,
        memory: 920,
        stroop: 950
      }
    },
    {
      userId: '2',
      username: 'Laura B.',
      totalScore: 920,
      rank: 2,
      level: 7,
      testScores: {
        raven: 910,
        memory: 930,
        stroop: 920
      }
    },
    {
      userId: '3',
      username: 'Paolo M.',
      totalScore: 890,
      rank: 3,
      level: 7,
      testScores: {
        raven: 880,
        memory: 900,
        stroop: 890
      }
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Classifica Globale
      </h2>
      
      <div className="space-y-4">
        {mockRankingData.map((user) => (
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
              <div className="text-sm text-gray-500">punti totali</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Componente principale
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (user) {
        try {
          const results = await getAllUserTests(user.uid);
          const typedResults: TestResult[] = results.map(result => ({
            ...result,
            type: (result.type || result.id.replace('Test', '').toLowerCase()) as TestType
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
          <div className="text-lg text-gray-600">Caricamento risultati...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Ciao, {user?.displayName || 'User'}!
            </h1>
            <button 
              onClick={() => setShowResults(true)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Brain className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Vedi i tuoi livelli cognitivi</span>
            </button>
          </div>

          <GlobalRanking />

          <StatsModal 
            isOpen={showResults}
            onClose={() => setShowResults(false)}
            data={testResults}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
