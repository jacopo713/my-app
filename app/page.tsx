// app/page.tsx
'use client';

import { 
  Brain, Eye, Star, User, Book, Music, Clock, Target, Award 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">

      {/* // ---------------------
          // NAVBAR
          // --------------------- */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Links di navigazione */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Turing™
                </span>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <a 
                  href="/tests" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Test IQ
                </a>
                <a 
                  href="/about" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Chi Siamo
                </a>
                <a 
                  href="/contact" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contatti
                </a>
              </div>
            </div>

            {/* Pulsanti 'Accedi' e 'Inizia Ora' */}
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="hidden md:flex items-center space-x-2 bg-white border border-blue-600 text-blue-600 
                           hover:bg-blue-50 px-4 py-2 rounded-full transition-all duration-200"
              >
                <User size={18} />
                <span>Accedi</span>
              </a>
              <a
                href="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-full 
                           transition-all duration-200 font-semibold shadow-sm hover:shadow-lg"
              >
                Inizia Ora
              </a>
            </div>

          </div>
        </div>
      </nav>

      {/* // ---------------------
          // MAIN
          // --------------------- */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* // ---------------------
              // HERO SECTION
              // --------------------- */}
          <div 
            className="relative rounded-xl shadow-2xl mb-12 overflow-hidden 
                       bg-center bg-cover bg-no-repeat p-4 sm:p-6 md:p-8 text-white"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1614289078003-fb2ad21bcf8f?auto=format&fit=crop&w=1300&q=80')" 
            }}
          >
            {/* Overlay per scurire leggermente l’immagine e far risaltare il testo */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center">
              
              {/* Testo principale del Hero */}
              <div className="lg:w-1/2 text-center lg:text-left mb-6 lg:mb-0">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                  Test del QI Avanzato
                </h1>
                <p className="text-base sm:text-lg mb-4 font-light max-w-lg mx-auto lg:mx-0">
                  Scopri il tuo potenziale intellettivo con un esame completo
                </p>
                <a
                  href="/test-iq"
                  className="inline-block bg-white text-blue-600 font-bold text-lg sm:text-xl px-8 py-3 rounded-xl 
                             hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  Inizia il Test
                </a>

                {/* Info veloci: durata, test completi, risultati */}
                <div className="mt-4 border-t border-white/20 pt-4">
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Durata: ~20 minuti</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Target className="w-4 h-4 mr-2" />
                      <span>Test Completi</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Report Immediato</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anteprima del contenuto test */}
              <div className="lg:w-1/2 grid grid-cols-2 gap-3 sm:gap-4 mt-6 lg:mt-0">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover:bg-white/30 transition-all">
                  <Brain className="w-8 h-8 mb-2 text-blue-300" />
                  <h3 className="font-semibold text-sm">
                    Ragionamento Astratto
                  </h3>
                  <p className="text-xs text-white/80">Matrici progressive</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover:bg-white/30 transition-all">
                  <Eye className="w-8 h-8 mb-2 text-green-300" />
                  <h3 className="font-semibold text-sm">
                    Coordinazione
                  </h3>
                  <p className="text-xs text-white/80">Occhio-mano</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover:bg-white/30 transition-all">
                  <Book className="w-8 h-8 mb-2 text-purple-300" />
                  <h3 className="font-semibold text-sm">
                    Lettura Veloce
                  </h3>
                  <p className="text-xs text-white/80">Comprensione testuale</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover:bg-white/30 transition-all">
                  <Music className="w-8 h-8 mb-2 text-yellow-300" />
                  <h3 className="font-semibold text-sm">
                    Senso del Ritmo
                  </h3>
                  <p className="text-xs text-white/80">Sincronizzazione</p>
                </div>
              </div>

            </div>
          </div>

          {/* // ---------------------
              // CARDS DEI TEST
              // --------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 
                            hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Brain className="w-10 h-10 text-blue-500" />
                <h2 className="text-2xl font-bold ml-3">
                  Test di Ragionamento
                </h2>
              </div>
              <p className="text-gray-600 text-base">
                Valuta la tua capacità di risolvere problemi complessi
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 
                            hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Eye className="w-10 h-10 text-green-500" />
                <h2 className="text-2xl font-bold ml-3">
                  Test di Percezione
                </h2>
              </div>
              <p className="text-gray-600 text-base">
                Misura la tua velocità di elaborazione visiva
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 
                            hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Star className="w-10 h-10 text-purple-500" />
                <h2 className="text-2xl font-bold ml-3">
                  Test di Memoria
                </h2>
              </div>
              <p className="text-gray-600 text-base">
                Verifica le tue capacità di concentrazione
              </p>
            </div>
          </div>

          {/* // ---------------------
              // BENEFITS SECTION (senza "Professionale")
              // --------------------- */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-12">
            <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
              Perché Scegliere il Nostro Test?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 1. ACCURATO */}
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-all">
                <h3 className="text-xl font-semibold mb-3">Accurato</h3>
                <p className="text-gray-600">
                  Risultati dettagliati e precisi
                </p>
              </div>

              {/* 2. COMPLETO */}
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-all">
                <h3 className="text-xl font-semibold mb-3">Completo</h3>
                <p className="text-gray-600">
                  Valutazione su più abilità cognitive
                </p>
              </div>
            </div>

            {/* CTA extra per convertire di più */}
            <div className="mt-8 text-center">
              <p className="text-gray-700 font-medium mb-4">
                Vuoi scoprire il tuo punteggio e accedere ai programmi di allenamento?
              </p>
              <a
                href="/register"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full text-lg
                           font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-xl"
              >
                Attiva la Prova di 7 Giorni <span className="text-sm">(Gratis)</span>
              </a>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
