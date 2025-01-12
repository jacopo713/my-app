'use client';

import { Brain, Eye, ActivitySquare, BookOpen, Lightbulb, Music } from 'lucide-react';
import { ComponentType, useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext'; // Importa il contesto di autenticazione
import { getAllUserTests } from '@/app/lib/firebase'; // Importa la funzione per recuperare i test da Firebase

// Definizione dell'interfaccia TestResult con il campo 'type'
interface TestResult {
  type: 'raven' | 'eyehand' | 'stroop' | 'speedreading' | 'memory' | 'schulte' | 'rhythm'; // Aggiungi il campo 'type'
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

interface TestProgressChartProps {
  // Non è più necessario passare i dati tramite props, poiché li recuperiamo direttamente qui
}

interface TestScoreBarProps {
  label: string;
  value: number;
  maxValue?: number;
  icon: ComponentType<{ className?: string }>;
  color: {
    bg: string;
    icon: string;
    bar: string;
  };
}

// Componente TestScoreBar
const TestScoreBar = ({ label, value, maxValue = 1000, icon: Icon, color }: TestScoreBarProps) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color.bg}`}>
          <Icon className={`w-5 h-5 ${color.icon}`} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="font-semibold text-gray-900">{value}/1000</span>
          </div>
          <div className="mt-2 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color.bar} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TestProgressChart({}: TestProgressChartProps) {
  const { user } = useAuth(); // Ottieni l'utente autenticato
  const [testResults, setTestResults] = useState<TestResult[]>([]); // Stato per memorizzare i risultati dei test
  const [loading, setLoading] = useState(true); // Stato per gestire il caricamento

  // Recupera i dati da Firebase quando il componente viene renderizzato
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
          setTestResults(typedResults); // Imposta i risultati nello stato
        } catch (error) {
          console.error('Error fetching test results:', error);
        } finally {
          setLoading(false); // Ferma il caricamento
        }
      }
    };

    fetchTestResults(); // Chiama la funzione per recuperare i dati
  }, [user]);

  // Normalizza i dati su una scala da 0 a 1000
  const normalizedData: Record<string, number> = {
    raven: testResults.find((test) => test.type === 'raven')?.score || 0,
    eyehand: Math.round((testResults.find((test) => test.type === 'eyehand')?.accuracy || 0) / 100 * 1000),
    stroop: Math.round((testResults.find((test) => test.type === 'stroop')?.percentile || 0) / 100 * 1000),
    speedreading: Math.round((testResults.find((test) => test.type === 'speedreading')?.wpm || 0) / 100 * 1000),
    memory: testResults.find((test) => test.type === 'memory')?.score || 0,
    schulte: Math.round((testResults.find((test) => test.type === 'schulte')?.percentile || 0) / 100 * 1000),
    rhythm: Math.round((testResults.find((test) => test.type === 'rhythm')?.precision || 0) / 100 * 1000),
  };

  const testConfigs = [
    {
      id: 'raven',
      label: 'Ragionamento Astratto',
      icon: Brain,
      color: {
        bg: 'bg-blue-50',
        icon: 'text-blue-500',
        bar: 'bg-gradient-to-r from-blue-500 to-blue-600'
      }
    },
    {
      id: 'eyehand',
      label: 'Coordinazione Visiva',
      icon: Eye,
      color: {
        bg: 'bg-green-50',
        icon: 'text-green-500',
        bar: 'bg-gradient-to-r from-green-500 to-green-600'
      }
    },
    {
      id: 'stroop',
      label: 'Interferenza Cognitiva',
      icon: ActivitySquare,
      color: {
        bg: 'bg-purple-50',
        icon: 'text-purple-500',
        bar: 'bg-gradient-to-r from-purple-500 to-purple-600'
      }
    },
    {
      id: 'speedreading',
      label: 'Lettura Veloce',
      icon: BookOpen,
      color: {
        bg: 'bg-orange-50',
        icon: 'text-orange-500',
        bar: 'bg-gradient-to-r from-orange-500 to-orange-600'
      }
    },
    {
      id: 'memory',
      label: 'Memoria a Breve Termine',
      icon: Lightbulb,
      color: {
        bg: 'bg-red-50',
        icon: 'text-red-500',
        bar: 'bg-gradient-to-r from-red-500 to-red-600'
      }
    },
    {
      id: 'schulte',
      label: 'Attenzione Visiva',
      icon: Eye,
      color: {
        bg: 'bg-indigo-50',
        icon: 'text-indigo-500',
        bar: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
      }
    },
    {
      id: 'rhythm',
      label: 'Coordinazione Ritmica',
      icon: Music,
      color: {
        bg: 'bg-pink-50',
        icon: 'text-pink-500',
        bar: 'bg-gradient-to-r from-pink-500 to-pink-600'
      }
    }
  ];

  // Filtra i test per includere solo quelli con dati validi
  const validTests = testConfigs.filter((test) => normalizedData[test.id] > 0);

  // Calcola il punteggio medio solo sui test con dati validi
  const averageScore = Math.round(
    validTests.reduce((acc, test) => acc + normalizedData[test.id], 0) / validTests.length
  );

  if (loading) {
    return (
      <div className="w-full bg-white shadow-xl rounded-xl p-6">
        <div className="flex items-center justify-center">
          <div className="animate-pulse">
            <div className="text-lg text-gray-600">Caricamento risultati...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          Risultati Test Cognitivi
        </h2>
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Brain className="w-6 h-6 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Punteggio Medio Totale</p>
            <p className="text-2xl font-bold text-blue-600">{averageScore}/1000</p>
          </div>
        </div>
      </div>
      <div className="space-y-6 mt-6">
        {validTests.map((test) => (
          <TestScoreBar
            key={test.id}
            label={test.label}
            value={normalizedData[test.id]}
            icon={test.icon}
            color={test.color}
          />
        ))}
      </div>
    </div>
  );
}
