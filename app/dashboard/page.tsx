'use client';
/* eslint-disable react/no-unescaped-entities */ // Disabilita la regola per l'intero file

import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, Trophy, Eye, ActivitySquare, BookOpen, Lightbulb, Music } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext'; // Importa il contesto di autenticazione
import TestProgressChart from './TestProgressChart'; // Importa il componente TestProgressChart
import { getAllUserTests } from '@/app/lib/firebase'; // Importa la funzione per recuperare i test da Firebase

const DailyTraining = () => {
  const [loadingExerciseId, setLoadingExerciseId] = useState<number | null>(null);

  const exercises = [
    {
      id: 1,
      name: "Test di Stroop",
      description: "Migliora la tua resistenza all'interferenza cognitiva", // Apostrofo non escapato
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

  const startExercise = (exerciseId: number) => {
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
                      L'algoritmo sta elaborando...
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

type LeaderboardKey = 'global' | 'raven' | 'eyehand'; // Definisci un tipo per le chiavi valide

const Leaderboard = () => {
  const [selectedTest, setSelectedTest] = useState<LeaderboardKey>('global'); // Usa il tipo per selectedTest
  const [isOpen, setIsOpen] = useState(false);

  const testConfigs = [
    { id: 'global', label: 'Punteggio Globale', icon: Trophy },
    { id: 'raven', label: 'Ragionamento Astratto', icon: Brain },
    { id: 'eyehand', label: 'Coordinazione Visiva', icon: Eye },
    { id: 'stroop', label: 'Interferenza Cognitiva', icon: ActivitySquare },
    { id: 'speedreading', label: 'Lettura Veloce', icon: BookOpen },
    { id: 'memory', label: 'Memoria a Breve Termine', icon: Lightbulb },
    { id: 'schulte', label: 'Attenzione Visiva', icon: Eye },
    { id: 'rhythm', label: 'Coordinazione Ritmica', icon: Music }
  ];

  const selectedConfig = testConfigs.find(test => test.id === selectedTest);
  const SelectedIcon = selectedConfig?.icon || Trophy;

  const leaderboardData: Record<LeaderboardKey, { username: string; score: number; rank: number }[]> = {
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
                    setSelectedTest(test.id as LeaderboardKey); // Assicurati che test.id sia di tipo LeaderboardKey
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
        {currentData.map((entry) => (
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

export default function DashboardPage() {
  const { user } = useAuth(); // Ottieni l'utente collegato dal contesto di autenticazione
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (user) {
        try {
          // Recupera tutti i test dell'utente da Firebase
          const results = await getAllUserTests(user.uid);
          // Assicurati che ogni risultato abbia il campo 'type'
          const typedResults = results.map((result) => ({
            ...result,
            type: result.type || result.id.replace('Test', '').toLowerCase(), // Usa 'id' come fallback se 'type' non è presente
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

  const handleSeeCognitiveLevels = () => {
    const testProgressSection = document.getElementById('test-progress-section');
    if (testProgressSection) {
      testProgressSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Ciao, {user?.displayName || 'Utente'}! {/* Usa il nome dell'utente collegato */}
          </h1>
          <button 
            onClick={handleSeeCognitiveLevels}
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
            <Leaderboard /> {/* Assicurati che il componente Leaderboard sia utilizzato qui */}
          </div>
        </div>

        {/* Sezione TestProgressChart con id per il reindirizzamento */}
        <div id="test-progress-section" className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Risultati Test Cognitivi</h2>
          <TestProgressChart data={testResults} /> {/* Passa i dati corretti qui */}
        </div>
      </div>
    </div>
  );
}
