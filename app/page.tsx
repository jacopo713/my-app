// app/page.tsx
'use client';

import { useState } from 'react';
import { 
  Brain, Eye, Star, User, Book, Music, Clock, Target, Award 
} from 'lucide-react';

// Icona hamburger (puoi anche usare Lucide: <Menu />, oppure un svg custom)
function HamburgerIcon() {
  return (
    <svg 
      className="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4 6h16M4 12h16M4 18h16" 
      />
    </svg>
  );
}

export default function HomePage() {
  // Gestisce l'apertura/chiusura del menù mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-center h-16">
            
            {/* Logo e Nome */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Turing™
                </span>
              </div>
            </div>

            {/* NAVBAR Desktop (md: visibile, mobile: hidden) */}
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

              {/* Pulsanti 'Accedi' e 'Inizia Ora' (Desktop) */}
              <a
                href="/login"
                className="flex items-center space-x-2 bg-white border border-blue-600 text-blue-600 
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

            {/* BOTTONE HAMBURGER (visibile solo su mobile) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <HamburgerIcon />
              </button>
            </div>

          </div>
        </div>

        {/* MENU MOBILE (compare solo se mobileMenuOpen = true) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-inner">
            <div className="px-4 pt-4 pb-2 space-y-2">
              <a 
                href="/tests" 
                className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Test IQ
              </a>
              <a 
                href="/about" 
                className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Chi Siamo
              </a>
              <a 
                href="/contact" 
                className="block text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contatti
              </a>

              {/* Pulsanti 'Accedi' e 'Inizia Ora' (Mobile) */}
              <a
                href="/login"
                className="block bg-white border border-blue-600 text-blue-600 
                           hover:bg-blue-50 px-4 py-2 rounded-full transition-all duration-200 text-center"
              >
                Accedi
              </a>
              <a
                href="/register"
                className="block bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 
                           rounded-full transition-all duration-200 text-center"
              >
                Inizia Ora
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN (resto della pagina) */}
      <main className="pt-16">
        {/* ... il contenuto che hai già (Hero Section, Cards, etc.) ... */}
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-3xl font-bold">Contenuto principale</h1>
          <p className="mt-4 text-gray-700">
            Qui va tutto il tuo Hero, i test, i benefici, ecc.
          </p>
        </div>
      </main>
    </div>
  );
}

