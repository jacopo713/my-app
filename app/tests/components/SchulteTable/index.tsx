import { useState, useEffect, useCallback, useRef } from "react";
import { Clock } from "lucide-react";

interface SchulteTableProps {
  onComplete: (results: SchulteResults) => void;
}

interface SchulteResults {
  score: number;
  accuracy: number;
  averageTime: number;
  gridSizes: number[];
  completionTimes: number[];
  percentile: number;
}

interface LevelResult {
  time: number;
  size: number;
}

interface NeurofeedbackParams {
  duration: number;
  interval: number;
  maxGain: number;
  startFreq: number;
  endFreq: number;
  rampType: 'linear';
  fadeOut: number;
}

export default function SchulteTable({ onComplete }: SchulteTableProps) {
  // Stati base
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [testLevel, setTestLevel] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);

  // Gestione Audio Context per Neurofeedback
  const audioContextRef = useRef<AudioContext | null>(null);

  // Parametri base
  const sizes = [2, 4, 6];
  const currentSize = sizes[testLevel];
  const maxTimePerLevel = 300; // Tempo massimo per livello in secondi

  // Parametri Neurofeedback Ottimizzati
  const neurofeedbackParams: NeurofeedbackParams = {
    duration: 0.08,    // 80ms
    interval: 0.5,     // 500ms tra feedback
    maxGain: 0.04,     // gain minimo efficace
    startFreq: 440,    // Frequenza di partenza (A4)
    endFreq: 420,      // Frequenza di arrivo
    rampType: 'linear',
    fadeOut: 0.05      // Fade out graduale
  };

  // Inizializzazione Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContextConstructor = (window.AudioContext || window.webkitAudioContext) as typeof AudioContext;
      audioContextRef.current = new AudioContextConstructor();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Sistema Neurofeedback
  const playNeurofeedback = useCallback(() => {
    if (!audioContextRef.current) return;

    const currentTime = Date.now();
    if (currentTime - lastFeedbackTime < neurofeedbackParams.interval * 1000) {
      return; // Previene sovrastimolazione
    }
    setLastFeedbackTime(currentTime);

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const filter = audioContextRef.current.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(
      neurofeedbackParams.startFreq,
      audioContextRef.current.currentTime
    );
    oscillator.frequency.linearRampToValueAtTime(
      neurofeedbackParams.endFreq,
      audioContextRef.current.currentTime + neurofeedbackParams.duration
    );

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      neurofeedbackParams.maxGain,
      audioContextRef.current.currentTime + neurofeedbackParams.duration * 0.2
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      audioContextRef.current.currentTime + neurofeedbackParams.duration
    );

    filter.type = 'bandpass';
    filter.frequency.value = (neurofeedbackParams.startFreq + neurofeedbackParams.endFreq) / 2;
    filter.Q.value = 0.3;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + neurofeedbackParams.duration);
  }, [lastFeedbackTime, neurofeedbackParams]);

  // Generazione numeri in modo casuale
  const generateNumbers = useCallback((): number[] => {
    const totalNumbers = currentSize * currentSize;
    const nums = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  }, [currentSize]);

  // Inizializza la griglia quando il gioco è attivo
  useEffect(() => {
    if (gameStarted) {
      setNumbers(generateNumbers());
    }
  }, [gameStarted, generateNumbers]);

  // Gestione timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isCompleted]);

  // Formattazione del tempo in minuti e secondi
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Avvio del livello
  const startNextLevel = useCallback(() => {
    setCurrentNumber(1);
    setTimer(0);
    setGameStarted(true);
    setShowInstructions(false);
    setIsCompleted(false);
  }, []);

  // Funzione per calcolare i risultati finali
  // Utilizziamo la formula: normalizedScore = (1 - averageTime / maxTimePerLevel) * 1000
  // Se l'averageTime è 150, il punteggio sarà 500, che corrisponde al 50° percentile.
  const handleLevelComplete = useCallback(() => {
    console.log("Livello completato:", currentSize, "x", currentSize);
    const currentResult = { time: timer, size: currentSize };
    setLevelResults(prev => [...prev, currentResult]);

    if (testLevel === sizes.length - 1) {
      // Fine del test
      const updatedResults = [...levelResults, currentResult];
      const averageTime =
        updatedResults.reduce((acc, curr) => acc + curr.time, 0) / updatedResults.length;
      const normalizedScore = Math.round((1 - averageTime / maxTimePerLevel) * 1000);
      // Calcola il percentile in modo lineare (score massimo 1000 corrisponde al 100° percentile)
      const percentile = Math.round((normalizedScore / 1000) * 100);

      onComplete({
        score: normalizedScore,
        accuracy: 100,
        averageTime,
        gridSizes: updatedResults.map(r => r.size),
        completionTimes: updatedResults.map(r => r.time),
        percentile
      });
    } else {
      // Passa al livello successivo
      setTimeout(() => {
        setTestLevel(prev => prev + 1);
        setCurrentNumber(1);
        setIsCompleted(false);
        setGameStarted(true);
        setTimer(0);
      }, 2000);
    }
  }, [timer, currentSize, testLevel, levelResults, sizes.length, maxTimePerLevel, onComplete]);

  // Gestione del clic sui numeri
  const handleNumberClick = useCallback((number: number) => {
    if (!gameStarted || isCompleted) return;

    if (number === currentNumber) {
      playNeurofeedback();

      if (number === currentSize * currentSize) {
        // Se si clicca l'ultimo numero, completa il livello
        setGameStarted(false);
        setIsCompleted(true);
        handleLevelComplete();
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    }
  }, [gameStarted, isCompleted, currentNumber, currentSize, timer, testLevel, levelResults, sizes.length, onComplete, playNeurofeedback, handleLevelComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4">
        {showInstructions ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Test di Attenzione - Tabella di Schulte
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-700">Istruzioni:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Completerai tre livelli di difficoltà crescente</li>
                <li>In ogni livello, trova e clicca i numeri in ordine crescente</li>
                <li>Mantieni lo sguardo fisso al centro della griglia</li>
                <li>Utilizza la visione periferica per individuare i numeri</li>
                <li>La velocità e la precisione sono entrambe importanti</li>
              </ul>
            </div>
            <button
              onClick={startNextLevel}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Inizia il Test
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-mono text-lg text-gray-800">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="text-gray-600">
                Livello {testLevel + 1}/3 ({currentSize}x{currentSize})
              </div>
            </div>

            <div className="w-11/12 mx-auto">
              <div
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${currentSize}, minmax(0, 1fr))`,
                  gap: "1px",
                }}
              >
                {numbers.map((number, index) => (
                  <button
                    key={index}
                    onClick={() => handleNumberClick(number)}
                    className={`
                      aspect-square flex items-center justify-center
                      text-sm sm:text-base font-bold rounded-lg
                      transition-colors duration-200
                      ${
                        number < currentNumber
                          ? "bg-green-100 text-green-700 border border-green-500"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }
                      ${!gameStarted ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    `}
                    disabled={!gameStarted || isCompleted}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>

            {isCompleted && testLevel < sizes.length - 1 && (
              <div className="mt-4 text-center text-gray-600">
                Preparati per il prossimo livello...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

