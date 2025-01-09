// app/page.tsx
'use client';

import { Brain, Eye, Star, User, Book, Music, Clock, Target, Award } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section with Test Preview */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 text-white mb-12">
            <div className="flex flex-col lg:flex-row items-center">
              {/* Text Content */}
              <div className="lg:w-1/2 text-center lg:text-left mb-6 lg:mb-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Test del QI</h1>
                <p className="text-base sm:text-lg mb-4 font-light">
                  Scopri il tuo potenziale intellettivo
                </p>
                <a
                  href="/test-iq"
                  className="inline-block bg-white text-blue-600 font-bold text-base sm:text-lg px-6 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  Inizia il Test
                </a>

                {/* Test Duration and Info - Moved here for better mobile visibility */}
                <div className="mt-4 border-t border-white/20 pt-4">
                  <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Durata: 45 minuti</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Target className="w-4 h-4 mr-2" />
                      <span>7 Test Completi</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Risultati Immediati</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Preview Grid - Adjusted for mobile */}
              <div className="lg:w-1/2 grid grid-cols-2 gap-2 sm:gap-3 mt-6 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg hover:bg-white/20 transition-all">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-white" />
                  <h3 className="font-semibold text-xs sm:text-sm">Ragionamento Astratto</h3>
                  <p className="text-xs text-white/80">Test delle matrici progressive</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg hover:bg-white/20 transition-all">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-white" />
                  <h3 className="font-semibold text-xs sm:text-sm">Coordinazione</h3>
                  <p className="text-xs text-white/80">Test occhio-mano</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg hover:bg-white/20 transition-all">
                  <Book className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-white" />
                  <h3 className="font-semibold text-xs sm:text-sm">Lettura Veloce</h3>
                  <p className="text-xs text-white/80">Test di comprensione</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg hover:bg-white/20 transition-all">
                  <Music className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-white" />
                  <h3 className="font-semibold text-xs sm:text-sm">Senso del Ritmo</h3>
                  <p className="text-xs text-white/80">Test di sincronizzazione</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-3">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                <h2 className="text-xl sm:text-2xl font-bold ml-2">Test di Ragionamento</h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Valuta la tua capacità di risolvere problemi complessi
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-3">
                <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                <h2 className="text-xl sm:text-2xl font-bold ml-2">Test di Percezione</h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Misura la tua velocità di elaborazione visiva
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="flex items-center mb-3">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                <h2 className="text-xl sm:text-2xl font-bold ml-2">Test di Memoria</h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Verifica le tue capacità di memoria e concentrazione
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 text-center">Perché Scegliere il Nostro Test?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Professionale</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Sviluppato da esperti del settore
                </p>
              </div>
              <div className="bg-green-50 p-4 sm:p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Accurato</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Risultati dettagliati e precisi
                </p>
              </div>
              <div className="bg-purple-50 p-4 sm:p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Completo</h3>
                <p className="text-gray-600 text-sm sm:text-base">
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
