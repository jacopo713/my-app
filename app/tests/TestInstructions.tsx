import React from 'react';
import { Clock, Target, AlertCircle, ArrowRight } from 'lucide-react'; // Importa solo le icone necessarie

export interface TestInstructions {
  title: string;
  description: string;
  steps: string[];
  tips: string[];
  duration?: string;
  difficulty?: 'facile' | 'medio' | 'difficile';
  icon?: React.ElementType; // Icona specifica per il test
  gradient?: string; // Gradiente specifico per il test
  iconColor?: string; // Colore dell'icona
}

export type TestPhase = "intro" | "raven" | "eyehand" | "stroop" | "speedreading" | "memory" | "schulte" | "rhythm" | "results";

export const testInstructions: Record<TestPhase, TestInstructions> = {
  intro: {
    title: "Introduzione ai Test Cognitivi",
    description: "Una serie di test per valutare diverse capacità cognitive",
    steps: ["Leggi attentamente le istruzioni di ogni test", "Prenditi il tempo necessario", "Rispondi con attenzione"],
    tips: ["Assicurati di essere in un ambiente tranquillo", "Fai una pausa se necessario"],
    duration: "45-60 minuti totali",
    icon: Clock,
    gradient: "from-blue-600 to-blue-700",
    iconColor: "text-blue-600"
  },
  raven: {
    title: "Test delle Matrici Progressive",
    description: "Valuta la tua capacità di ragionamento logico e la comprensione di pattern visivi.",
    steps: [
      "Ti verranno mostrate delle matrici con un elemento mancante",
      "Analizza attentamente il pattern presente nella matrice",
      "Seleziona tra le opzioni disponibili quella che completa correttamente il pattern",
      "Lavora con precisione ma cerca di mantenere un buon ritmo"
    ],
    tips: [
      "Osserva sia le righe che le colonne per individuare i pattern",
      "Verifica che la tua risposta sia coerente in tutte le direzioni",
      "Non soffermarti troppo a lungo su una singola matrice"
    ],
    duration: "15-20 minuti",
    difficulty: "medio",
    icon: Clock,
    gradient: "from-blue-600 to-blue-700",
    iconColor: "text-blue-600"
  },
  eyehand: {
    title: "Test di Coordinazione Occhio-Mano",
    description: "Misura la tua precisione nel controllo del mouse e la coordinazione visivo-motoria.",
    steps: [
      "Appariranno dei target sullo schermo",
      "Clicca su ciascun target il più rapidamente e precisamente possibile",
      "Mantieni una postura comoda per massimizzare la precisione",
      "Il test termina dopo una serie di target completati"
    ],
    tips: [
      "Trova un ritmo costante tra velocità e precisione",
      "Mantieni il polso in una posizione comoda",
      "Respira normalmente durante l'esecuzione"
    ],
    duration: "5-7 minuti",
    difficulty: "facile",
    icon: Clock,
    gradient: "from-green-600 to-green-700",
    iconColor: "text-green-600"
  },
  stroop: {
    title: "Test di Stroop",
    description: "Valuta la tua capacità di gestire l'interferenza cognitiva e l'attenzione selettiva.",
    steps: [
      "Vedrai parole di colori scritte in colori diversi",
      "Devi selezionare il colore in cui è scritta la parola, non il colore che la parola descrive",
      "Rispondi il più velocemente possibile mantenendo l'accuratezza",
      "Il test si conclude dopo un numero prestabilito di prove"
    ],
    tips: [
      "Concentrati solo sul colore visibile, ignora il significato della parola",
      "Mantieni un ritmo costante",
      "Non esitare troppo su ogni risposta"
    ],
    duration: "5 minuti",
    difficulty: "medio",
    icon: Clock,
    gradient: "from-purple-600 to-purple-700",
    iconColor: "text-purple-600"
  },
  speedreading: {
    title: "Test di Lettura Veloce",
    description: "Misura la tua velocità di lettura e comprensione del testo.",
    steps: [
      "Leggi il testo presentato il più velocemente possibile",
      "Cerca di comprendere il contenuto mentre leggi",
      "Rispondi alle domande di comprensione alla fine",
      "Il tempo di lettura viene registrato automaticamente"
    ],
    tips: [
      "Usa il dito o il cursore come guida se ti aiuta",
      "Evita di rileggere le frasi",
      "Mantieni la concentrazione sul flusso del testo"
    ],
    duration: "10 minuti",
    difficulty: "medio",
    icon: Clock,
    gradient: "from-orange-600 to-orange-700",
    iconColor: "text-orange-600"
  },
  memory: {
    title: "Test di Memoria a Breve Termine",
    description: "Valuta la tua capacità di memorizzare e ricordare informazioni.",
    steps: [
      "Osserva attentamente la sequenza presentata",
      "Memorizza gli elementi mostrati",
      "Riproduci la sequenza quando richiesto",
      "La difficoltà aumenta progressivamente"
    ],
    tips: [
      "Cerca di creare associazioni mentali",
      "Raggruppa gli elementi quando possibile",
      "Mantieni la concentrazione durante la fase di memorizzazione"
    ],
    duration: "7-10 minuti",
    difficulty: "difficile",
    icon: Clock,
    gradient: "from-red-600 to-red-700",
    iconColor: "text-red-600"
  },
  schulte: {
    title: "Tabella di Schulte",
    description: "Migliora la velocità di lettura e l'ampiezza del campo visivo.",
    steps: [
      "Trova i numeri in ordine crescente",
      "Mantieni lo sguardo al centro della tabella",
      "Usa solo gli occhi, non muovere la testa",
      "Completa la sequenza il più velocemente possibile"
    ],
    tips: [
      "Cerca di vedere più numeri contemporaneamente",
      "Non seguire un pattern predefinito",
      "Respira normalmente e mantieni la calma"
    ],
    duration: "3-5 minuti",
    difficulty: "medio",
    icon: Clock,
    gradient: "from-indigo-600 to-indigo-700",
    iconColor: "text-indigo-600"
  },
  rhythm: {
    title: "Test del Ritmo",
    description: "Valuta la tua capacità di percepire e riprodurre sequenze ritmiche.",
    steps: [
      "Ascolta attentamente la sequenza ritmica",
      "Memorizza il pattern presentato",
      "Riproduci il ritmo usando la barra spaziatrice",
      "La complessità aumenta ad ogni livello"
    ],
    tips: [
      "Conta mentalmente il tempo",
      "Concentrati sulla regolarità del ritmo",
      "Non anticipare i battiti"
    ],
    duration: "5 minuti",
    difficulty: "medio",
    icon: Clock,
    gradient: "from-pink-600 to-pink-700",
    iconColor: "text-pink-600"
  },
  results: {
    title: "Risultati dei Test",
    description: "Visualizzazione e interpretazione dei risultati ottenuti.",
    steps: [
      "Analizza i punteggi ottenuti in ogni test",
      "Confronta i risultati con le medie di riferimento",
      "Identifica i tuoi punti di forza e le aree di miglioramento"
    ],
    tips: [
      "Considera il contesto globale dei risultati",
      "Non confrontare direttamente test diversi",
      "Usa i risultati come base per il miglioramento"
    ],
    duration: "N/A",
    icon: Clock,
    gradient: "from-blue-600 to-blue-700",
    iconColor: "text-blue-600"
  }
};

