'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Eye,
  Star,
  User,
  Book,
  Music,
  Clock,
  Target,
  Award,
  BarChart,
} from 'lucide-react';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleStartTest = () => {
    router.push('/tests');
  };

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

          {/* TEST CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Brain className="w-10 h-10 text-blue-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Ragionamento</h2>
              </div>
              <p className="text-gray-600 text-base">
                Valuta la tua capacità di risolvere problemi complessi
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Eye className="w-10 h-10 text-green-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Percezione</h2>
              </div>
              <p className="text-gray-600 text-base">
                Misura la tua velocità di elaborazione visiva
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <Star className="w-10 h-10 text-purple-500" />
                <h2 className="text-2xl font-bold ml-3">Test di Memoria</h2>
              </div>
              <p className="text-gray-600 text-base">
                Verifica le tue capacità di memoria e concentrazione
              </p>
            </div>
          </div>

          {/* BENEFITS SECTION */}
          <BenefitsSection />
        </div>
      </main>

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
  );
};

interface SquareBenefitCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const SquareBenefitCard: React.FC<SquareBenefitCardProps> = ({ icon: Icon, title, description, bgColor, iconColor }) => (
  <div className="aspect-square">
    <div className={`${bgColor} w-full h-full p-6 rounded-lg border border-gray-100 hover:opacity-90 transition-all duration-300 flex flex-col justify-between`}>
      <div>
        <Icon className={`w-10 h-10 ${iconColor} mb-4`} />
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      </div>
      <p className="text-white/90 text-sm">{description}</p>
    </div>
  </div>
);

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Standard Avanzati",
      description: "Test sviluppati con tecnologie moderne e intelligenza artificiale",
      bgColor: "bg-gradient-to-br from-blue-600 to-blue-800",
      iconColor: "text-blue-300"
    },
    {
      icon: BarChart,
      title: "Analisi Dettagliata",
      description: "Report completo dei risultati con suggerimenti personalizzati",
      bgColor: "bg-gradient-to-br from-emerald-600 to-emerald-800",
      iconColor: "text-emerald-300"
    },
    {
      icon: Target,
      title: "Valutazione Completa",
      description: "Test che coprono diverse aree cognitive",
      bgColor: "bg-gradient-to-br from-purple-600 to-purple-800",
      iconColor: "text-purple-300"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Perché Scegliere il Nostro Test?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <SquareBenefitCard key={index} {...benefit} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
