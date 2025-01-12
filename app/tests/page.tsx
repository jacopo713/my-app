// app/tests/page.tsx
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
import TestResults from '@/app/components/Test/TestResults';
import { useAuth } from '@/app/contexts/AuthContext';
import { type TestPhase } from './TestInstructions';
import { TestInstructionsComponent } from './TestInstructions';

const customChevronStyle = {
  strokeWidth: 5,
};

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
  const { user } = useAuth();

  const phases: TestPhase[] = [
    "intro", "raven", "eyehand", "stroop", 
    "speedreading", "memory", "schulte", "rhythm", "results"
  ];

  useEffect(() => {
    setTestStarted(false);
  }, [phase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleRavenComplete = (ravenResults: { score: number; accuracy: number }) => {
    setResults(prev => ({
      ...prev,
      raven: {
        ...ravenResults,
        percentile: Math.round(ravenResults.accuracy)
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
        accuracy: Math.round(eyeHandResults.accuracy)
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

  const handleSpeedReadingComplete = (speedReadingResults: { wpm: number; percentile: number }) => {
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

  const handleSchulteComplete = (schulteResults: { score: number; averageTime: number; gridSizes: number[]; completionTimes: number[]; percentile: number }) => {
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
    
    // Se l'utente è già loggato, mostra direttamente i risultati
    // altrimenti passa alla fase di registrazione
    if (user) {
      setPhase("results");
    } else {
      setPhase("registration");
    }
  };

  const renderTestIntro = () => (
    <div className="max-w-4xl mx-auto px-4">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Test del Quoziente Intellettivo Completo
          </h1>
          <p className="text-sm sm:text-base text-blue-100 mb-2">
            Valuta le tue capacità cognitive attraverso test scientificamente validati
          </p>
          <div className="text-xs text-blue-200 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Durata stimata: 45 minuti • 7 test specializzati</span>
          </div>
        </div>
      </div>

      <div id="scroll-container" className="bg-white shadow-xl rounded-b-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Brain,
              title: "Ragionamento Astratto",
              subtitle: "Test delle matrici progressive",
              description: "Valuta la capacità di identificare pattern e relazioni logiche",
              gradient: "from-blue-50 to-blue-100",
              iconColor: "text-blue-600",
              bgHover: "hover:bg-blue-50/80"
            },
            {
              icon: Eye,
              title: "Coordinazione Visiva",
              subtitle: "Test di precisione occhio-mano",
              description: "Misura la tua coordinazione visivo-motoria e i tempi di reazione",
              gradient: "from-green-50 to-green-100",
              iconColor: "text-green-600",
              bgHover: "hover:bg-green-50/80"
            },
            {
              icon: ActivitySquare,
              title: "Interferenza Cognitiva",
              subtitle: "Test di Stroop",
              description: "Analizza la tua capacità di gestire informazioni conflittuali",
              gradient: "from-purple-50 to-purple-100",
              iconColor: "text-purple-600",
              bgHover: "hover:bg-purple-50/80"
            },
            {
              icon: BookOpen,
              title: "Lettura Veloce",
              subtitle: "Test di velocità di lettura",
              description: "Valuta la tua velocità di lettura e comprensione",
              gradient: "from-orange-50 to-orange-100",
              iconColor: "text-orange-600",
              bgHover: "hover:bg-orange-50/80"
            },
            {
              icon: Lightbulb,
              title: "Memoria a Breve Termine",
              subtitle: "Test di memorizzazione",
              description: "Misura la capacità di memorizzare e ricordare informazioni",
              gradient: "from-red-50 to-red-100",
              iconColor: "text-red-600",
              bgHover: "hover:bg-red-50/80"
            },
            {
              icon: Eye,
              title: "Attenzione Visiva",
              subtitle: "Tabella di Schulte",
              description: "Valuta la velocità di ricerca visiva e l'attenzione selettiva",
              gradient: "from-indigo-50 to-indigo-100",
              iconColor: "text-indigo-600",
              bgHover: "hover:bg-indigo-50/80"
            },
            {
              icon: Music,
              title: "Test del Ritmo",
              subtitle: "Coordinazione temporale",
              description: "Misura la precisione nella percezione e riproduzione di pattern ritmici",
              gradient: "from-pink-50 to-pink-100",
              iconColor: "text-pink-600",
              bgHover: "hover:bg-pink-50/80"
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${item.gradient} rounded-xl p-4 transition-all duration-300 
                hover:shadow-lg transform hover:translate-y-px ${item.bgHover}`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-white p-2.5 rounded-lg shadow-sm">
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {showScrollIndicator && (
        <div className="fixed bottom-20 left-0 right-0 w-full flex justify-center items-center flex-col gap-2 animate-bounce">
          <span className="text-sm text-gray-700 font-medium">Scroll down</span>
          <div className="w-16 h-0.5 bg-white"></div>
          <ChevronDown className="w-8 h-8 text-blue-600" style={customChevronStyle} />
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg z-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setPhase("raven")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl 
              font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-px"
          >
            <span className="text-lg">Inizia il Test</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentPhase = () => {
    switch (phase) {
      case "intro":
        return renderTestIntro();
      
      case "raven":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <RavenTest onComplete={handleRavenComplete} />
        );
      
      case "eyehand":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <EyeHandTest onComplete={handleEyeHandComplete} />
        );
      
      case "stroop":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <StroopTest onComplete={handleStroopComplete} />
        );
      
      case "speedreading":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <SpeedReadingTrainer onComplete={handleSpeedReadingComplete} />
        );
      
      case "memory":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <ShortTermMemoryTest onComplete={handleMemoryComplete} />
        );
      
      case "schulte":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <SchulteTable onComplete={handleSchulteComplete} />
        );
      
      case "rhythm":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <RhythmTest onComplete={handleRhythmComplete} />
        );

      case "registration":
        return <TestResults testResults={results} />;

      case "results":
        return (
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Risultati Completi del Test
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.raven && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Test delle Matrici Progressive</h3>
                    </div>
                    <p>Punteggio: {results.raven.score}</p>
                    <p>Accuratezza: {results.raven.accuracy}%</p>
                    {results.raven.percentile && (
                      <p>Percentile: {results.raven.percentile}°</p>
                    )}
                  </div>
                )}

                {results.eyeHand && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Coordinazione Visiva</h3>
                    </div>
                    <p>Punteggio: {results.eyeHand.score}</p>
                    <p>Accuratezza: {results.eyeHand.accuracy}%</p>
                    <p>Deviazione Media: {results.eyeHand.averageDeviation}ms</p>
                  </div>
                )}

                {results.stroop && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ActivitySquare className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold">Test di Stroop</h3>
                    </div>
                    <p>Punteggio: {results.stroop.score}</p>
                    <p>Percentile: {results.stroop.percentile}°</p>
                    <p>Interferenza: {results.stroop.interferenceScore}</p>
                  </div>
                )}

                {results.speedReading && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold">Lettura Veloce</h3>
                    </div>
                    <p>Velocità: {results.speedReading.wpm} parole/min</p>
                    <p>Percentile: {results.speedReading.percentile}°</p>
                  </div>
                )}

                {results.memory && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold">Memoria a Breve Termine</h3>
                    </div>
                    <p>Punteggio: {results.memory.score}</p>
                    <p>Percentile: {results.memory.percentile}°</p>
                    <p>Valutazione: {results.memory.evaluation}</p>
                  </div>
                )}

                {results.schulte && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold">Tabella di Schulte</h3>
                    </div>
                    <p>Punteggio: {results.schulte.score}</p>
                    <p>Tempo Medio: {results.schulte.averageTime}s</p>
                    <p>Percentile: {results.schulte.percentile}°</p>
                  </div>
                )}

                {results.rhythm && (
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-5 h-5 text-pink-600" />
                      <h3 className="font-semibold">Test del Ritmo</h3>
                    </div>
                    <p>Precisione: {results.rhythm.precision}%</p>
                    <p>Livello Raggiunto: {results.rhythm.level}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 
                  transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                Vai alla Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      {/* Barra di progressione */}
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

      {/* Contenuto principale */}
      <div className="mt-16">
        {renderCurrentPhase()}
      </div>

      {/* Pulsante di navigazione (visibile solo durante i test) */}
      {phase !== "registration" && phase !== "results" && (
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
      )}
    </div>
  );
}
