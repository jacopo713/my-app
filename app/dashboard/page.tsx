// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { Brain, Eye, BarChart3, Download, Share2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

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
  completedAt?: string;
  overallScore?: number;
}

interface UserData {
  testResults: TestResults;
  subscriptionStatus: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'compare'>('overview');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const calculateOverallPercentile = () => {
    if (!userData?.testResults) return 0;
    const percentiles = [
      userData.testResults.raven?.percentile,
      userData.testResults.stroop?.percentile,
      userData.testResults.speedReading?.percentile,
      userData.testResults.memory?.percentile,
      userData.testResults.schulte?.percentile
    ].filter(Boolean) as number[];

    return Math.round(percentiles.reduce((a, b) => a + b, 0) / percentiles.length);
  };

  const generateRadarData = () => {
    if (!userData?.testResults) return [];

    return [
      {
        category: "Ragionamento",
        value: userData.testResults.raven?.score || 0,
      },
      {
        category: "Coordinazione",
        value: userData.testResults.eyeHand?.score || 0,
      },
      {
        category: "Attenzione",
        value: userData.testResults.stroop?.score || 0,
      },
      {
        category: "Lettura",
        value: userData.testResults.speedReading?.wpm || 0,
      },
      {
        category: "Memoria",
        value: userData.testResults.memory?.score || 0,
      },
      {
        category: "Ritmo",
        value: userData.testResults.rhythm?.precision || 0,
      },
    ];
  };

  // Versione temporanea della funzione handleDownloadPDF
  const handleDownloadPDF = async () => {
    console.log('PDF download not implemented yet');
    // Mostra un messaggio all'utente
    alert('La funzionalità di download PDF sarà disponibile a breve');
  };

  const handleShareResults = async () => {
    try {
      const shareData = {
        title: 'I miei risultati del test del QI',
        text: `Ho ottenuto un punteggio complessivo di ${userData?.testResults.overallScore} nel test del QI!`,
        url: `${window.location.origin}/results/${user?.uid}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback per browser che non supportano Web Share API
        await navigator.clipboard.writeText(
          `${shareData.text}\nVisita: ${shareData.url}`
        );
        alert('Link copiato negli appunti!');
      }
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Caricamento dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Test del QI
            </h1>
            <p className="mt-2 text-gray-600">
              {userData?.displayName ? `Benvenuto, ${userData.displayName}` : 'Benvenuto'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Scarica Report PDF
            </button>
            <button
              onClick={handleShareResults}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Condividi Risultati
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Panoramica
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-1 ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Dettagli Test
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`pb-2 px-1 ${
                activeTab === 'compare'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Confronto
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Score Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Punteggio Complessivo
                  </h3>
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-blue-600">
                    {userData?.testResults.overallScore || 0}
                  </span>
                  <span className="ml-2 text-gray-500">/ 1000</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Percentile: {calculateOverallPercentile()}°
                </p>
              </div>

              {/* Radar Chart */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profilo delle Competenze
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={generateRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Punteggio"
                        dataKey="value"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Raven Test Results */}
              {userData?.testResults.raven && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      Test delle Matrici Progressive
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Punteggio:</span>
                      <span className="font-medium">{userData.testResults.raven.score}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Accuratezza:</span>
                      <span className="font-medium">{userData.testResults.raven.accuracy}%</span>
                    </p>
                    {userData.testResults.raven.percentile && (
                      <p className="flex justify-between">
                        <span className="text-gray-600">Percentile:</span>
                        <span className="font-medium">{userData.testResults.raven.percentile}°</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Eye-Hand Coordination Results */}
              {userData?.testResults.eyeHand && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Test di Coordinazione
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Punteggio:</span>
                      <span className="font-medium">{userData.testResults.eyeHand.score}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Precisione:</span>
                      <span className="font-medium">{userData.testResults.eyeHand.accuracy}%</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Deviazione Media:</span>
                      <span className="font-medium">{userData.testResults.eyeHand.averageDeviation}ms</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Other test results cards... */}
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confronto con Altri Utenti
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { category: 'Ragionamento', you: userData?.testResults.raven?.score || 0, average: 500 },
                      { category: 'Coordinazione', you: userData?.testResults.eyeHand?.score || 0, average: 500 },
                      { category: 'Attenzione', you: userData?.testResults.stroop?.score || 0, average: 500 },
                      { category: 'Lettura', you: userData?.testResults.speedReading?.wpm || 0, average: 500 },
                      { category: 'Memoria', you: userData?.testResults.memory?.score || 0, average: 500 },
                      { category: 'Ritmo', you: userData?.testResults.rhythm?.precision || 0, average: 500 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="you"
                      name="Il tuo punteggio"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      name="Media utenti"
                      stroke="#9ca3af"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Il grafico mostra il confronto tra i tuoi punteggi e la media degli altri utenti.
              </p>
            </div>
          )}

          {/* Test Date and Info */}
          {userData?.testResults.completedAt && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Test completato il: {new Date(userData.testResults.completedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
