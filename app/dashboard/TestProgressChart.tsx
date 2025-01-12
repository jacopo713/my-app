'use client';

import { Brain, Eye, ActivitySquare, BookOpen, Lightbulb, Music } from 'lucide-react';
import { ComponentType } from 'react';

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
  data: TestResult[];
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

export default function TestProgressChart({ data }: TestProgressChartProps) {
  // Define the type for the keys of normalizedData
  type TestId = 'raven' | 'eyeHand' | 'stroop' | 'speedReading' | 'memory' | 'schulte' | 'rhythm';

  // Normalizza i dati su una scala da 0 a 1000
  const normalizedData: Record<TestId, number> = {
    raven: data.find((test) => test.type === 'raven')?.score || 0,
    eyeHand: Math.round((data.find((test) => test.type === 'eyeHand')?.accuracy || 0) / 100 * 1000),
    stroop: Math.round((data.find((test) => test.type === 'stroop')?.percentile || 0) / 100 * 1000),
    speedReading: Math.round((data.find((test) => test.type === 'speedReading')?.wpm || 0) / 100 * 1000),
    memory: data.find((test) => test.type === 'memory')?.score || 0,
    schulte: Math.round((data.find((test) => test.type === 'schulte')?.percentile || 0) / 100 * 1000),
    rhythm: Math.round((data.find((test) => test.type === 'rhythm')?.precision || 0) / 100 * 1000),
  };

  const testConfigs = [
    {
      id: 'raven' as TestId,
      label: 'Ragionamento Astratto',
      icon: Brain,
      color: {
        bg: 'bg-blue-50',
        icon: 'text-blue-500',
        bar: 'bg-gradient-to-r from-blue-500 to-blue-600'
      }
    },
    {
      id: 'eyeHand' as TestId,
      label: 'Coordinazione Visiva',
      icon: Eye,
      color: {
        bg: 'bg-green-50',
        icon: 'text-green-500',
        bar: 'bg-gradient-to-r from-green-500 to-green-600'
      }
    },
    {
      id: 'stroop' as TestId,
      label: 'Interferenza Cognitiva',
      icon: ActivitySquare,
      color: {
        bg: 'bg-purple-50',
        icon: 'text-purple-500',
        bar: 'bg-gradient-to-r from-purple-500 to-purple-600'
      }
    },
    {
      id: 'speedReading' as TestId,
      label: 'Lettura Veloce',
      icon: BookOpen,
      color: {
        bg: 'bg-orange-50',
        icon: 'text-orange-500',
        bar: 'bg-gradient-to-r from-orange-500 to-orange-600'
      }
    },
    {
      id: 'memory' as TestId,
      label: 'Memoria a Breve Termine',
      icon: Lightbulb,
      color: {
        bg: 'bg-red-50',
        icon: 'text-red-500',
        bar: 'bg-gradient-to-r from-red-500 to-red-600'
      }
    },
    {
      id: 'schulte' as TestId,
      label: 'Attenzione Visiva',
      icon: Eye,
      color: {
        bg: 'bg-indigo-50',
        icon: 'text-indigo-500',
        bar: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
      }
    },
    {
      id: 'rhythm' as TestId,
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