interface TestInstructionsProps {
  phase: TestPhase;
  onStart: () => void;
}

export const TestInstructionsComponent: React.FC<TestInstructionsProps> = ({ phase, onStart }) => {
  const currentTest = testInstructions[phase];

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header fisso con gradiente */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <h1 className="text-xl font-bold text-white">{currentTest.title}</h1>
        </div>
      </div>

      {/* Contenuto principale con margine superiore per evitare sovrapposizioni */}
      <div className="mt-16"> {/* Aggiungi margine superiore per evitare sovrapposizioni */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Istruzioni</h2>
          <div className="space-y-6">
            {/* Informazioni chiave in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Durata */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Durata</h3>
                </div>
                <p className="text-gray-700">{currentTest.duration}</p>
              </div>

              {/* Obiettivo */}
              <div className="bg-green-50 rounded-xl p-4 sm:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Obiettivo</h3>
                </div>
                <p className="text-gray-700">Completa il test con precisione e velocità&apos;.</p>
              </div>
            </div>

            {/* Procedura con numerazione migliorata */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Procedura</h3>
              <div className="space-y-3">
                {currentTest.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Box Suggerimenti ridisegnato */}
            <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-400">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold">Suggerimenti per l&apos;esecuzione</h3>
              </div>
              <ul className="list-disc list-inside text-gray-700">
                {currentTest.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Timer e Avvio */}
            <div className="space-y-4">
              <button
                onClick={onStart}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl 
                  font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-px
                  flex items-center justify-center gap-2"
              >
                <span className="text-lg">Inizia il Test</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-sm text-gray-500">
                Timer partirà automaticamente all&apos;avvio del test
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
