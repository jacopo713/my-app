'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, ActivitySquare, BookOpen, Clock, Lightbulb, Music, ChevronDown } from 'lucide-react';
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
import { TestInstructionsComponent } from './TestInstructions';
import { saveTestResults } from '@/app/lib/firebase'; // Importa la funzione per salvare i risultati
import { useAuth } from '@/app/contexts/AuthContext'; // Importa il contesto di autenticazione

// Stile personalizzato per rendere la freccia più spessa
const customChevronStyle = {
  strokeWidth: 5,
};

interface TestResults {
  raven: {
    score: number;
    accuracy: number;
    percentile?: number;
    type?: string; // Aggiungi il campo type
  } | null;
  eyeHand: {
    score: number;
    accuracy: number;
    averageDeviation: number;
    type?: string; // Aggiungi il campo type
  } | null;
  stroop: {
    score: number;
    percentile: number;
    interferenceScore: number;
    type?: string; // Aggiungi il campo type
  } | null;
  speedReading: {
    wpm: number;
    percentile: number;
    type?: string; // Aggiungi il campo type
  } | null;
  memory: {
    score: number;
    percentile: number;
    evaluation: string;
    type?: string; // Aggiungi il campo type
  } | null;
  schulte: {
    score: number;
    averageTime: number;
    gridSizes: number[];
    completionTimes: number[];
    percentile: number;
    type?: string; // Aggiungi il campo type
  } | null;
  rhythm: {
    precision: number;
    level: number;
    type?: string; // Aggiungi il campo type
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
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const router = useRouter();
  const { user } = useAuth(); // Ottieni l'utente autenticato

  const phases: TestPhase[] = [
    "intro", "raven", "eyehand", "stroop", 
    "speedreading", "memory", "schulte", "rhythm", "results"
  ];

  useEffect(() => {
    setTestStarted(false);
  }, [phase]);

  // Nascondi l'indicatore di scorrimento dopo 5 secondi
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Nascondi l'indicatore di scorrimento quando l'utente scorre
  useEffect(() => {
    const container = document.getElementById('scroll-container');
    if (container) {
      const handleScroll = () => {
        setShowScrollIndicator(false);
      };
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleRavenComplete = async (ravenResults: { score: number; accuracy: number }) => {
    const updatedResults = {
      ...ravenResults,
      percentile: Math.round(ravenResults.accuracy),
      type: "cognitive" // Aggiungi il campo type
    };

    setResults(prev => ({
      ...prev,
      raven: updatedResults
    }));

    // Salva i risultati nel database Firebase
    if (user) {
      await saveTestResults(user.uid, 'ravenTest', {
        ...updatedResults,
        timestamp: new Date().toISOString()
      });
    }

    setProgress(25);
    setPhase("eyehand");
  };

  const handleEyeHandComplete = async (eyeHandResults: { score: number; accuracy: number; averageDeviation: number }) => {
    const updatedResults = {
      ...eyeHandResults,
      accuracy: Math.round(eyeHandResults.accuracy),
      type: "coordination" // Aggiungi il campo type
    };

    setResults(prev => ({
      ...prev,
      eyeHand: updatedResults
    }));

    // Salva i risultati nel database Firebase
    if (user) {
      await saveTestResults(user.uid, 'eyeHandTest', {
        ...updatedResults,
        timestamp: new Date().toISOString()
      });
    }

    setProgress(50);
    setPhase("stroop");
  };

  const handleStroopComplete = async (stroopResults: { score: number; percentile: number; interferenceScore: number }) => {
    const updatedResults = {
      ...stroopResults,
      type: "cognitive" // Aggiungi il campo type
    };

    setResults(prev => ({
      ...prev,
      stroop: updatedResults
    }));

    // Salva i risultati nel database Firebase
    if (user) {
      await saveTestResults(user.uid, 'stroopTest', {
        ...updatedResults,
        timestamp: new Date().toISOString()
      });
    }

    setProgress(75);
    setPhase("speedreading");
  };

  const handleSpeedReadingComplete = async (speedReadingResults: { wpm: number; percentile: number }) => {
    const updatedResults = {
      ...speedReadingResults,
      type: "reading" // Aggiungi il campo type
    };

    setResults(prev => ({
      ...prev,
      speedReading: updatedResults
    }));

    // Salva i risultati nel database Firebase
    if (user) {
      await saveTestResults(user.uid, 'speedReadingTest', {
        ...updatedResults,
        timestamp: new Date().toISOString()
      });
    }

    setProgress(85);
    setPhase("memory");
  };

  const handleMemoryComplete = async (memoryResults: { score: number; percentile: number; evaluation: string }) => {
    const updatedResults = {
      ...memoryResults,
      type: "memory" // Aggiungi il campo type
    };

    setResults(prev => ({
      ...prev,
      memory: updatedResults
    }));

    // Salva i risultati nel database Firebase
    if (user) {
      await saveTestResults(user.uid, 'memoryTest', {
        ...updatedResults,
        timestamp: new Date().toISOString()
      });
    }

    setProgress(90);
    setPhase("schulte");
  };

  const handleSchulteComplete = async (schulteResults: { score: number; averageTime: number; gridSizes: number[]; completionTimes: number[]; percentile: number }) => {
    const updatedResults = {
      ...schulteResults,
      type: "attention" // Aggiungi il campo type
    };

    setResults(prev => ({
      ...prev,
      schulte: updatedResults
    }));

    // Salva i risultati nel database Firebase
    if (user) {
      await saveTestResults(user.uid, 'schulteTest', {
        ...updatedResults,
        timestamp: new Date().toISOString()
      });
    }

    setProgress(95);
    setPhase("rhythm");
  };

  const handleRhythmComplete = async (rhythmResults: { precision: number; level: number }) => {
    const updatedResults = {
      ...rhythmResults,
      type: "rhythm" // Aggiungi il campo type
    };

    setResults(prev => ({
      ...prev,
      rhythm: updatedResults
    }));

    // Salva i risultati nel database Firebase
    if (user) {
      await saveTestResults(user.uid, 'rhythmTest', {
        ...updatedResults,
        timestamp: new Date().toISOString()
      });
    }

    setProgress(100);
    setPhase("results");
  };

  // ... (resto del codice rimane invariato)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        {/* Barra di progressione fissa in alto */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contenuto principale con margine superiore ridotto */}
        <div className="mt-16"> {/* Margine ridotto */}
          {renderCurrentPhase()}
        </div>

        {/* Pulsante fisso in basso */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg z-20">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                const currentIndex = phases.indexOf(phase);
                if (currentIndex < phases.length - 1) {
                  const nextPhase = phases[currentIndex + 1];
                  setPhase(nextPhase);
                  setProgress(Math.min((currentIndex + 1) * 15, 100));
                }
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl 
                font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-px"
            >
              <span className="text-lg">Salta alla Fase Successiva →</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
