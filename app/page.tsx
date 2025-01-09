// app/page.tsx
'use client';

import { Brain, Grid, Eye, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Test IQ Italia</span>
            </div>
            
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <a 
                href="/"
                className="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center"
              >
                <Brain className="w-5 h-5 mr-2" />
                Home
              </a>
              <a 
                href="/tests"
                className="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center"
              >
                <Grid className="w-5 h-5 mr-2" />
                Test Disponibili
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Sezione Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-2xl p-8 text-center text-white mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">Test del QI Professionale</h1>
            <p className="text-xl sm:text-2xl mb-8 font-light">
              Scopri il tuo potenziale intellettivo con test scientificamente validati
            </p>
            <a
              href="/register"
              className="inline-block bg-white text-blue-600 font-bold text-lg px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Inizia il Test
            </a>
          </div>

          {/* Card dei Test */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-4">
                <Brain className="w-10 h-10 text-blue-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Ragionamento</h2>
              </div>
              <p className="text-gray-600 text-lg">
                Valuta la tua capacità di risolvere problemi complessi e ragionamento astratto
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-4">
                <Eye className="w-10 h-10 text-green-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Percezione</h2>
              </div>
              <p className="text-gray-600 text-lg">
                Misura la tua velocità di elaborazione visiva e attenzione ai dettagli
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-4">
                <Star className="w-10 h-10 text-purple-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Memoria</h2>
              </div>
              <p className="text-gray-600 text-lg">
                Verifica le tue capacità di memoria a breve termine e working memory
              </p>
            </div>
          </div>

          {/* Sezione Vantaggi */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">Perché Scegliere il Nostro Test?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-4">Professionale</h3>
                <p className="text-gray-600">
                  Test sviluppato da esperti psicometrici
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-xl font-semibold mb-4">Accurato</h3>
                <p className="text-gray-600">
                  Risultati precisi e scientificamente validati
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold mb-4">Completo</h3>
                <p className="text-gray-600">
                  Valutazione dettagliata di multiple capacità cognitive
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
