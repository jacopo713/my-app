// app/tests/data/istruzioni.ts

export interface TestInstructions {
  title: string;
  description: string;
  steps: string[];
  tips: string[];
  duration?: string;
  difficulty?: 'facile' | 'medio' | 'difficile';
}

export type TestPhase = "intro" | "raven" | "eyehand" | "stroop" | "speedreading" | "memory" | "schulte" | "rhythm" | "results";

export const testInstructions: Record<TestPhase, TestInstructions> = {
  intro: {
    title: "Introduzione ai Test Cognitivi",
    description: "Una serie di test per valutare diverse capacità cognitive",
    steps: ["Leggi attentamente le istruzioni di ogni test", "Prenditi il tempo necessario", "Rispondi con attenzione"],
    tips: ["Assicurati di essere in un ambiente tranquillo", "Fai una pausa se necessario"],
    duration: "45-60 minuti totali"
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
    difficulty: "medio"
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
    difficulty: "facile"
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
    difficulty: "medio"
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
    difficulty: "medio"
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
    difficulty: "difficile"
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
    difficulty: "medio"
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
    difficulty: "medio"
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
    duration: "N/A"
  }
};
export default TestInstructions;

