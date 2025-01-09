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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section with Test Preview */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-2xl p-6 md:p-8 text-white mb-16">
            <div className="flex flex-col lg:flex-row items-center">
              {/* Text Content */}
              <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Test del QI</h1>
                <p className="text-lg sm:text-xl mb-6 font-light">
                  Scopri il tuo potenziale intellettivo
                </p>
                <a
                  href="/test-iq"
                  className="inline-block bg-white text-blue-600 font-bold text-lg px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  Inizia il Test
                </a>

                {/* Test Duration and Info - Moved here for better mobile visibility */}
                <div className="mt-6 border-t border-white/20 pt-6">
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm">
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
              <div className="lg:w-1/2 grid grid-cols-2 gap-3 sm:gap-4 mt-8 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg hover:bg-white/20 transition-all">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-white" />
                  <h3 className="font-semibold text-sm sm:text-base">Ragionamento Astratto</h3>
                  <p className="text-xs sm:text-sm text-white/80">Test delle matrici progressive</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg hover:bg-white/20 transition-all">
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-white" />
                  <h3 className="font-semibold text-sm sm:text-base">Coordinazione</h3>
                  <p className="text-xs sm:text-sm text-white/80">Test occhio-mano</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg hover:bg-white/20 transition-all">
                  <Book className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-white" />
                  <h3 className="font-semibold text-sm sm:text-base">Lettura Veloce</h3>
                  <p className="text-xs sm:text-sm text-white/80">Test di comprensione</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg hover:bg-white/20 transition-all">
                  <Music className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-white" />
                  <h3 className="font-semibold text-sm sm:text-base">Senso del Ritmo</h3>
                  <p className="text-xs sm:text-sm text-white/80">Test di sincronizzazione</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the content remains the same ... */}
        </div>
      </main>
    </div>
  );
}
