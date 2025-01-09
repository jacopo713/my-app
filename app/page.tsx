// app/page.tsx
'use client';

import { Brain, Eye, Star, User } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-800">Turing™</span>
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
              <a
                href="/login"
                className="hidden md:flex items-center space-x-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-all duration-200"
              >
                <User size={18} />
                <span>Accedi</span>
              </a>
              <a
                href="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full transition-all duration-200"
              >
                Inizia Ora
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-2xl p-8 text-center text-white mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">Test del QI</h1>
            <p className="text-xl sm:text-2xl mb-8 font-light">
              Scopri il tuo potenziale intellettivo
            </p>
            <a
              href="/register"
              className="inline-block bg-white text-blue-600 font-bold text-lg px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Inizia il Test
            </a>
          </div>

          {/* Test Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-4">
                <Brain className="w-10 h-10 text-blue-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Ragionamento</h2>
              </div>
              <p className="text-gray-600 text-lg">
                Valuta la tua capacità di risolvere problemi complessi
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-4">
                <Eye className="w-10 h-10 text-green-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Percezione</h2>
              </div>
              <p className="text-gray-600 text-lg">
                Misura la tua velocità di elaborazione visiva
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-4">
                <Star className="w-10 h-10 text-purple-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Memoria</h2>
              </div>
              <p className="text-gray-600 text-lg">
                Verifica le tue capacità di memoria e concentrazione
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">Perché Scegliere il Nostro Test?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-4">Professionale</h3>
                <p className="text-gray-600">
                  Sviluppato da esperti del settore
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-xl font-semibold mb-4">Accurato</h3>
                <p className="text-gray-600">
                  Risultati dettagliati e precisi
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold mb-4">Completo</h3>
                <p className="text-gray-600">
                  Valutazione di molteplici capacità
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
