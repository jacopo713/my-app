'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Activity, Star } from 'lucide-react'; // Importa anche una nuova icona per il bottone Allenamenti
import TestProgressChart from '@/app/dashboard/TestProgressChart';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests, getAllUsers } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { signOut } from 'firebase/auth'; // Importa la funzione di logout
import { auth } from '@/app/lib/firebase'; // Importa l'oggetto auth di Firebase
import { useRouter } from 'next/navigation'; // Importa il router per il reindirizzamento

// 1. Definizione dei tipi
type TestType = 'raven' | 'eyehand' | 'stroop' | 'speedreading' | 'memory' | 'schulte' | 'rhythm';

interface TestResult {
  type: TestType;
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

interface RankingData {
  userId: string;
  username: string;
  totalScore: number;
  rank: number;
  level: number;
  testScores: {
    [key in TestType]?: number;
  };
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TestResult[];
}

// 2. Componente di supporto: Modal per i dettagli dei test
const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <TestProgressChart data={data} />
      </div>
    </div>
  );
};

// 3. Componente Classifica
const GlobalRanking: React.FC = () => {
  const { user } = useAuth(); // Ottieni l'utente corrente
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [userRanking, setUserRanking] = useState<RankingData | null>(null); // Posizione dell'utente corrente
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const users = await getAllUsers();

        // Usa Promise.all per parallelizzare il recupero dei test
        const rankingPromises = users.map(async (user) => {
          const testResults = await getAllUserTests(user.uid);
          const testScores: { [key in TestType]?: number } = {};

          let totalScore = 0;
          let testCount = 0;

          testResults.forEach((test) => {
            const type = test.type as TestType;
            const score = test.score || 0; // Usa il campo score normalizzato
            testScores[type] = score;
            totalScore += score;
            testCount += 1;
          });

          // Calcola la media dei punteggi
          const averageScore = testCount > 0 ? totalScore / testCount : 0;

          return {
            userId: user.uid,
            username: user.displayName || 'Anonymous',
            totalScore: Math.round(averageScore), // Usa la media arrotondata
            rank: 0, // Sarà calcolato dopo
            level: 1, // Puoi calcolare il livello in base al punteggio totale
            testScores,
          };
        });

        // Esegui tutte le promesse in parallelo
        const ranking = await Promise.all(rankingPromises);

        // Ordina gli utenti in base al punteggio totale (media)
        ranking.sort((a, b) => b.totalScore - a.totalScore);

        // Assegna il rank
        ranking.forEach((user, index) => {
          user.rank = index + 1;
        });

        // Trova la posizione dell'utente corrente
        if (user) {
          const currentUserRanking = ranking.find((u) => u.userId === user.uid);
          if (currentUserRanking) {
            setUserRanking(currentUserRanking);
          }
        }

        // Mostra solo i primi 3 utenti
        setRankingData(ranking.slice(0, 3));
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Classifica Globale
        </h2>
        <div className="text-lg text-gray-600">Caricamento classifica...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Classifica Globale
      </h2>
      
      <div className="space-y-4">
        {/* Mostra i primi 3 utenti */}
        {rankingData.map((user) => (
          <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
                ${user.rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                  user.rank === 2 ? 'bg-gray-100 text-gray-600' :
                  user.rank === 3 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'}`}>
                {user.rank}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user.username}</div>
                <div className="text-sm text-gray-500">Livello {user.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{user.totalScore}</div>
              <div className="text-sm text-gray-500">punti medi</div>
            </div>
          </div>
        ))}

        {/* Mostra la posizione dell'utente corrente se non è tra i primi 3 */}
        {userRanking && userRanking.rank > 3 && (
          <>
            <div className="text-center text-gray-500 my-4">...</div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg bg-blue-100 text-blue-600">
                  {userRanking.rank}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userRanking.username}</div>
                  <div className="text-sm text-gray-500">Livello {userRanking.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{userRanking.totalScore}</div>
                <div className="text-sm text-gray-500">punti medi</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 4. Componente per la sezione "Valutazione"
// Questa sezione può essere personalizzata in base alle esigenze del tuo progetto.
// Per ora viene fornito un esempio con un contenuto placeholder.
const EvaluationSection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Star className="w-6 h-6 text-green-500" />
        Valutazione
      </h2>
      <p className="text-gray-700">
        Qui puoi visualizzare la tua valutazione complessiva in base ai test effettuati e agli allenamenti eseguiti. 
        In futuro, potresti integrare un sistema di feedback personalizzato o suggerimenti per migliorare le performance cognitive.
      </p>
    </div>
  );
};

// 5. Componente principale della Dashboard
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Inizializza il router

  // Funzione per gestire il logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Effettua il logout
      router.push('/login'); // Reindirizza alla pagina di login
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  // Funzione per gestire l'accesso alla pagina degli allenamenti cognitivi
  const handleCognitiveTraining = () => {
    // Per esempio, reindirizza alla pagina degli allenamenti oppure mostra un modal specifico
    router.push('/allenamenti-cognitivi');
  };

  useEffect(() => {
    const fetchTestResults = async () => {
      if (user) {
        try {
          const results = await getAllUserTests(user.uid);
          const typedResults: TestResult[] = results.map(result => ({
            ...result,
            type: (result.type || result.id.replace('Test', '').toLowerCase()) as TestType
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Caricamento risultati...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Ciao, {user?.displayName || 'User'}!
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowResults(true)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <Brain className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Vedi i tuoi livelli cognitivi</span>
              </button>
              <button 
                onClick={handleCognitiveTraining}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Allenamenti Cognitivi</span>
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 shadow-sm transition-colors"
              >
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          <GlobalRanking />

          {/* Sezione di valutazione */}
          <EvaluationSection />

          <StatsModal 
            isOpen={showResults}
            onClose={() => setShowResults(false)}
            data={testResults}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;

