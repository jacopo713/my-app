'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Eye, ActivitySquare, BookOpen, Clock, Lightbulb, Music, ChevronDown, ArrowRight, FastForward } from 'lucide-react';
import { 
  RavenTest, 
  EyeHandTest, 
  StroopTest, 
  SpeedReadingTrainer, 
  ShortTermMemoryTest, 
  SchulteTable, 
  RhythmTest 
} from './components';
import { type TestPhase } from './TestInstructions';
import { TestInstructionsComponent } from './TestInstructions';
import { saveTestResults } from '@/app/lib/firebase';
import { useAuth } from '@/app/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import TestResults from './components/TestResults'; // Importa il nuovo componente

// Stile personalizzato per rendere la freccia più spessa
const customChevronStyle = {
  strokeWidth: 5,
};

// Definizione del tipo per i risultati dei test
type TestResult = 
  | { score: number; accuracy: number; type?: string } // Raven
  | { score: number; accuracy: number; averageDeviation: number; type?: string } // EyeHand
  | { score: number; percentile: number; interferenceScore: number; type?: string } // Stroop
  | { wpm: number; percentile: number; type?: string } // SpeedReading
  | { score: number; percentile: number; evaluation: string; type?: string } // Memory
  | { score: number; averageTime: number; gridSizes: number[]; completionTimes: number[]; percentile: number; type?: string } // Schulte
  | { precision: number; level: number; type?: string }; // Rhythm

