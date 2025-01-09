// app/page.tsx
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext'; // Importa il contesto di autenticazione

export default function HomePage() {
  const { user } = useAuth(); // Ottieni lo stato dell'utente

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-2xl p-8 text-center text-white mb-16">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6">Allena la Tua Mente</h1>
        <p className="text-xl sm:text-2xl mb-8 font-light">
          Scopri la nostra collezione di giochi e test per migliorare le tue capacità mentali
        </p>
        <Link
          href="/iq"
          className="bg-white text-blue-600 font-bold text-lg px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
        >
          Inizia Ora
        </Link>
      </div>

      {/* Grid delle Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {/* Card 1: Valuta la tua Intelligenza Attuale */}
        <Link
          href="/iq"
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-shadow transform hover:-translate-y-2 transition-transform border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-4">Valuta la tua Intelligenza Attuale</h2>
          <p className="text-gray-600 text-lg">
            Misura le tue capacità cognitive attraverso una valutazione completa che include ragionamento astratto, coordinazione occhio-mano, controllo degli impulsi, memoria a breve termine, velocità di lettura e percezione ritmica.
          </p>
        </Link>

        {/* Card 2: Sudoku */}
        <Link
          href="/sudoku"
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-shadow transform hover:-translate-y-2 transition-transform border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-4">Sudoku</h2>
          <p className="text-gray-600 text-lg">
            Affronta il classico puzzle numerico con diversi livelli di difficoltà. Migliora la tua logica e capacità di problem solving.
          </p>
        </Link>

        {/* Card 3: Tabella di Schulte */}
        <Link
          href="/schulte"
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-shadow transform hover:-translate-y-2 transition-transform border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-4">Tabella di Schulte</h2>
          <p className="text-gray-600 text-lg">
            Migliora la tua velocità di lettura e la percezione visiva periferica. Un esercizio classico per potenziare l&apos;attenzione e la concentrazione.
          </p>
        </Link>
      </div>

      {/* Sezione "Perché Allenare la Mente?" */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">Perché Allenare la Mente?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-4">Migliora l&apos;Attenzione</h3>
            <p className="text-gray-600 text-lg">
              Aumenta la tua capacità di concentrazione e la velocità di elaborazione visiva.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <h3 className="text-xl font-semibold mb-4">Sviluppa il Ragionamento</h3>
            <p className="text-gray-600 text-lg">
              Potenzia le tue capacità logiche e di problem solving attraverso sfide stimolanti.
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold mb-4">Mantieni la Mente Attiva</h3>
            <p className="text-gray-600 text-lg">
              Esercita regolarmente le tue funzioni cognitive per mantenerle efficienti nel tempo.
            </p>
          </div>
        </div>
      </div>

      {/* Sezione Turing™ - Missione e Obiettivi */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">Turing™ - La Collaborazione tra Umano e IA</h2>
        <div className="space-y-8">
          <p className="text-gray-600 text-lg text-center">
            Turing™ è una startup innovativa che mira a migliorare le capacità cognitive umane e dell&apos;intelligenza artificiale attraverso una collaborazione sinergica e non invasiva.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold mb-4">La Nostra Missione</h3>
              <p className="text-gray-600 text-lg">
                Sviluppare strumenti e piattaforme che facilitino l&apos;interazione tra esseri umani e IA, migliorando sia le capacità cognitive umane che le prestazioni dell&apos;IA.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
              <h3 className="text-xl font-semibold mb-4">I Nostri Obiettivi</h3>
              <p className="text-gray-600 text-lg">
                Creare un ecosistema in cui l&apos;IA e gli esseri umani possano collaborare in modo naturale, migliorando la creatività, la risoluzione dei problemi e l&apos;efficienza.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Login e Register */}
      <div className="flex justify-center space-x-4 mt-8">
        <Link 
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
        >
          Register
        </Link>
      </div>

      {/* Pulsante per verificare se l'utente è loggato */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => {
            if (user) {
              alert(`Sei loggato come: ${user.email}`);
            } else {
              alert('Non sei loggato.');
            }
          }}
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Verifica Login
        </button>
      </div>
    </div>
  );
}
