'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Eye,
  User,
  Book,
  Music,
  Clock,
  Target,
  Award,
  BarChart,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from 'recharts';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleStartTest = () => {
    router.push('/tests');
  };

  // Dati per i grafici
  const dataRadar = [
    { subject: 'Ragionamento', A: 85, fullMark: 100 },
    { subject: 'Coordinazione', A: 78, fullMark: 100 },
    { subject: 'Attenzione', A: 82, fullMark: 100 },
    { subject: 'Lettura', A: 75, fullMark: 100 },
    { subject: 'Ritmo', A: 70, fullMark: 100 },
    { subject: 'Memoria', A: 80, fullMark: 100 },
    { subject: 'Inibizione', A: 76, fullMark: 100 },
  ];

  const performanceData = [
    { name: 'Gen', score: 75 },
    { name: 'Feb', score: 78 },
    { name: 'Mar', score: 82 },
    { name: 'Apr', score: 85 },
    { name: 'Mag', score: 88 },
    { name: 'Giu', score: 92 },
  ];

  const barData = [
    { name: 'Rag.', value: 85, color: '#3B82F6' },
    { name: 'Coord.', value: 78, color: '#10B981' },
    { name: 'Att.', value: 82, color: '#6366F1' },
    { name: 'Lett.', value: 75, color: '#EC4899' },
    { name: 'Ritmo', value: 70, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Turing™
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <a href="/tests" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Test IQ
                </a>
                <a href="/about" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Chi Siamo
                </a>
                <a href="/contact" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Contatti
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a href="/login" className="hidden md:flex items-center space-x-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-all duration-200">
                <User size={18} />
                <span>Accedi</span>
              </a>
              <a href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-full transition-all duration-200 font-semibold shadow-sm hover:shadow-lg">
                Inizia Ora
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* HERO SECTION */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-xl shadow-2xl p-8 text-white mb-12">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 text-center lg:text-left mb-6 lg:mb-0">
                <h1 className="text-4xl font-bold mb-4">Test del QI</h1>
                <p className="text-lg mb-4 font-light">
                  Scopri il tuo potenziale intellettivo
                </p>
                <p className="text-lg mb-4 italic font-light text-white/90">
                  &quot;Offriamo servizi di allenamento cognitivo avanzati per spingere il vostro successo personale.&quot;
                </p>
                <button
                  onClick={handleStartTest}
                  className="inline-block bg-white text-blue-600 font-bold text-lg px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  Inizia il Test
                </button>

                <div className="mt-4 border-t border-white/20 pt-4">
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Durata: 20 minuti</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      <span>7 Test Completi</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Risultati Immediati</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 grid grid-cols-2 gap-3 sm:gap-4 mt-6 lg:mt-0">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/30 backdrop-blur-sm p-4 rounded-lg hover:from-blue-600/30 hover:to-blue-800/40 transition-all">
                  <Brain className="w-8 h-8 mb-2 text-blue-400" />
                  <h3 className="font-semibold text-sm">Ragionamento Astratto</h3>
                  <p className="text-xs text-white/90">Test delle matrici progressive</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/30 backdrop-blur-sm p-4 rounded-lg hover:from-purple-600/30 hover:to-purple-800/40 transition-all">
                  <Eye className="w-8 h-8 mb-2 text-purple-400" />
                  <h3 className="font-semibold text-sm">Coordinazione</h3>
                  <p className="text-xs text-white/90">Test occhio-mano</p>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/30 backdrop-blur-sm p-4 rounded-lg hover:from-emerald-600/30 hover:to-emerald-800/40 transition-all">
                  <Book className="w-8 h-8 mb-2 text-emerald-400" />
                  <h3 className="font-semibold text-sm">Lettura Veloce</h3>
                  <p className="text-xs text-white/90">Test di comprensione</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/30 backdrop-blur-sm p-4 rounded-lg hover:from-amber-600/30 hover:to-amber-800/40 transition-all">
                  <Music className="w-8 h-8 mb-2 text-amber-400" />
                  <h3 className="font-semibold text-sm">Senso del Ritmo</h3>
                  <p className="text-xs text-white/90">Test di sincronizzazione</p>
                </div>
              </div>
            </div>
          </div>

          {/* PERCHÉ SCEGLIERE IL NOSTRO TEST? */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
              Perché Scegliere il Nostro Test?
            </h2>
          </div>

          {/* TEST CARDS ESISTENTI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Brain className="w-10 h-10 text-blue-500" />
                <h2 className="text-2xl font-bold ml-3">Standard Avanzati</h2>
              </div>
              <p className="text-gray-600 text-base">
                Test sviluppati con tecnologie moderne e intelligenza artificiale
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <BarChart className="w-10 h-10 text-green-500" />
                <h2 className="text-2xl font-bold ml-3">Analisi Dettagliata</h2>
              </div>
              <p className="text-gray-600 text-base">
                Report completo dei risultati con suggerimenti personalizzati
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Target className="w-10 h-10 text-purple-500" />
                <h2 className="text-2xl font-bold ml-3">Valutazione Completa</h2>
              </div>
              <p className="text-gray-600 text-base">
                Test che coprono diverse aree cognitive
              </p>
            </div>
          </div>

          {/* DASHBOARD ANALISI COGNITIVE */}
          <div className="w-full bg-white p-6 rounded-xl shadow-lg mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Dashboard Analisi Cognitive</h2>
              <p className="text-gray-600">Andamento mensile delle performance cognitive</p>
              <span className="text-sm text-gray-500">Dati simulati a scopo illustrativo</span>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-gray-600 text-sm">Media Mensile</p>
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                  <p className="text-green-600 text-sm">↑ 5.2%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-gray-600 text-sm">Precisione</p>
                  <p className="text-2xl font-bold text-purple-600">92%</p>
                  <p className="text-green-600 text-sm">↑ 3.1%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-gray-600 text-sm">Velocità</p>
                  <p className="text-2xl font-bold text-green-600">78%</p>
                  <p className="text-red-600 text-sm">↓ 1.3%</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-gray-600 text-sm">Progresso</p>
                  <p className="text-2xl font-bold text-amber-600">+17%</p>
                  <p className="text-green-600 text-sm">6 mesi</p>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="col-span-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Profilo Cognitivo</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={dataRadar}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="subject" stroke="#6B7280" />
                      <PolarRadiusAxis stroke="#9CA3AF" />
                      <Radar
                        name="Abilità"
                        dataKey="A"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div className="col-span-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Trend Mensile</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                        itemStyle={{ color: '#374151' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#10B981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="col-span-12 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance per Area</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                        itemStyle={{ color: '#374151' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER WITH LEGAL LINKS */}
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-600 text-sm">
                  &copy; {new Date().getFullYear()} Turing™. Tutti i diritti riservati.
                </div>
                <div className="flex space-x-4">
                  <a href="/terms" className="text-gray-600 hover:text-blue-600 text-sm">
                    Termini e Condizioni
                  </a>
                  <a href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm">
                    Privacy Policy
                  </a>
                  <a href="/cookies" className="text-gray-600 hover:text-blue-600 text-sm">
                    Cookie Policy
                  </a>
                  <a href="/refunds" className="text-gray-600 hover:text-blue-600 text-sm">
                    Politica di Rimborso
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