interface TestResults {
  raven: {
    score: number;
    accuracy: number;
    percentile?: number;
    type?: string;
  } | null;
  eyeHand: {
    score: number;
    accuracy: number;
    averageDeviation: number;
    type?: string;
  } | null;
  stroop: {
    score: number;
    percentile: number;
    interferenceScore: number;
    type?: string;
  } | null;
  speedReading: {
    wpm: number;
    percentile: number;
    type?: string;
  } | null;
  memory: {
    score: number;
    percentile: number;
    evaluation: string;
    type?: string;
  } | null;
  schulte: {
    score: number;
    averageTime: number;
    gridSizes: number[];
    completionTimes: number[];
    percentile: number;
    type?: string;
  } | null;
  rhythm: {
    precision: number;
    level: number;
    type?: string;
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
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [isGuest, setIsGuest] = useState(false); // Stato per gestire gli utenti guest
  const router = useRouter();
  const { user } = useAuth();

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

  // Funzione per verificare lo stato dell'abbonamento
  const checkSubscriptionStatus = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData?.subscriptionStatus === 'active';
      }
    }
    return false;
  };

  // Funzione per gestire il completamento di un test
  const handleTestCompletion = async (testResults: TestResult, testType: string) => {
    const normalizedType = testType.toLowerCase(); // Normalizza il type in minuscolo
    const updatedResults = {
      ...testResults,
      type: normalizedType, // Usa il type normalizzato
    };

    // Aggiorna lo stato locale
    setResults(prev => ({
      ...prev,
      [normalizedType]: updatedResults
    }));

    // Salva sempre i risultati nel localStorage
    const guestResults = JSON.parse(localStorage.getItem('guestTestResults') || '{}');
    guestResults[normalizedType] = updatedResults; // Usa il type normalizzato
    localStorage.setItem('guestTestResults', JSON.stringify(guestResults));

    if (user) {
      // Se l'utente è registrato, salva i risultati anche nel database Firestore
      await saveTestResults(user.uid, `${normalizedType}Test`, updatedResults); // Usa il type normalizzato
    } else {
      // Per un utente guest, non effettuo un redirect immediato, salvo solo nel localStorage
      setIsGuest(true);
    }

    // Se l'utente è registrato, verifico lo stato dell'abbonamento
    if (user) {
      const isSubscribed = await checkSubscriptionStatus();
      if (!isSubscribed) {
        router.push('/payment');
        return;
      }
    }

    // Passa alla fase successiva (o alla fase "results", se si è concluso il flusso)
    const currentIndex = phases.indexOf(phase);
    if (currentIndex < phases.length - 1) {
      setPhase(phases[currentIndex + 1]);
      setProgress(Math.min((currentIndex + 1) * 15, 100));
    } else {
      // Se il test corrente è l'ultimo, passa direttamente alla fase "results"
      setPhase("results");
      setProgress(100); // Imposta il progresso al 100%
    }
  };

  // Gestione del reindirizzamento post-registrazione se l'utente era guest
  useEffect(() => {
    if (user && isGuest) {
      router.push('/tests/results');
      setIsGuest(false);
    }
  }, [user, isGuest, router]);

  // Funzione per passare velocemente alla fase successiva
  const handleFastForward = () => {
    const currentIndex = phases.indexOf(phase);
    if (currentIndex < phases.length - 1) {
      setPhase(phases[currentIndex + 1]);
      setProgress(Math.min((currentIndex + 1) * 15, 100));
    } else {
      setPhase("results");
      setProgress(100);
    }
  };

  const handleRavenComplete = async (ravenResults: { score: number; accuracy: number }) => {
    await handleTestCompletion(ravenResults, 'raven');
  };

  const handleEyeHandComplete = async (eyeHandResults: { score: number; accuracy: number; averageDeviation: number }) => {
    await handleTestCompletion(eyeHandResults, 'eyeHand');
  };

  const handleStroopComplete = async (stroopResults: { score: number; percentile: number; interferenceScore: number }) => {
    await handleTestCompletion(stroopResults, 'stroop');
  };

  const handleSpeedReadingComplete = async (speedReadingResults: { wpm: number; percentile: number }) => {
    await handleTestCompletion(speedReadingResults, 'speedReading');
  };

  const handleMemoryComplete = async (memoryResults: { score: number; percentile: number; evaluation: string }) => {
    await handleTestCompletion(memoryResults, 'memory');
  };

  const handleSchulteComplete = async (schulteResults: { score: number; averageTime: number; gridSizes: number[]; completionTimes: number[]; percentile: number }) => {
    await handleTestCompletion(schulteResults, 'schulte');
  };

  const handleRhythmComplete = async (rhythmResults: { precision: number; level: number }) => {
    await handleTestCompletion(rhythmResults, 'rhythm');
  };

  const renderCurrentPhase = () => {
    const renderTest = () => {
      switch (phase) {
        case "intro":
          return (
            <div className="max-w-4xl mx-auto px-4" id="scroll-container">
              {/* Header fisso */}
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
                    <span>Durata stimata: 20 minuti • 7 test specializzati</span>
                  </div>
                </div>
              </div>

              {/* Contenuto della pagina */}
              <div className="bg-white shadow-xl rounded-b-2xl p-6">
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

              {/* Indicatore di scorrimento (scritta, lineetta e freccia) */}
              {showScrollIndicator && (
                <div className="fixed bottom-20 left-0 right-0 w-full flex justify-center items-center flex-col gap-2 animate-bounce">
                  <span className="text-sm text-gray-700 font-medium">Scroll down</span>
                  <div className="w-16 h-0.5 bg-white"></div>
                  <ChevronDown className="w-8 h-8 text-blue-600" style={customChevronStyle} />
                </div>
              )}
            </div>
          );
        case "raven":
          return !testStarted ? (
            <TestInstructionsComponent phase={phase} />
          ) : (
            <RavenTest onComplete={handleRavenComplete} />
          );
        case "eyehand":
          return !testStarted ? (
            <TestInstructionsComponent phase={phase} />
          ) : (
            <EyeHandTest onComplete={handleEyeHandComplete} />
          );
        case "stroop":
          return !testStarted ? (
            <TestInstructionsComponent phase={phase} />
          ) : (
            <StroopTest onComplete={handleStroopComplete} />
          );
        case "speedreading":
          return !testStarted ? (
            <TestInstructionsComponent phase={phase} />
          ) : (
            <SpeedReadingTrainer onComplete={handleSpeedReadingComplete} />
          );
        case "memory":
          return !testStarted ? (
            <TestInstructionsComponent phase={phase} />
          ) : (
            <ShortTermMemoryTest onComplete={handleMemoryComplete} />
          );
        case "schulte":
          return !testStarted ? (
            <TestInstructionsComponent phase={phase} />
          ) : (
            <SchulteTable onComplete={handleSchulteComplete} />
          );
        case "rhythm":
          return !testStarted ? (
            <TestInstructionsComponent phase={phase} />
          ) : (
            <RhythmTest onComplete={handleRhythmComplete} />
          );
        case "results":
          return <TestResults results={results} />; // Usa il nuovo componente
        default:
          return null;
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 overflow-y-auto">
        {(!testStarted && phase !== "intro" && phase !== "results") && (
          <TestInstructionsComponent phase={phase} />
        )}
        {(testStarted || phase === "intro" || phase === "results") && renderTest()}
      </div>
    );
  };

  return (
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

      {/* Contenuto principale con margine superiore e inferiore */}
      <div className="mt-16 mb-20">
        {renderCurrentPhase()}
      </div>

      {/* Pulsante fisso in basso per avviare il test */}
      {!testStarted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg z-20">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                if (phase === "intro") {
                  // Se siamo nella fase di introduzione, passa alla fase successiva (raven)
                  setPhase("raven");
                  setProgress(15); // Imposta il progresso al 15%
                } else if (!testStarted) {
                  // Se il test non è ancora iniziato, avvia il test corrente
                  setTestStarted(true);
                }
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl 
                font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-px
                flex items-center justify-center gap-2"
            >
              <span className="text-lg">Inizia il Test</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Pulsante per passare velocemente alla fase successiva */}
      <button
        onClick={handleFastForward}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
      >
        <FastForward className="w-6 h-6" />
      </button>

      {/* Messaggio di iscrizione (se necessario) */}
      {showSubscriptionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Iscriviti per continuare</h2>
            <p className="text-gray-600 mb-6">
              Per accedere ai risultati completi dei test e alle funzionalità premium, iscriviti ora.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Iscriviti ora
            </button>
            <button
              onClick={() => setShowSubscriptionPrompt(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-800"
            >
              Continua senza iscrizione
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
