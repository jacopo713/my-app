Hai detto:
import React from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, ActivitySquare, BookOpen, Lightbulb, Music } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

interface TestResultsProps {
  results: {
    raven: {
      score: number;
      accuracy: number;
      percentile?: number;
    } | null;
    eyeHand: {
      score: number;
      accuracy: number;
      averageDeviation: number;
    } | null;
    stroop: {
      score: number;
      percentile: number;
      interferenceScore: number;
    } | null;
    speedReading: {
      wpm: number;
      percentile: number;
    } | null;
    memory: {
      score: number;
      percentile: number;
      evaluation: string;
    } | null;
    schulte: {
      score: number;
      averageTime: number;
      gridSizes: number[];
      completionTimes: number[];
      percentile: number;
    } | null;
    rhythm: {
      precision: number;
      level: number;
    } | null;
  };
}

export default function TestResults({ results }: TestResultsProps) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risultati del Test</h2>

        {/* Contenuto dei risultati con sfocatura per utenti non registrati */}
        <div className={space-y-6 ${!user ? 'filter blur-sm' : ''}}>
          {/* Risultato del test Raven */}
          {results.raven && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-blue-500" />
                <h3 className="font-bold">Ragionamento Astratto</h3>
              </div>
              <p>Punteggio: {Math.round(results.raven.score)}/1000</p>
              {results.raven.percentile && <p>Percentile: {results.raven.percentile}°</p>}
            </div>
          )}

          {/* Risultato del test EyeHand */}
          {results.eyeHand && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-6 h-6 text-green-500" />
                <h3 className="font-bold">Coordinazione Visiva</h3>
              </div>
              <p>Punteggio: {Math.round(results.eyeHand.score)}</p>
              <p>Percentile: {Math.round(results.eyeHand.accuracy)}°</p>
            </div>
          )}

          {/* Risultato del test Stroop */}
          {results.stroop && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ActivitySquare className="w-6 h-6 text-purple-500" />
                <h3 className="font-bold">Interferenza Cognitiva</h3>
              </div>
              <p>Punteggio: {results.stroop.score}</p>
              <p>Percentile: {results.stroop.percentile}°</p>
              <p>Punteggio di Interferenza: {results.stroop.interferenceScore}</p>
            </div>
          )}

          {/* Risultato del test SpeedReading */}
          {results.speedReading && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
                <h3 className="font-bold">Lettura Veloce</h3>
              </div>
              <p>Punteggio: {results.speedReading.wpm}</p>
              <p>Percentile: {results.speedReading.percentile}°</p>
            </div>
          )}

          {/* Risultato del test Memory */}
          {results.memory && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-6 h-6 text-red-500" />
                <h3 className="font-bold">Memoria a Breve Termine</h3>
              </div>
              <p>Punteggio: {results.memory.score}</p>
              <p>Percentile: {results.memory.percentile}°</p>
              <p>Valutazione: {results.memory.evaluation}</p>
            </div>
          )}

          {/* Risultato del test Schulte */}
          {results.schulte && (
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-6 h-6 text-indigo-500" />
                <h3 className="font-bold">Tabella di Schulte</h3>
              </div>
              <p>Punteggio: {results.schulte.score}</p>
              <p>Tempo Medio: {results.schulte.averageTime}s</p>
              <p>Percentile: {results.schulte.percentile}°</p>
            </div>
          )}

          {/* Risultato del test Rhythm */}
          {results.rhythm && (
            <div className="p-4 bg-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-6 h-6 text-pink-500" />
                <h3 className="font-bold">Test del Ritmo</h3>
              </div>
              <p>Precisione: {results.rhythm.precision}%</p>
              <p>Livello Raggiunto: {results.rhythm.level}</p>
            </div>
          )}
        </div>

        {/* Overlay per utenti non registrati */}
        {!user && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 mb-4">
                Iscriviti per sbloccare i risultati completi
              </p>
              <button
                onClick={() => router.push('/register')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Iscriviti ora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
