// app/tests/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, ActivitySquare, BookOpen, Clock, Music } from 'lucide-react';
import { RavenTest, EyeHandTest, StroopTest, SpeedReadingTrainer, ShortTermMemoryTest, SchulteTable, RhythmTest } from './components';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

type TestPhase = "intro" | "raven" | "eyehand" | "stroop" | "speedreading" | "memory" | "schulte" | "rhythm" | "results";

interface TestResults {
  raven: {
    score: number;
    accuracy: number;
    percentile: number;
  } | null;
  eyeHand: {
    score: number;
    accuracy: number;
    averageDeviation: number;
  } | null;
  stroop: {
    score: number;
    accuracy: number;
    averageReactionTime: number;
    interferenceScore: number;
    responsesPerMinute: string;
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

  const moveToNextPhase = () => {
    const currentIndex = phases.indexOf(phase);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      setPhase(nextPhase);
      setProgress(Math.min((currentIndex + 1) * 15, 100));
      
      // Mock results for testing
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
        completionTimes: [10, 15, 20],
      };

      setResults(prev => ({
        ...prev,
        [phase]: mockResult
      }));
    }
  };

  const renderCurrentPhase = () => {
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Risultati del Test</h2>
              <div className="space-y-6">
                {results.raven && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-6 h-6 text-blue-500" />
                      <h3 className="font-bold">Ragionamento Astratto</h3>
                    </div>
                    <p>Punteggio: {results.raven.score}</p>
                    <p>Precisione: {results.raven.accuracy}%</p>
                    <p>Percentile: {results.raven.percentile}°</p>
                  </div>
                )}
                {/* Altri risultati dei test... */}
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

  const handleRavenComplete = (results: any) => {
    setResults(prev => ({ ...prev, raven: results }));
    setProgress(25);
    setPhase("eyehand");
  };

  const handleEyeHandComplete = (results: any) => {
    setResults(prev => ({ ...prev, eyeHand: results }));
    setProgress(50);
    setPhase("stroop");
  };

  const handleStroopComplete = (results: any) => {
    setResults(prev => ({ ...prev, stroop: results }));
    setProgress(75);
    setPhase("speedreading");
  };

  const handleSpeedReadingComplete = (results: any) => {
    setResults(prev => ({ ...prev, speedReading: results }));
    setProgress(85);
    setPhase("memory");
  };

  const handleMemoryComplete = (results: any) => {
    setResults(prev => ({ ...prev, memory: results }));
    setProgress(90);
    setPhase("schulte");
  };

  const handleSchulteComplete = (results: any) => {
    setResults(prev => ({ ...prev, schulte: results }));
    setProgress(95);
    setPhase("rhythm");
  };

  const handleRhythmComplete = (results: any) => {
    setResults(prev => ({ ...prev, rhythm: results }));
    setProgress(100);
    setPhase("results");
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
        
        {/* Debug button - always visible */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={moveToNextPhase}
            className="bg-red-600 text-white px-4 py-2 rounded-lg 
                     hover:bg-red-700 transition-colors font-medium
                     flex items-center gap-2"
          >
            <span className="text-sm">Skip to Next Phase →</span>
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
