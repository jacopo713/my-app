'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, Star } from 'lucide-react';
import RavenTest from './components/Raven';
import EyeHandTest from './components/EyeHand';
import StroopTest from './components/Stroop';
import SchulteTable from './components/Schulte';
import ShortTermMemoryTest from './components/ShortTermMemory';
import SpeedReadingTrainer from './components/SpeedReading';
import RhythmTest from './components/Rhythm';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

interface RavenResults {
  score: number;
  accuracy: number;
}

interface EyeHandResults {
  score: number;
  accuracy: number;
  averageDeviation: number;
}

interface StroopResults {
  score: number;
  accuracy: number;
  averageReactionTime: number;
  totalResponses: number;
  correctResponses: number;
  interferenceScore: number;
  responsesPerMinute: string;
}

interface SchulteResults {
  score: number;
  accuracy: number;
  averageTime: number;
  gridSizes: number[];
  completionTimes: number[];
}

interface ShortTermMemoryResults {
  score: number;
  percentile: number;
  evaluation: string;
}

interface SpeedReadingResults {
  wpm: number;
  accuracy: number;
  score: number;
}

interface RhythmResults {
  precision: number;
  level: number;
}

type TestPhase = 
  | "intro" 
  | "raven" 
  | "eyeHand" 
  | "stroop"
  | "schulte"
  | "shortTermMemory" 
  | "speedReading" 
  | "rhythm" 
  | "results";

interface TestResults {
  raven: (RavenResults & { percentile: number }) | null;
  eyeHand: (EyeHandResults & { percentile: number }) | null;
  stroop: (StroopResults & { percentile: number }) | null;
  schulte: (SchulteResults & { percentile: number }) | null;
  shortTermMemory: ShortTermMemoryResults | null;
  speedReading: (SpeedReadingResults & { percentile: number }) | null;
  rhythm: (RhythmResults & { percentile: number }) | null;
}

export default function TestPage() {
  const [phase, setPhase] = useState<TestPhase>("intro");
  const [results, setResults] = useState<TestResults>({
    raven: null,
    eyeHand: null,
    stroop: null,
    schulte: null,
    shortTermMemory: null,
    speedReading: null,
    rhythm: null
  });
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  const handleRavenComplete = (ravenResults: RavenResults) => {
    setResults(prev => ({
      ...prev,
      raven: {
        ...ravenResults,
        percentile: Math.round((ravenResults.score / 1000) * 100)
      }
    }));
    setProgress(15);
    setPhase("eyeHand");
  };

  const handleEyeHandComplete = (eyeHandResults: EyeHandResults) => {
    setResults(prev => ({
      ...prev,
      eyeHand: {
        ...eyeHandResults,
        percentile: Math.round((eyeHandResults.score / 1000) * 100)
      }
    }));
    setProgress(25);
    setPhase("stroop");
  };

  const handleStroopComplete = (stroopResults: StroopResults) => {
    setResults(prev => ({
      ...prev,
      stroop: {
        ...stroopResults,
        percentile: Math.round((stroopResults.score / 1000) * 100)
      }
    }));
    setProgress(40);
    setPhase("schulte");
  };

  const handleSchulteComplete = (schulteResults: SchulteResults) => {
    setResults(prev => ({
      ...prev,
      schulte: {
        ...schulteResults,
        percentile: Math.round((schulteResults.score / 1000) * 100)
      }
    }));
    setProgress(55);
    setPhase("shortTermMemory");
  };

  const handleShortTermMemoryComplete = (memoryResults: ShortTermMemoryResults) => {
    setResults(prev => ({
      ...prev,
      shortTermMemory: memoryResults
    }));
    setProgress(70);
    setPhase("speedReading");
  };

  const handleSpeedReadingComplete = (speedReadingResults: SpeedReadingResults) => {
    setResults(prev => ({
      ...prev,
      speedReading: {
        ...speedReadingResults,
        percentile: Math.round((speedReadingResults.score / 1000) * 100)
      }
    }));
    setProgress(85);
    setPhase("rhythm");
  };

  const handleRhythmComplete = (rhythmResults: RhythmResults) => {
    setResults(prev => ({
      ...prev,
      rhythm: {
        ...rhythmResults,
        percentile: Math.round((rhythmResults.precision / 100) * 100)
      }
    }));
    setProgress(100);
    setPhase("results");

    // Salva i risultati nel database
    if (user) {
      // TODO: Implementare il salvataggio dei risultati
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <Brain className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-bold mb-2">Ragionamento Astratto</h3>
                  <p className="text-gray-600">Test delle matrici progressive</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <Eye className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="font-bold mb-2">Coordinazione</h3>
                  <p className="text-gray-600">Test di coordinazione occhio-mano</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <Star className="w-8 h-8 text-purple-500 mb-4" />
                  <h3 className="font-bold mb-2">Memoria</h3>
                  <p className="text-gray-600">Test di memoria a breve termine</p>
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
      case "eyeHand":
        return <EyeHandTest onComplete={handleEyeHandComplete} />;
      case "stroop":
        return <StroopTest onComplete={handleStroopComplete} />;
      case "schulte":
        return <SchulteTable onComplete={handleSchulteComplete} />;
      case "shortTermMemory":
        return <ShortTermMemoryTest onComplete={handleShortTermMemoryComplete} />;
      case "speedReading":
        return <SpeedReadingTrainer onComplete={handleSpeedReadingComplete} />;
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
                    <h3 className="font-bold mb-2">Ragionamento Astratto</h3>
                    <p>Punteggio: {results.raven.score}</p>
                    <p>Precisione: {results.raven.accuracy}%</p>
                    <p>Percentile: {results.raven.percentile}°</p>
                  </div>
                )}
                {/* Aggiungi sezioni simili per gli altri test */}
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
      </div>
    </ProtectedRoute>
  );
}
