'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Trophy, ChevronRight, Eye, ActivitySquare, BookOpen, Lightbulb, Music } from 'lucide-react';
import TestProgressChart from '@/app/dashboard/TestProgressChart';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

// Types
interface Exercise {
  id: number;
  name: string;
  description: string;
  duration: string;
  priority: string;
  result: string;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
}

type TestType = 'global' | 'raven' | 'eyehand' | 'stroop' | 'speedreading' | 'memory' | 'schulte' | 'rhythm';

type LeaderboardDataType = {
  [K in TestType]?: LeaderboardEntry[];
};

// Components
const DailyTraining = () => {
  const [loadingExerciseId, setLoadingExerciseId] = useState<number | null>(null);

  const exercises: Exercise[] = [
    {
      id: 1,
      name: "Test di Stroop",
      description: "Migliora la tua resistenza all&apos;interferenza cognitiva",
      duration: "10 minuti",
      priority: "Alta",
      result: "Resistenza Mentale: 780/1000"
    },
    {
      id: 2,
      name: "Memoria a Breve Termine",
      description: "Esercizi per potenziare la memoria di lavoro",
      duration: "15 minuti",
      priority: "Media",
      result: "Memoria Sequenziale: 650/1000"
    },
    {
      id: 3,
      name: "Attenzione Visiva",
      description: "Migliora la tua capacità di attenzione selettiva",
      duration: "12 minuti",
      priority: "Mantieni",
      result: "Concentrazione: 820/1000"
    }
  ];

  const startExercise = (exerciseId: number): void => {
    setLoadingExerciseId(exerciseId);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          Allenamento Personalizzato del Giorno
        </h2>
      </div>
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{exercise.name}</h3>
                <p className="text-gray-600">{exercise.description}</p>
                <div className="flex gap-4 mt-2 text-sm items-center">
                  <span className="text-gray-500">⏱ {exercise.duration}</span>
                  <span className={`${
                    exercise.priority === 'Alta' ? 'text-red-500' :
                    exercise.priority === 'Media' ? 'text-yellow-500' :
                    'text-gray-500'
                  }`}>
                    {exercise.priority === 'Mantieni' ? 'Mantieni' : `Priorità: ${exercise.priority}`}
                  </span>
                  <span className="text-blue-600 text-xs">
                    {exercise.result}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 min-w-[200px] flex justify-end">
                {loadingExerciseId === exercise.id ? (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="animate-pulse">
                      L&apos;algoritmo sta elaborando...
                    </span>
                  </div>
                ) : (
                  <button 
                    onClick={() => startExercise(exercise.id)}
                    className="px-4 py-2 border rounded-lg flex items-center gap-1 hover:bg-gray-50"
                  >
                    Inizia
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [selectedTest, setSelectedTest] = useState<TestType>('global');
  const [isOpen, setIsOpen] = useState(false);

  const testConfigs = [
    { id: 'global' as TestType, label: 'Punteggio Globale', icon: Trophy },
    { id: 'raven' as TestType, label: 'Ragionamento Astratto', icon: Brain },
    { id: 'eyehand' as TestType, label: 'Coordinazione Visiva', icon: Eye },
    { id: 'stroop' as TestType, label: 'Interferenza Cognitiva', icon: ActivitySquare },
    { id: 'speedreading' as TestType, label: 'Lettura Veloce', icon: BookOpen },
    { id: 'memory' as TestType, label: 'Memoria a Breve Termine', icon: Lightbulb },
    { id: 'schulte' as TestType, label: 'Attenzione Visiva', icon: Eye },
    { id: 'rhythm' as TestType, label: 'Coordinazione Ritmica', icon: Music }
  ];

  const selectedConfig = testConfigs.find(test => test.id === selectedTest);
  const SelectedIcon = selectedConfig?.icon || Trophy;

  const leaderboardData: LeaderboardDataType = {
    global: [
      { username: "Mario R.", score: 950, rank: 1 },
      { username: "Laura B.", score: 920, rank: 2 },
      { username: "Marco V.", score: 890, rank: 3 },
      { username: "Sofia M.", score: 860, rank: 4 },
      { username: "Luca P.", score: 830, rank: 5 }
    ],
    raven: [
      { username: "Paolo M.", score: 980, rank: 1 },
      { username: "Anna V.", score: 940, rank: 2 },
      { username: "Luca B.", score: 900, rank: 3 },
      { username: "Elena R.", score: 870, rank: 4 },
      { username: "Marco S.", score: 840, rank: 5 }
    ],
    eyehand: [
      { username: "Giulia T.", score: 960, rank: 1 },
      { username: "Marco L.", score: 930, rank: 2 },
      { username: "Sara P.", score: 880, rank: 3 },
      { username: "Andrea B.", score: 850, rank: 4 },
      { username: "Chiara M.", score: 820, rank: 5 }
    ]
  };

  const currentData = leaderboardData[selectedTest] || leaderboardData.global;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mb-4 p-2 flex items-center justify-between border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <SelectedIcon className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">{selectedConfig?.label}</span>
          </div>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {testConfigs.map((test) => {
              const Icon = test.icon;
              return (
                <button
                  key={test.id}
                  onClick={() => {
                    setSelectedTest(test.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 flex items-center gap-2 hover:bg-gray-50 ${
                    selectedTest === test.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 text-yellow-500" />
                  <span>{test.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {currentData?.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                'bg-blue-50 text-blue-600'
              } font-semibold`}>
                {entry.rank}
              </span>
              <span className="font-medium">{entry.username}</span>
            </div>
            <span className="font-semibold text-gray-700">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testResults: any[]; // oppure usa il tipo specifico dei test results
}

const StatsModal = ({ isOpen, onClose, testResults }: StatsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <TestProgressChart data={testResults} />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [showStats, setShowStats] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (user) {
        try {
          const results = await getAllUserTests(user.uid);
          const typedResults = results.map((result) => ({
            ...result,
            type: result.type || result.id.replace('Test', '').toLowerCase(),
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
              onClick={() => setShowStats(true)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Brain className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Vedi i tuoi livelli cognitivi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DailyTraining />
            </div>
            <div>
              <Leaderboard />
            </div>
          </div>

          <StatsModal 
            isOpen={showStats} 
            onClose={() => setShowStats(false)}
            testResults={testResults}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
