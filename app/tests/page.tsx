'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, ActivitySquare, BookOpen } from 'lucide-react';
import { 
  RavenTest, 
  EyeHandTest, 
  StroopTest, 
  SpeedReadingTrainer, 
  ShortTermMemoryTest, 
  SchulteTable, 
  RhythmTest 
} from './components';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { type TestPhase } from './TestInstructions';
import TestInstructions from './components/istruzioni';

interface TestResults {
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
    accuracy: number;
    score: number;
  } | null;
  memory: {
    score: number;
    percentile: number;
    evaluation: string;
  } | null;
  schulte: {
    score: number;
    accuracy: number;
    averageTime: number;
    gridSizes: number[];
    completionTimes: number[];
    percentile: number;
  } | null;
  rhythm: {
    precision: number;
    level: number;
  } | null;
}

export default function TestPage() {
  const [phase, setPhase] = useState<TestPhase>("intro");
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState<TestResults>({
    raven: null,
    eyeHand: null,
    stroop: null,
    speedReading: null,
    memory: null,
    schulte: null,
    rhythm: null
  });
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const phases: TestPhase[] = [
    "intro", "raven", "eyehand", "stroop", 
    "speedreading", "memory", "schulte", "rhythm", "results"
  ];

  useEffect(() => {
    setTestStarted(false);
  }, [phase]);

  const handleRavenComplete = (ravenResults: { score: number; accuracy: number }) => {
    setResults(prev => ({
      ...prev,
      raven: {
        ...ravenResults,
        percentile: Math.round(ravenResults.accuracy) // Arrotonda il percentile
      }
    }));
    setProgress(25);
    setPhase("eyehand");
  };

  const handleEyeHandComplete = (eyeHandResults: { score: number; accuracy: number; averageDeviation: number }) => {
    setResults(prev => ({
      ...prev,
      eyeHand: {
        ...eyeHandResults,
        accuracy: Math.round(eyeHandResults.accuracy) // Arrotonda la precisione
      }
    }));
    setProgress(50);
    setPhase("stroop");
  };

  const handleStroopComplete = (stroopResults: { score: number; percentile: number; interferenceScore: number }) => {
    setResults(prev => ({
      ...prev,
      stroop: stroopResults
    }));
    setProgress(75);
    setPhase("speedreading");
  };

  const handleSpeedReadingComplete = (speedReadingResults: { wpm: number; accuracy: number; score: number }) => {
    setResults(prev => ({
      ...prev,
      speedReading: speedReadingResults
    }));
    setProgress(85);
    setPhase("memory");
  };

  const handleMemoryComplete = (memoryResults: { score: number; percentile: number; evaluation: string }) => {
    setResults(prev => ({
      ...prev,
      memory: memoryResults
    }));
    setProgress(90);
    setPhase("schulte");
  };

  const handleSchulteComplete = (schulteResults: { score: number; accuracy: number; averageTime: number; gridSizes: number[]; completionTimes: number[]; percentile: number }) => {
    setResults(prev => ({
      ...prev,
      schulte: schulteResults
    }));
    setProgress(95);
    setPhase("rhythm");
  };

  const handleRhythmComplete = (rhythmResults: { precision: number; level: number }) => {
    setResults(prev => ({
      ...prev,
      rhythm: rhythmResults
    }));
    setProgress(100);
    setPhase("results");
  };

  const renderCurrentPhase = () => {
    const renderTest = () => {
      switch (phase) {
        case "intro":
          return (
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                  Test del Quoziente Intellettivo
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <Brain className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-bold mb-2">Ragionamento Astratto</h3>
                    <p className="text-gray-600">Test delle matrici progressive</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <Eye className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="font-bold mb-2">Coordinazione Visiva</h3>
                    <p className="text-gray-600">Test di precisione occhio-mano</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <ActivitySquare className="w-8 h-8 text-purple-500 mb-4" />
                    <h3 className="font-bold mb-2">Interferenza Cognitiva</h3>
                    <p className="text-gray-600">Test di Stroop</p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <BookOpen className="w-8 h-8 text-orange-500 mb-4" />
                    <h3 className="font-bold mb-2">Lettura Veloce</h3>
                    <p className="text-gray-600">Test di velocità di lettura</p>
                  </div>
                </div>
                <button
                  onClick={() => setPhase("raven")}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg 
                           hover:bg-blue-700 transition-colors font-medium"
                >
                  Inizia il Test
                </button>
              </div>
            </div>
          );
        case "raven":
          return <RavenTest onComplete={handleRavenComplete} />;
        case "eyehand":
          return <EyeHandTest onComplete={handleEyeHandComplete} />;
        case "stroop":
          return <StroopTest onComplete={handleStroopComplete} />;
        case "speedreading":
          return <SpeedReadingTrainer onComplete={handleSpeedReadingComplete} />;
        case "memory":
          return <ShortTermMemoryTest onComplete={handleMemoryComplete} />;
        case "schulte":
          return <SchulteTable onComplete={handleSchulteComplete} />;
        case "rhythm":
          return <RhythmTest onComplete={handleRhythmComplete} />;
        case "results":
          return (
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Risultati del Test
                </h2>
                <div className="space-y-6">
                  {results.raven && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-6 h-6 text-blue-500" />
                        <h3 className="font-bold">Ragionamento Astratto</h3>
                      </div>
                      <p>Punteggio: {Math.round(results.raven.score)}/1000</p>
                      {results.raven.percentile && (
                        <p>Percentile: {results.raven.percentile}°</p>
                      )}
                    </div>
                  )}
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
                  {results.speedReading && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-6 h-6 text-orange-500" />
                        <h3 className="font-bold">Lettura Veloce</h3>
                      </div>
                      <p>Parole al Minuto: {results.speedReading.wpm}</p>
                      <p>Precisione: {results.speedReading.accuracy}%</p>
                      <p>Punteggio: {results.speedReading.score}</p>
                    </div>
                  )}
                  {results.memory && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-6 h-6 text-blue-500" />
                        <h3 className="font-bold">Memoria a Breve Termine</h3>
                      </div>
                      <p>Punteggio: {results.memory.score}</p>
                      <p>Percentile: {results.memory.percentile}°</p>
                      <p>Valutazione: {results.memory.evaluation}</p>
                    </div>
                  )}
                  {results.schulte && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-6 h-6 text-green-500" />
                        <h3 className="font-bold">Tabella di Schulte</h3>
                      </div>
                      <p>Punteggio: {results.schulte.score}</p>
                      <p>Precisione: {results.schulte.accuracy}%</p>
                      <p>Tempo Medio: {results.schulte.averageTime}s</p>
                      <p>Percentile: {results.schulte.percentile}°</p>
                    </div>
                  )}
                  {results.rhythm && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ActivitySquare className="w-6 h-6 text-purple-500" />
                        <h3 className="font-bold">Test del Ritmo</h3>
                      </div>
                      <p>Precisione: {results.rhythm.precision}%</p>
                      <p>Livello Raggiunto: {results.rhythm.level}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg 
                           hover:bg-blue-700 transition-colors font-medium"
                >
                  Torna alla Dashboard
                </button>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4">
        {!testStarted && phase !== "intro" && phase !== "results" && (
          <TestInstructions 
            phase={phase}
            onStart={() => setTestStarted(true)}
          />
        )}
        {(testStarted || phase === "intro" || phase === "results") && renderTest()}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {renderCurrentPhase()}
        
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              const currentIndex = phases.indexOf(phase);
              if (currentIndex < phases.length - 1) {
                const nextPhase = phases[currentIndex + 1];
                setPhase(nextPhase);
                setProgress(Math.min((currentIndex + 1) * 15, 100));

                const mockResult = {
                  score: 85,
                  accuracy: 90,
                  percentile: 75,
                  averageDeviation: 5,
                  averageReactionTime: 450,
                  interferenceScore: 100,
                  responsesPerMinute: "45",
                  wpm: 300,
                  evaluation: "Eccellente",
                  level: 3,
                  precision: 95,
                  gridSizes: [3, 4, 5],
                  completionTimes: [10, 15, 20]
                };

                switch(phase) {
                  case "raven":
                    setResults(prev => ({ ...prev, raven: { 
                      score: mockResult.score, 
                      accuracy: mockResult.accuracy, 
                      percentile: mockResult.percentile 
                    }}));
                    break;
                  case "eyehand":
                    setResults(prev => ({ ...prev, eyeHand: { 
                      score: mockResult.score, 
                      accuracy: mockResult.accuracy, 
                      averageDeviation: mockResult.averageDeviation 
                    }}));
                    break;
                  case "stroop":
                    setResults(prev => ({ ...prev, stroop: { 
                      score: mockResult.score,
                      percentile: mockResult.percentile,
                      interferenceScore: mockResult.interferenceScore
                    }}));
                    break;
                  case "speedreading":
                    setResults(prev => ({ ...prev, speedReading: { 
                      wpm: mockResult.wpm, 
                      accuracy: mockResult.accuracy, 
                      score: mockResult.score 
                    }}));
                    break;
                  case "memory":
                    setResults(prev => ({ ...prev, memory: { 
                      score: mockResult.score,
                      percentile: mockResult.percentile,
                      evaluation: mockResult.evaluation 
                    }}));
                    break;
                  case "schulte":
                    setResults(prev => ({ ...prev, schulte: { 
                      score: mockResult.score,
                      accuracy: mockResult.accuracy,
                      averageTime: mockResult.averageDeviation,
                      gridSizes: mockResult.gridSizes,
                      completionTimes: mockResult.completionTimes,
                      percentile: mockResult.percentile
                    }}));
                    break;
                  case "rhythm":
                    setResults(prev => ({ ...prev, rhythm: { 
                      precision: mockResult.precision,
                      level: mockResult.level 
                    }}));
                    break;
                }
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg 
                     hover:bg-red-700 transition-colors font-medium
                     flex items-center gap-2"
          >
            <span className="text-sm">Salta alla Fase Successiva →</span>
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
